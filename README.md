# Simple Multi Peer

WebRTC multi-peer communication made simple (using [simple-peer](https://github.com/feross/simple-peer))

**Note**: This is a fork of [simple-multi-peer](https://github.com/nihey/simple-multi-peer). Many thanks to Nihey Takizawa

# Installation
```
$ npm install --save @ok2ju/simple-multi-peer
```

# Usage

As a signalling server it is recommended to use [peer-hub](https://github.com/nihey/node-peer-hub).

```javascript
var SimpleMultiPeer = require('simple-multi-peer');

var Peers = new SimpleMultiPeer({
  server: 'ws://localhost:3000', // Your signaller URL.
  room: 'foobar',                // Which 'room' you'll be using to communicate with your peers
                                 // (all peers in the same room will be signalled to each other).
  callbacks: {                   // Connection related callbacks
    connect: function(id) {},    // -> 2 peers are connected
    close: function(id) {},      // -> a connection is closed
    data: function(id, data) {}, // -> any data is received
    stream: function(id, stream) {}, // -> audio/video stream
  }
});

// Send data over a dataChannel to all peers
Peers.send("I'm alive!!!");
```
