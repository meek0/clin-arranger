export const POST = "POST";
export const GET = "GET";

export const sendForbidden = (res) => res.sendStatus(403);
export const sendNotFound = (res) => res.sendStatus(400);
