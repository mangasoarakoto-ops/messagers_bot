const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express().use(bodyParser.json());

// ==========================================================
// 1. CONFIGURATION: NODIOVINA NY TOKEN SY NY ID
// ==========================================================

// Ny Token-nao (ilay API farany nalefanao no nalaiko)
const PAGE_ACCESS_TOKEN = "EAAZAmTDoEiBYBQTmnKYl7ronQQX1r5dyZAlnYJDjb91HyxZCZAHk978HrvBD5ZA5XvpsnstZBS4Mr2d1r0SuPAhinB2Hk8ma7xEswA2J6QKhZBlvGoMI1mizkiJh2L9uWb8H24iTWa5iq6m5ey1Ic9uoPpBlRTuglst8YWh0khBlshHUGD6gZBVJjZCPeTWyuivZCZABaw0Ltz6XmZCNDuuHa2BYdqedxuuriR5eKuwJ9PNh1BbZC9Uy3JYzrkgZDZD";

// Ny App Secret-nao
const APP_SECRET = "f5c58e206fbc9db7290a18a2bf0eb293";

// Ny Page ID-nao (Asa En Ligne Madagascar)
const PAGE_ID = "405569205968014";

// Ny Verify Token (Ity no soratanao ao amin'ny Facebook Dashboard)
const VERIFY_TOKEN = "bot_messangers";

// ==========================================================

// --- VERIFICATION NY WEBHOOK ---
app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// --- MANDRAY NY MESSAGE ---
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            if (entry.messaging && entry.messaging[0]) {
                let webhook_event = entry.messaging[0];
                let sender_psid = webhook_event.sender.id;

                if (webhook_event.message && webhook_event.message.text) {
                    handleMessage(sender_psid, webhook_event.message.text);
                }
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// --- LOGIQUE HAMALIANA ---
async function handleMessage(sender_psid, received_message) {
    let response;
    let msgText = received_message.toLowerCase();

    if (msgText.includes("salama") || msgText.includes("bonjour")) {
        response = { "text": "Salama tompoko! Tongasoa eto amin'ny Page-nay. Inona no azo ampiana anao?" };
    } else if (msgText.includes("vidiny") || msgText.includes("prix")) {
        response = { "text": "Afaka omenao ny anaran'ny entana tianao ho fantatra ve ny vidiny?" };
    } else {
        response = { "text": `Voaraiko ny hafatrao hoe: "${received_message}". Hijery an'izany ny mpanolotsainay.` };
    }

    sendApiRequest(sender_psid, response);
}

// --- MANDREFA VALINY ---
async function sendApiRequest(sender_psid, response) {
    try {
        await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: sender_psid },
            message: response
        });
        console.log('Message sent back to user!');
    } catch (error) {
        // Raha misy erreur dia hita ao amin'ny Logs
        if (error.response) {
            console.error('Error Details:', error.response.data.error.message);
        } else {
            console.error('Error sending message:', error.message);
        }
    }
}

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Facebook Bot is Active!'));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
