const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const cors = require('cors');
require("dotenv").config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(express.json());
app.use('/', express.static(__dirname + '/frontend')); // Serves resources from client folder

app.post('/get-prompt-result', async (req, res) => {
    // Get the prompt from the request body
    const {prompt, model = 'gpt'} = req.body;

    // Check if prompt is present in the request
    if (!prompt) {
        // Send a 400 status code and a message indicating that the prompt is missing
        return res.status(400).send({error: 'Prompt is missing in the request'});
    }

    try {
        const history = [];
        const messages = [];

        // Use the OpenAI SDK to create a completion
        // with the given prompt, model and maximum tokens
        if (model === 'image') {
           /* const result = await openai.createImage({
                prompt,
                response_format: 'url',
                size: '512x512'
            });*/
            return res.send('https://images.unsplash.com/photo-1655720837928-38b1a93298ac');
        }
        for (const [input_text, completion_text] of history) {
            messages.push({ role: "user", content: input_text });
            messages.push({ role: "assistant", content: completion_text });
        }
        messages.push({ role: "user", content: prompt });

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        });
        // Send the generated text as the response
        history.push([prompt, completion.data.choices[0].message.content]);

        return res.send(completion.data.choices[0].message.content);
    } catch (error) {
        const errorMsg = error.response ? error.response.data.error : `${error}`;
        console.error(errorMsg);
        // Send a 500 status code and the error message as the response
        return res.status(500).send(errorMsg);
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}`));
