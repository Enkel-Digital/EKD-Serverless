import * as functions from "firebase-functions";
import * as sgMail from "@sendgrid/mail";

sgMail.setApiKey(functions.config().sendgrid_api.key);

interface UserData {
  fname?: string;
  lname?: string;
  email: string;
  subject?: string;
  message?: string;
}

/**
 * Sends email to the client to notify them that the team has been notified of their request
 * @function notifyUser
 * @param {UserData} userData
 */
async function notifyUser(userData: UserData) {
  const msg = {
    to: userData.email,
    from: "support@enkeldigital.com",
    subject: "Contact Form submitted!",
    html:
      "Thanks for getting in contact with us!<br />We will get back to you as soon as possible, for urgent enquiries, please call: +65 94263687"
    // Use a template to respond to the user
  };
  await sgMail.send(msg);
}

/**
 * Sends email to the customer support team to notify them of new client request
 * @function notifyTeam
 * @param {UserData} userData
 */
async function notifyTeam(userData: UserData) {
  let html = "";
  for (let [key, value] of Object.entries(userData))
    html += `${key}: ${value} <br />`;

  const msg = {
    to: "support@enkeldigital.com",
    from: "sendgrid@enkeldigital.com",
    subject: "New contact form submitted",
    html
  };
  await sgMail.send(msg);
}

// export const contactForm = functions.https.onCall((req, res) => { // For SDK to use as a method
export const contactForm = functions.https.onRequest(async (req, res) => {
  const { fname, lname, email, subject, message } = req.body;
  const userData: UserData = { fname, lname, email, subject, message };

  // If neither name is given, or email is not given. End req and return error
  if ((!fname && !lname) || !email)
    res.json({ success: false, error: "Missing user email" });

  await notifyTeam(userData);
  await notifyUser(userData);

  res.json({ success: true });
});
