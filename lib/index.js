var io = require('socket.io-client'),
    wrtc = require('wrtc'),
    SimplePeer = require('simple-peer');

var SimpleMultiPeer = function(signalServer, room) {
  this.signaller = io(signalServer);
  this._room = room;

  ['Connect', 'Disconnect', 'Signal', 'Peers'].forEach(function(event) {
    var callback = this['onSignaller' + event].bind(this);
    this.signaller.on(event.toLowerCase(), callback);
  }, this);

  this.peers = {};
};

/*
 * Public API
 */

SimpleMultiPeer.prototype.registerPeerEvents = function(peer, id) {
  ['Connect', 'Signal'].forEach(function(event) {
    peer.on(event.toLowerCase(), this['onPeer' + event].bind(this, id));
  }, this);
};

/*
 * Signaller Events
 */

SimpleMultiPeer.prototype.onSignallerConnect = function() {
  this.signaller.emit('join', this._room);
};

SimpleMultiPeer.prototype.onSignallerSignal = function(data) {
  if (!this.peers[data.id]) {
    this.peers[data.id] = new SimplePeer({wrtc: wrtc});
    this.registerPeerEvents(this.peers[data.id], data.id);
  }
  this.peers[data.id].signal(data.signal);
};

SimpleMultiPeer.prototype.onSignallerPeers = function(peers) {
  peers.forEach(function(id) {
    this.peers[id] = new SimplePeer({wrtc: wrtc, initiator: true});
    this.registerPeerEvents(this.peers[id], id);
  }, this);
};

SimpleMultiPeer.prototype.onSignallerDisconnect = function() {
};

/*
 * Peer Events
 */

SimpleMultiPeer.prototype.onPeerConnect = function(id) {
  console.log('connected to ' + id);
};

SimpleMultiPeer.prototype.onPeerSignal = function(id, signal) {
  this.signaller.emit('signal', {
    id: id,
    signal: signal,
  });
};

module.exports = SimpleMultiPeer;
