import { BREAK, visit } from "graphql";
import {
  patients,
  prescriptions,
  rsSVariants,
  variants,
  analyses,
  sequencings,
} from "../config/vars.js";

/**
 * Extract from rpt token read permission(s) for fields of interest
 * @param {Object} parsedToken
 * @param {string[]} resourcesRequiringPermissions
 * @param {{scopes: string[], rsname: string}[]} parsedToken.authorization.permissions
 */
export const extractReadPermissions = (
  parsedToken,
  resourcesRequiringPermissions
) =>
  (parsedToken?.authorization?.permissions || []).reduce(
    (xs, x) =>
      resourcesRequiringPermissions.includes(x.rsname) &&
      x.scopes?.includes("read")
        ? [...xs, x.rsname]
        : xs,
    []
  );

/**
 * Translate resource to its graphql type
 * @param {string[]} rsnames
 * @param {Object} mRsnameToGqlType
 */
export const translateRsNameToGqlType = (rsnames, mRsnameToGqlType) =>
  (rsnames || []).map((r) => mRsnameToGqlType[r] ?? []).flat();

/**
 * Extract from rpt token security tags
 * @param {Object} parsedToken
 * @param {string[]} parsedToken.fhir_organization_id
 */
export const extractSecurityTags = (parsedToken) =>
  parsedToken.fhir_organization_id || [];

/**
 * Check if x and y have at least one security tag in common
 * @param {string[]} yTags
 * @param {string[]} xTags
 */
export const haveNonEmptyTagsIntersection = (yTags, xTags) =>
  yTags.some((yt) => xTags.includes(yt));

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
 * Verify that only one "sqon" (or filters arg value) is used in a query
 * @params {Set} s - set empty or containing the name of the variable of the filters argument
 * @description It is possible to query documents without passing any filters. It can show potentially all documents
 *  Example:
 *   query A { Prescriptions { hits {...} } }
 *  Adding a "sqon" to the variables object will have no effects. So, we forbid that kind of query.
 *
 *  Another scenario is when multiple filters are used:
 *   query B($x: JSON, $y: JSON) { Prescriptions { hits(filters: $x) {...} } Patients { hits(filters: $y) {...} }
 *  For the sake of simplicity, we therefore forbid to use multiple "sqon" filters.
 * */
const containsMultipleFilters = (s) => s.size > 1;

/**
 * @params {string} fieldName - current graphql field being explored
 * */
const fieldRequiresVerification = (fieldName) =>
  [prescriptions, patients, variants, analyses, sequencings].includes(
    fieldName
  );

/**
 * @params {string} fieldName - current graphql field being explored
 * @params {string[]} gqlReadPermissions - read permissions from token that were translated to graphl
 * */
const fieldIsIncludedInToken = (fieldName, gqlReadPermissions) =>
  gqlReadPermissions.includes(fieldName);

/**
 * @params {object} ast - abstract syntax tree (parsed graphql query in our case)
 * @params {object} state - initial state that will be updated if needed. This state will determine
 * further actions related to permissions.
 * */
export const arrangerQueryVisitor = (ast, state) => {
  const validationState = { ...state };
  visit(ast, {
    Field: {
      leave(field) {
        const fieldName = field.name.value;
        if (fieldRequiresVerification(fieldName)) {
          if (
            !fieldIsIncludedInToken(
              fieldName,
              validationState.gqlReadPermissions
            )
          ) {
            validationState.permissionsFailed = true;
            return BREAK;
          }

          if (fieldName === variants) {
            // if one has read permission on variants in its token it's fine - nothing else to manipulate.
            return;
          }

          if (fieldName === prescriptions) {
            validationState.hasPrescriptions = true;
          }

          // Take the closest hitsNode if it exists from node of interest (ex: Patients).
          const hitsNode = field.selectionSet?.selections?.find(
            (s) => s?.name?.value === "hits"
          );
          if (hitsNode) {
            const filtersVarName = findVarNameOfFiltersArg(hitsNode.arguments);
            const hasNoFiltersArgument = !filtersVarName;
            if (hasNoFiltersArgument) {
              validationState.permissionsFailed = true;
              return BREAK;
            }
            validationState.addSecurityTags = true;
            validationState.filtersVariableNames.add(filtersVarName);
            if (containsMultipleFilters(validationState.filtersVariableNames)) {
              validationState.permissionsFailed = true;
              return BREAK;
            }
          }
        }
      },
    },
  });
  return validationState;
};

/**
 * permissions needed to read variants suggestions
 * */
export const VARIANTS_READ_PERMISSION_ENFORCER = `${rsSVariants}:read`;
