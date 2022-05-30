import { parse } from "graphql";
import { sendForbidden } from "../httpUtils";
import jwt_decode from "jwt-decode";
import {
  arrangerQueryVisitor,
  extractReadPermissions,
  extractSecurityTags,
  translateRsNameToGqlType,
} from "../permissionsUtils.js";
import {
  analyses,
  patients,
  prescriptions,
  rsPatient,
  rsServiceRequest,
  rsSVariants,
  sequencings,
  variants,
} from "../../config/vars.js";

const translationRsNameToGqlType = {
  ServiceRequest: [prescriptions, analyses, sequencings],
  Patient: patients,
  Variants: variants,
};

/**
 * Forbid mutation
 * @param {Object} ast - abstract syntax tree (parsed graphql query)
 * @description a graphql query can contain various operation such as "query", "introspection",  "mutation" and so forth.
 * We do not want mutations since we want this service to offer read-only capabilities.
 */
const containsAtLeastOneMutationOperation = (ast) =>
  ast.definitions.some((d) => d.operation === "mutation");

export default (req, res, next) => {
  const decodedRpt = jwt_decode(req.headers.authorization);

  const ast = parse(req.body?.query);
  if (containsAtLeastOneMutationOperation(ast)) {
    return sendForbidden(res);
  }

  const rsReadPermissions = extractReadPermissions(decodedRpt, [
    rsServiceRequest,
    rsPatient,
    rsSVariants,
  ]);
  const gqlReadPermissions = translateRsNameToGqlType(
    rsReadPermissions,
    translationRsNameToGqlType
  );

  const initialValidationState = {
    gqlReadPermissions,
    permissionsFailed: false,
    addSecurityTags: false,
    filtersVariableNames: new Set(),
    hasPrescriptions: false,
  };
  const validationState = arrangerQueryVisitor(ast, initialValidationState);
  if (validationState.permissionsFailed) {
    return sendForbidden(res);
  }

  if (validationState.addSecurityTags) {
    const gqlQueryVariables = req.body.variables || {};
    const sqonAlias = [...validationState.filtersVariableNames][0];
    const sqon = gqlQueryVariables[sqonAlias] ?? { content: [], op: "and" };
    const userSecurityTags = extractSecurityTags(decodedRpt);
    const secureSqon = {
      content: [
        {
          op: "or",
          content: [
            {
              content: {
                field: "securityTags",
                value: userSecurityTags,
              },
              op: "in",
            },
            {
              content: {
                field: "security_tags",
                value: userSecurityTags,
              },
              op: "in",
            },
          ],
        },
        validationState.hasPrescriptions
          ? {
              content: {
                field: "patientInfo.securityTags",
                value: userSecurityTags,
              },
              op: "in",
            }
          : null,
        { ...sqon },
      ].filter((p) => !!p),
      op: "and",
    };

    req.body.variables = {
      ...gqlQueryVariables,
      [sqonAlias]: secureSqon,
    };
  }

  next();
};
