import { POST, GET, sendNotFound } from "../httpUtils.js";

const regexArrangerProjectId = /^clin_(?:\d{4}_\d{1,2}_\d{1,2}_v\d{1,3}|staging)$/;

const indexOfProjectId = 1;
const indexOfAction = 2;
const maxNOfPathSegments = 3;

const pathIsAllowed = (path) => {
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
