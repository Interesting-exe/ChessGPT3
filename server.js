//create a server that receives a string and enters it to openai and returns the response

require('dotenv').config()
const express = require('express');
const app = express()
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.use(
    express.urlencoded({
        extended: true
    })
)

port = 6969

app.use(express.json())

app.get('/', async (req, res) => {
    try {
        console.log(req.query.temp)
        const r = await openai.createCompletion(
            {
                model: "text-davinci-003",
                prompt: req.query.prompt,
                max_tokens: 1024,
                temperature: parseFloat(req.query.temp),
            }
        )
        let text = r.data.choices[0].text
        console.log(text)
        res.send(text)
    } catch (e) {console.log(e)}
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
