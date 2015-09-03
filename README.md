# Simple Multi Peer

WebRTC multi-peer communication made simple (using [simple-peer](https://github.com/feross/simple-peer))

# Installation
```
$ npm install --save simple-multi-peer
```

# Usage

As a signalling server it is recommended to use [peer-hub](https://github.com/nihey/node-peer-hub).

```
var SimpleMultiPeer = require('simple-multi-peer');

var Peers = new SimpleMultiPeer({
  server: 'ws://localhost:3000', // Your signaller URL.
  room: 'foobar',                // Which 'room' you'll be using to communicate with your peers
                                 // (all peers in the same room will be signalled to each other).
  callbacks: {                   // Connection related callbacks
    connect: function() {},      // -> 2 peers are connected
    close: function() {},        // -> a connection is closed
    data: function() {},         // -> any data is received
  }
});

// Send data over a dataChannel to all peers
Peers.send('I'm alive!!!');
```

# License

This code is released under
[CC0](http://creativecommons.org/publicdomain/zero/1.0/) (Public Domain)
