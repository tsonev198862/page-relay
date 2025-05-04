const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'my_verify_token';
const MATRIX_WEBHOOK_URL = 'https://your-matrix-webhook.url'; // ← смени това по-късно

// Проверка на Facebook webhook
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

// Получаване на съобщения
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        for (const entry of body.entry) {
            const event = entry.messaging[0];
            const message = event.message?.text || '[няма текст]';
            const sender = event.sender.id;

            await axios.post(MATRIX_WEBHOOK_URL, {
                sender,
                message
            });
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

app.listen(3000, () => {
    console.log('✅ Сървърът работи на порт 3000');
});
