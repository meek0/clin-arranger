export const POST = "POST";
export const GET = "GET";

export const sendForbidden = (res) =>
  res.status(403).send({ code: 403, message: "Access denied" });
export const sendNotFound = (res) => res.sendStatus(404);
export const sendBadRequest = (res) => res.sendStatus(400);
