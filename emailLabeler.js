const { google } = require("googleapis");
const { authenticate } = require("google-auth-library");

const addLabel = async(auth, message, labelID) => {
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.modify({
        userId: "me",
        id: message.id,
        requestBody: {
            addLabelIds: [labelID],
            removeLabelIds: ["INBOX"],
        },
    });
};

async function addLabelAndMove(auth, email, LABEL_NAME) {
    const gmail = google.gmail({ version: "v1", auth });
    try {
        // Try to create the label
        const res = await gmail.users.labels.create({
            userId: "me",
            requestBody: {
                name: LABEL_NAME,
                labelListVisibility: "labelshow",
                messageListVisibility: "show",
            },
        });
        return res.data.id;
    } catch (err) {
        if (err.code === 409) {
            // Label already exists, get its ID
            const res = await gmail.users.labels.list({
                userId: "me",
            });
            const label = res.data.labels.find((label) => label.name === LABEL_NAME);
            await addLabel(auth, email, label.id);
        } else {
            return err;
        }
    }
}

module.exports = { addLabelAndMove };