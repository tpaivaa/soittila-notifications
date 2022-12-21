require('dotenv').config()
const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN'
const port = process.env.NODE_PORT
const TELEGRAM_WEBHOOK = process.env.TELEGRAM_WEBHOOK
const CHAT_ID=process.env.CHAT_ID

console.log(`TOKEN: ${TOKEN}`)
console.log(`TELEGRAM_WEBHOOK: ${TELEGRAM_WEBHOOK}`)
console.log(`CHAT_ID: ${CHAT_ID}`)

const TelegramBot = require('node-telegram-bot-api')
const express = require('express')


// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN)

//Delete previous webhook
const deletedWebhook = bot.deleteWebHook()

// This informs the Telegram servers of the new webhook.
if (deletedWebhook) {
  bot.setWebHook(`${TELEGRAM_WEBHOOK}/bot${TOKEN}`)
  console.log('webhook now set')
}
else {
  console.log('Error deleting webhook!', deletedWebhook)
  bot.setWebHook(`${TELEGRAM_WEBHOOK}/bot${TOKEN}`)
  console.log('webhook now set')
}
const app = express()

// parse the updates to JSON
app.use(express.json())

app.get('/', (req,res) => {
  res.send('Alive')
})

app.get('/send', (req,res) => {
  if (req.query.message){
    const message = req.query.message
    bot.sendMessage(CHAT_ID,message)
    console.log(`Chat_message: ${message}`)
    res.sendStatus(200)
  }
  else {
    res.send('Try again loser!')
  }
})

app.post('/send', (req,res) => {
  const message = req.body
  if (message){
    bot.sendMessage(CHAT_ID,message)
    console.log(`Chat_message: ${message}`)
    res.send(200)
  }
  else {
    res.send('Try again loser!')
  }
})


// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

// Start Express Server
const server = app.listen(port, () => {
  console.log(`Express server is listening on ${port}`)
})

// Just to ping!
bot.on('message', msg => {
  console.log(`Message: ${JSON.stringify(msg)}`)
  const ping='ping'
  if (msg.text.toString().toLowerCase().indexOf(ping) === 0) {
    bot.sendMessage(msg.chat.id,"Pong")
    }

  const bye = "bye"
  if (msg.text.toString().toLowerCase().includes(bye)) {
  bot.sendMessage(msg.chat.id, "Hope to see you around again , Bye")
  }
})
bot.on('webhook_error', (error) => {
  console.log(error.code)  // => 'EPARSE'
})

const gracefulShutdownHandler = async (signal) => {
  console.log(`⚠️ Caught ${signal}, gracefully shutting down`)
  const deletedwebhook = await bot.deleteWebHook()
  console.log(`Webhook deleted: ${deletedwebhook} `)
  server.close(() => {
    console.log('HTTP server closed')
    process.exit()
  })
}

process.on('SIGINT', gracefulShutdownHandler)
process.on('SIGTERM', gracefulShutdownHandler)