import { BREAK, parse, visit } from "graphql";
import { sendForbidden } from "../httpUtils";
import jwt_decode from "jwt-decode";

const translationRsNameToGqlType = {
  ServiceRequest: "Prescriptions",
  Patient: "Patients",
};

const rsNamesRequiringPermission = {
  fromToken: ["ServiceRequest", "Patient"],
  fromGql: ["Prescriptions", "Patients"],
};

/**
 * Extract from rpt token read permission(s) for fields of interest
 * @param {Object} parsedToken
 * @param {Object[]} parsedToken.authorization.permissions
 * @param {string} parsedToken.authorization.permissions[].rsname
 * @param {string[]} parsedToken.authorization.permissions[].scopes
 */
const extractReadPermissions = (parsedToken) =>
  (parsedToken?.authorization?.permissions || []).reduce(
    (xs, x) =>
      rsNamesRequiringPermission.fromToken.includes(x.rsname) &&
      x.scopes?.includes("read")
        ? [...xs, translationRsNameToGqlType[x.rsname]]
        : xs,
    []
  );

/**
 * Extract from rpt token security tags
 * @param {Object} parsedToken
 * @param {string[]} parsedToken.fhir_organization_id
 */
const extractSecurityTags = (parsedToken) =>
  parsedToken.fhir_organization_id || [];

/**
 * Allow only "query" type of operation
 * @param {Object} ast - abstract syntax tree (parsed graphql query)
 * @description a graphql query can contain various operation such as "query" or "mutation".
 * We allow only "query" since we want this service to offer read-only capabilities.
 */
const operationsAllowed = (ast) =>
  ast.definitions.every((d) => d.operation === "query");

const fieldRequiresVerification = (fieldName) =>
  rsNamesRequiringPermission.fromGql.includes(fieldName);

/**
 * Find the variable name of the "filters" argument of the "hits" field.
 * @params {Object[]} args - arguments of graphql Field
 * @params {Object} args.name
 * @params {string} args.name.value
 * @description By convention, the name of the variable of the "filters" argument is "sqon". However, nothing
 * can prevent someone to use another name. Therefore, we find the name of the variable dynamically.
 *  Example:
 *   query A($sqon: JSON) { Prescriptions { hits(filters: $sqon){...} } }
 *  is equivalent to
 *   query A($foo: JSON) { Prescriptions { hits(filters: $foo){...} } }
 * */
const findVarNameOfFiltersArg = (argumentsOfField) =>
  argumentsOfField.find((arg) => arg.name.value === "filters")?.value?.name
    ?.value || null;

/**
 * Verify that only one "sqon" (or filters value) is used in a query
 * @params {Set} s - set empty or containing the name of the variable of the filters argument
 * @description It is possible to query documents without passing any filters. It can show potentially all documents
 *  Example:
 *   query A { Prescriptions { hits {...} } }
 *  Adding a "sqon" to the variables object will have no effects. So, we forbid that kind of query.
 *
 *  Another scenario is when multiple filters are used:
 *   query B($x: JSON, $y: JSON) { Prescriptions { hits(filters: $x) {...} aggregations(filters: $y) {...}} }
 *  For the sake of simplicity, it is therefore forbidden to use multiple "sqons".
 * */
const containsMultipleFilters = (s) => s.size > 1;

export default (req, res, next) => {
  const decodedToken = jwt_decode(req.headers.authorization);
  const ast = parse(req.body?.query);
  if (!operationsAllowed(ast)) {
    return sendForbidden(res);
  }

  const readPermissions = extractReadPermissions(decodedToken);

  const verificationState = {
    permissionsFailed: false,
    addSecurityTags: false,
    filtersVariableNames: new Set(),
  };

  visit(ast, {
    Field: {
      leave(field) {
        const fieldName = field.name.value;
        if (fieldRequiresVerification(fieldName)) {
          if (!readPermissions.includes(fieldName)) {
            verificationState.permissionsFailed = true;
            return BREAK;
          }
          verificationState.addSecurityTags = true;
        }
        if (["hits", "aggregations"].includes(fieldName)) {
          const filtersVarName = findVarNameOfFiltersArg(field.arguments);
          const hasNoFiltersArgument = !filtersVarName;
          if (hasNoFiltersArgument) {
            verificationState.permissionsFailed = true;
            return BREAK;
          }
          verificationState.filtersVariableNames.add(filtersVarName);
          if (containsMultipleFilters(verificationState.filtersVariableNames)) {
            verificationState.permissionsFailed = true;
            return BREAK;
          }
        }
      },
    },
  });

  if (verificationState.permissionsFailed) {
    return sendForbidden(res);
  }

  if (verificationState.addSecurityTags) {
    const gqlQueryVariables = req.body.variables || {};
    const sqonAlias = [...verificationState.filtersVariableNames][0];
    const sqon = gqlQueryVariables[sqonAlias] ?? { content: [], op: "and" };
    const sqonSecurityTags = {
      content: {
        field: "securityTags",
        value: extractSecurityTags(decodedToken),
      },
      op: "in",
    };
    const sqonWithSecurityTags = {
      ...sqon,
      content: [...(sqon.content || []), sqonSecurityTags],
    };

    req.body.variables = {
      ...gqlQueryVariables,
      [sqonAlias]: sqonWithSecurityTags,
    };
  }
  next();
};
