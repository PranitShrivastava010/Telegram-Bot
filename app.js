require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const telegramToken = process.env.TELEGRAM_API_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${telegramToken}`;

async function sendMessage(chatId, text) {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown"
        }),
    });

    const data = await response.json();
    if(!response.ok) throw new Error(data.description || "Failed to send message");
}

async function sendPhoto(chatId, imageUrl, caption="") {
    const response = await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            chat_id: chatId,
            photo: imageUrl,
            caption,
        }),
    });

    const data = await response.json();
    if(!response.ok) throw new Error(data.description || "Failed to send photo");
}

app.post("/new-message", async function (req, res) {
    const {message}= req.body;

    if(!message || !message.text) return res.send("invalid message");

    const chatId = message.chat.id;
    const text = message.text.toLowerCase();

    try{
        if(text == "/start"){
            await sendPhoto(chatId, `${process.env.BASE_URL}/images/hello.png`, "hello!");

            const intro = `🚀 I'm a Full Stack Developer and Java Enthusiast.
                            🔗 Connect with me:
                            - [GitHub](https://github.com/PranitShrivastava010)
                            - [LinkedIn](https://www.linkedin.com/in/pranit-shrivastava-b840622b9/)

                            Let's build something cool together! 💻✨`;
             
             await sendMessage(chatId, intro.trim());
             return res.send("Welcome message sent")            
        }

        res.send("No match found")
    } catch(error){
        console.log("Telegram api error", error.message);
        res.status(500).send("Bot Error")
    }
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("tellegram is listnimg in port 3000")
})
