const sgMail = require("@sendgrid/mail");
const functions = require("firebase-functions");
const request = require("request-promise-native");

const recaptchaSecret = functions.config().recaptcha.key;

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
  try {
    // Parse the body string into JSON
    const data = JSON.parse(req.body);

    // Get the re captcha token for verification
    const captchaToken = data["g-recaptcha-response"];

    // Remove the captcha token to prevent it from being included in the contact request email
    delete data["g-recaptcha-response"];

    if (!captchaToken) throw new Error("Invalid recaptcha token");

    // Create the captcha verification URL with query parameters
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`;

    // If a remote ip is available, add it to the verifyURL
    const remoteip = req.ip || req.connection.remoteAddress;
    if (remoteip) verifyURL += `&remoteip=${remoteip}`;

    /**
     * Call the recaptcha API to verify the captcha token
     *
     * @example API response from captcha verification
     * {
     *   "success": true|false,
     *   "challenge_ts": timestamp,  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
     *   "hostname": string,         // the hostname of the site where the reCAPTCHA was solved
     *   "error-codes": [...]        // optional
     * }
     */
    const response = await request.post(verifyURL, {
      headers: { "content-type": "application/JSON" },
      json: true
    });

    if (!response.success) throw new Error(response["error-codes"]);

    await saveDetails(data);
    await notifyTeam(data);
    await notifyUser(data);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
