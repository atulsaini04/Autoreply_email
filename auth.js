const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
];
const TOKEN_PATH = "token.json";

async function authenticateWithGoogle() {
    const content = fs.readFileSync("credentials.json");
    const credentials = JSON.parse(content);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    try {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token).tokens);
        return oAuth2Client;
    } catch (err) {
        return await getNewToken(oAuth2Client);
    }
}

async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.modify",
        ].join(" "), // Combine scopes into a single string
    });

    console.log("Authorize this app by visiting this URL:", authUrl);

    const code = await getUserCodeFromConsole();

    const token = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(token.tokens);

    // Save the token to disk for later program executions
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log("Token stored to", TOKEN_PATH);

    return oAuth2Client;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function getUserCodeFromConsole() {
    return new Promise((resolve) => {
        rl.question("Enter the authorization code: ", (code) => {
            rl.close();
            resolve(code);
        });
    });
}
module.exports = {
    authenticateWithGoogle,
};