express = require 'express'
pubsub  = require '../lib/express-io-pubsub'

app = express()

app.configure () ->
  app.use pubsub.middleware {
    conn: 'mongodb://localhost:27017/test'
    type: 'mongodb'
  }
app.get '/', (req, res) ->
  req.publish "lobby", "update", {msg: 'Hello World!'}
  res.send "message sent"

app.listen 3002

