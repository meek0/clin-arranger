import { POST, GET, sendNotFound } from "../httpUtils.js";

const regexArrangerProjectId = /^(?:clin*|admin)/;

const indexOfProjectId = 1;
const indexOfAction = 2;
const maxNOfPathSegments = 3;

export const pathIsAllowed = (path) => {
  const split = path.split("/");
  return (
    split.length === maxNOfPathSegments &&
    ["graphql", "ping"].includes(split[indexOfAction]) &&
    regexArrangerProjectId.test(split[indexOfProjectId])
  );
};

export default (req, res, next) => {
  if ([POST, GET].includes(req.method) && pathIsAllowed(req.path)) {
    return next();
  }
  return sendNotFound(res);
};
