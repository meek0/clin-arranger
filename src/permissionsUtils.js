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
  (rsnames || []).map((r) => mRsnameToGqlType[r]);

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
