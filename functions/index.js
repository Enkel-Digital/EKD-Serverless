const sgMail = require("@sendgrid/mail");
const functions = require("firebase-functions");

sgMail.setApiKey(functions.config().sendgrid_api.key);

/**
 * Sends email to the client to notify them that the team has been notified of their request
 * @function notifyUser
 * @param data
 */
async function notifyUser(data) {
  const msg = {
    to: data.email,
    from: "support@enkeldigital.com",
    subject: "Contact Form submitted!",
    /** @todo Use a template to respond to the user */
    html:
      "Thanks for getting in contact with us!<br />We will get back to you as soon as possible, for urgent enquiries, please call: +65 94263687"
  };
  await sgMail.send(msg);
}

/**
 * Sends email to the customer support team to notify them of new client request
 * @function notifyTeam
 * @param data
 */
async function notifyTeam(data) {
  let html = "";

  // Add all data to the HTML mail body with newlines
  for (let [key, value] of Object.entries(data))
    html += `<br />${key}: ${value}`;

  // Construct the message object
  const msg = {
    to: "support@enkeldigital.com",
    from: "sendgrid@enkeldigital.com",
    subject: "New contact form submitted",
    html
  };
  await sgMail.send(msg);
}

async function saveDetails(data) {
  // write to DB
}

exports.contactForm = functions.https.onRequest(async (req, res) => {
  // Parse the body string into JSON
  const data = JSON.parse(req.body);

  await saveDetails(data);
  await notifyTeam(data);
  await notifyUser(data);

  res.json({ success: true });

  res.status(200).end();
});
