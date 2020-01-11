import * as functions from "firebase-functions";
export * from "./mail";

export const ping = functions.https.onRequest((req, res) => {
  res.json({ success: true, status: 200 });
});
