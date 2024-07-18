import { parse } from "graphql";
import { sendForbidden } from "../httpUtils.js";
import jwt_decode from "jwt-decode";
import {
  isGenetician,
  arrangerQueryVisitor,
  extractReadPermissions,
  extractSecurityTags,
  translateRsNameToGqlType,
} from "../permissionsUtils.js";
import {
  coverages,
  analyses,
  rsServiceRequest,
  rsSVariants,
  sequencings,
  variants,
  cnv,
  genes,
} from "../../config/vars.js";
import usersApiClient from '../../services/variantPropertiesUtils.js';

const translationRsNameToGqlType = {
  ServiceRequest: [analyses, sequencings],
  Variants: [variants, cnv, genes, coverages],
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
  };
  const validationState = arrangerQueryVisitor(ast, initialValidationState);
  if (validationState.permissionsFailed) {
    return sendForbidden(res);
  }

  usersApiClient.interceptors.request.use((r) => {
    r.headers['Authorization'] = req.headers.authorization;
    return r;
  });

  if (!isGenetician(decodedRpt) && validationState.addSecurityTags) {
    const gqlQueryVariables = req.body.variables || {};
    const sqonAlias = [...validationState.filtersVariableNames][0];
    const sqon = gqlQueryVariables[sqonAlias] ?? { content: [], op: "and" };
    const userSecurityTags = extractSecurityTags(decodedRpt);
    const secureSqon = {
      content: [
        {
          content: {
            field: "security_tags",
            value: userSecurityTags,
          },
          op: "in",
        },
        { ...sqon },
      ],
      op: "and",
    };

    req.body.variables = {
      ...gqlQueryVariables,
      [sqonAlias]: secureSqon,
    };
  }
  next();
};
