const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express().use(bodyParser.json());

// ==========================================================
// 1. CONFIGURATION: AMPIDIRO ETO NY NY ANAO
// ==========================================================

// Ataovy ao anatin'ny " " ny Token d'accès-nao
const PAGE_ACCESS_TOKEN = "EAAZAmTDoEiBYBQZAw3Po3MNLD2U6ROZCoGPsWpge33G2iIvHJ13UkyZBVr2nqnLcEVtY7EcXOBZBZBN2vojZCzuTSUbmPHA67Qk9tfKkdYe0h09qzGeWBg8rrsPkdS79JlR5zzhuMDAca16xZC6kZB8DRr9ag7yZB7Nu762vaI3scZAdxNhwCWgSN7mowmaQp1HEwmbfn2S9fp2M58Pb1cZArOk94F3OKA8x8V5RPD81S6yB4AAQ";

// Ataovy ao anatin'ny " " ny App Secret-nao
const APP_SECRET = "f5c58e206fbc9db7290a18a2bf0eb293";

// Ataovy ao anatin'ny " " ny Page ID-nao
const PAGE_ID = "1801327437187094";

// Mamoròna teny iray tianao eto (ohatra: "BOT_TEST_2026")
// Io teny io no ampidirinao ao amin'ny Dashboard Facebook any aoriana
const VERIFY_TOKEN = "bot_messangers";

// ==========================================================

// --- VERIFICATION NY WEBHOOK (Ho an'ny Facebook Dashboard) ---
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

// --- MANDRAY NY MESSAGE AVY AMIN'NY MPAMAKY ---
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                // Eto no manoratra ny valin-teny automatique
                handleMessage(sender_psid, webhook_event.message.text);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// --- LOGIQUE HAMALIANA NY MESSAGE ---
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

// --- MANDREFA NY VALINY ANY AMIN'NY MESSENGER ---
async function sendApiRequest(sender_psid, response) {
    try {
        await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: sender_psid },
            message: response
        });
        console.log('Message sent back to user!');
    } catch (error) {
        console.error('Error sending message: ' + error.response.data.error.message);
    }
}

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Facebook Bot is Active!'));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
