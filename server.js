//create a server that receives a string and enters it to openai and returns the response

require('dotenv').config()
const express = require('express');
const app = express()
var cors = require('cors')
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

const corsConf = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
}

app.use(cors(corsConf))

app.get('/', async (req, res) => {
    try {
        console.log(req.query.temp)

        let prompt = JSON.parse(req.query.prompt)

        const r = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: prompt,
        })
        let text = r.data.choices[0].message.content

        console.log(text)
        res.send(text)
    } catch (e) {console.log(e)}
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
