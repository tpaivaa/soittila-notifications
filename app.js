require('dotenv').config()
const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN'
const port = process.env.NODE_PORT
const TELEGRAM_WEBHOOK = process.env.TELEGRAM_WEBHOOK

const TelegramBot = require('node-telegram-bot-api')
const express = require('express');

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN)

//Delete previous webhook
const deletedWebhook = bot.deleteWebHook()

// This informs the Telegram servers of the new webhook.
if (deletedWebhook) {
  bot.setWebHook(`${TELEGRAM_WEBHOOK}/bot${TOKEN}`)
}
else {
  console.log('Error deleting webhook!', deletedWebhook)
}
const app = express();

// parse the updates to JSON
app.use(express.json())

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

// Start Express Server
var server = app.listen(port, () => {
  console.log(`Express server is listening on ${port}`)
  server.close(() => {
    console.log(`closing...`)
    var deleledwebhook = bot.deleteWebHook()
    console.log(`Webhook deleted: ${deleledwebhook} `)
  })
})

// Just to ping!
bot.on('message', msg => {
  const ping='ping'
  if (msg.text.toString().toLowerCase().indexOf(ping) === 0) {
    bot.sendMessage(msg.chat.id,"Pong");
    }

    var bye = "bye";
    if (msg.text.toString().toLowerCase().includes(bye)) {
    bot.sendMessage(msg.chat.id, "Hope to see you around again , Bye");
    }
})
bot.on('webhook_error', (error) => {
  console.log(error.code)  // => 'EPARSE'
})

