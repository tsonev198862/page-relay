const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'my_verify_token';
const MATRIX_WEBHOOK_URL = 'https://your-matrix-webhook.url'; // ← смени това по-късно

// Проверка на Facebook webhook
app.get('/webhook', (req, res) => {
    console.log("Получаваме GET заявка за верификация от Facebook Webhook");  // Лог за проверка на GET заявката
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        console.log("Токенът е валиден, връщаме challenge");
        res.send(req.query['hub.challenge']);
    } else {
        console.log("Невалиден токен");
        res.sendStatus(403);
    }
});

// Получаване на съобщения
app.post('/webhook', async (req, res) => {
    console.log("Получихме POST заявка от Facebook Webhook");  // Лог за получаване на събитие
    const body = req.body;

    if (body.object === 'page') {
        console.log("Обработваме събитие от страница");  // Лог за обработване на събитие от страница

        for (const entry of body.entry) {
            const event = entry.messaging[0];
            const message = event.message?.text || '[няма текст]';
            const sender = event.sender.id;

            console.log(`Получено съобщение от ${sender}: ${message}`);  // Лог на съобщението и ID на изпращача

            // Изпращане на съобщение към Matrix Webhook
            try {
                const response = await axios.post(MATRIX_WEBHOOK_URL, {
                    sender,
                    message
                });
                console.log(`Съобщението е изпратено успешно към Matrix: ${response.status}`);
            } catch (error) {
                console.log("Грешка при изпращане на съобщение към Matrix:", error);
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        console.log("Невалидно събитие: не е събитие от страница.");
        res.sendStatus(404);
    }
});

app.listen(3000, () => {
    console.log('✅ Сървърът работи на порт 3000');
});

