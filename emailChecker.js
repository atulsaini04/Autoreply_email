const { google } = require("googleapis");

async function checkForNewEmails(auth) {
    const gmail = google.gmail({ version: "v1", auth });

    try {
        // Get the list of messages from the inbox
        const response = await gmail.users.messages.list({
            userId: "me",
            labelIds: ["INBOX"], // You can customize labels as needed
        });

        const messages = response.data.messages;

        // Filter messages that have not been replied to
        const unrepliedMessages = await filterUnrepliedMessages(auth, messages);

        return unrepliedMessages;
    } catch (error) {
        console.error("Error checking for new emails:", error.message);
        throw error;
    }
}

async function filterUnrepliedMessages(auth, messages) {
    const unrepliedMessages = [];

    for (const message of messages) {
        // Check if the message has been replied to
        const { hasReplied, headers } = await hasRepliedToMessage(auth, message.id);
        if (!hasReplied) {
            unrepliedMessages.push({ email: message, headers: headers });
        }
    }

    return unrepliedMessages;
}

async function hasRepliedToMessage(auth, messageId) {
    const gmail = google.gmail({ version: "v1", auth });

    try {
        // Get the message details
        const response = await gmail.users.messages.get({
            userId: "me",
            id: messageId,
        });

        const headers = response.data.payload.headers;

        // Check if the message has your email address in the 'From' field
        const hasSentByYou = headers.some(
            (header) =>
            header.name === "From" && header.value.includes("satulboss@gmail.com")
        );
        // console.log(response.data.payload);
        return { hasReplied: hasSentByYou, headers: headers };
    } catch (error) {
        console.error(
            "Error checking if the message has been replied to:",
            error.message
        );
        throw error;
    }
}

module.exports = { checkForNewEmails };