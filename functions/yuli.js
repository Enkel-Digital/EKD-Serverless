const sgMail = require("@sendgrid/mail");
const functions = require("firebase-functions");
const request = require("request-promise-native");

const recaptchaSecret = functions.config().recaptcha.key;

sgMail.setApiKey(functions.config().sendgrid_api.key);

/**
 * Sends email about the request to Yuli
 * @function notifyYuli
 * @param data
 */
function notifyYuli(data) {
  // Remove the captcha token to prevent it from being included in the contact request email
  delete data["g-recaptcha-response"];

  let html = `
    <h4>Hi there! Someone made a request to get in touch on your website!</h4><br />
    Below are the details that we recieved:<br /><br />
  `;

  // Add all data to the HTML mail body with newlines
  for (let [key, value] of Object.entries(data))
    html += `<br />${key}: ${value}`;

  // Construct the message object
  const msg = {
    to: "yuliatiyuli39@gmail.com",
    bcc: "JJ@enkeldigital.com",
    from: "sendgrid@enkeldigital.com",
    subject: "New 'get in touch' form submitted on yuli.enkeldigital.com",
    html,
  };

  sgMail.send(msg);
}

/**
 * Verify the captcha token sent along with the form data
 * @function verifyCaptcha
 * @param data
 */
async function verifyCaptcha(data) {
  // Get the re captcha token for verification
  const captchaToken = data["g-recaptcha-response"];

  if (!captchaToken)
    throw new Error(`Invalid recaptcha token - ${captchaToken}`);

  // Create the captcha verification URL with query parameters
  let verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`;

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
    json: true,
  });

  if (!response.success) throw new Error(response["error-codes"]);
}

exports.yuliGetInTouch = functions.https.onRequest(async (req, res) => {
  try {
    // Parse the body string into JSON
    const data = JSON.parse(req.body);

    // @todo implement recaptcha
    // Await the captcha verification
    // await verifyCaptcha(data);
    // Only notifyYuli if captcha is verified
    notifyYuli(data);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
