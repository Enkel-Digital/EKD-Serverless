# EKD-Serverless
This repo contains serverless functions used for Enkel Digital's website.  
These are Express JS based serverless functions hosted with firebase.  
The functions available and their step by step workings are listed below.  


## Run/Build and Deployment
To serve functions for testing, run serve script defined in package.json
```
npm run serve
```
To Deploy functions only, run deploy script defined in package.json
```
npm run deploy
```

---
## "Subscribe" newsletter function
### Execution Flow:
- HTTP POST request triggers this CF
- Store the email into the Database
- Send a email about this to "notifications@enkeldigital.com"
    - Test using SendGrid to send the email
- Send the user a personalized message thanking him/her for subscribing.
    - Test using SendGrid to send the email