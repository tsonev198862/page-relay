const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'my_verify_token';  // Постави своя verify token
const MATRIX_WEBHOOK_URL = 'https://your-matrix-webhook.url';  // Тук постави своя Matrix webhook URL

// Проверка на Facebook webhook
app.get('/webhook', (req, res) => {
    console.log('🚀 Получаваме GET заявка за верификация');
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        console.log('✔️ Верификация успешна');
        res.send(req.query['hub.challenge']);
    } else {
        console.log('❌ Верификация неуспешна');
        res.sendStatus(403);
    }
});

// Получаване на съобщения
app.post('/webhook', async (req, res) => {
    console.log('🚀 Получаваме POST заявка');
    const body = req.body;
    console.log('Събитие от Facebook:', JSON.stringify(body, null, 2));

    if (body.object === 'page') {
        for (const entry of body.entry) {
            const event = entry.messaging[0];
            const message = event.message?.text || '[няма текст]';
            const sender = event.sender.id;

            // Логваме полученото съобщение
            console.log(`💬 Получено съобщение от ${sender}: ${message}`);

            try {
                // Изпращаме съобщението към Matrix Webhook URL
                await axios.post(MATRIX_WEBHOOK_URL, {
                    sender,
                    message
                });
                console.log('✔️ Съобщението успешно изпратено към Matrix');
            } catch (error) {
                console.log('❌ Грешка при изпращане на съобщението към Matrix:', error.message);
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        console.log('❌ Неочаквано събитие');
        res.sendStatus(404);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Сървърът работи на порт ${port}`);
});
