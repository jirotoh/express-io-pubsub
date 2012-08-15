# Express to Socket.io publish/subscribe

Allows express to publish messages to be received by a socket.io server. The
servers can be completely independent.

## Usage
### Socket.io
```
express = require 'express'
http    = require 'http'
io      = require 'socket.io'
pubsub  = require '../lib/express-io-pubsub'

app = express()
server = http.createServer app
io = io.listen server

app.get '/', (req, res) ->
  res.send '
    <script src="/socket.io/socket.io.js"></script>
    <script>
      var socket = io.connect("http://localhost:3001");
      socket.on("connect", function(data) {
        socket.emit("join room", "lobby");
        socket.on("update", function (data) {
          var p = document.createElement("p");
          var t = document.createTextNode(data.msg);
          p.appendChild(t);
          document.body.appendChild(p);
        });
      });
    </script>
    <body><p>waiting for messages</p></body>
  '

io.sockets.on 'connection', (socket) ->
  socket.on 'join room', (room) ->
    socket.join room

pubsub.listen io.sockets, {
  conn: 'mongodb://localhost:27017/test'
  type: 'mongodb'
}

server.listen 3001
```

### Express
```
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
```

## LICENSE
```
Copyright (c) 2012 Bryant Williams <b.n.williams@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

