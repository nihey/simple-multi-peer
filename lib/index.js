var io = require('socket.io-client'),
    SimplePeer = require('simple-peer'),
    extend = require('extend');

var SimpleMultiPeer = function(options) {
  this.signaller = io(options.server);

  this._peerOptions = options.peerOptions || {};
  this._room = options.room;

  this.callbacks = options.callbacks || {};
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
  ['Connect', 'Signal', 'Data', 'Close'].forEach(function(event) {
    peer.on(event.toLowerCase(), this['onPeer' + event].bind(this, id));
  }, this);
};

SimpleMultiPeer.prototype.send = function(data) {
  Object.keys(this.peers).forEach(function(id) {
    this.peers[id].send(data);
  }, this);
};

SimpleMultiPeer.prototype.apply = function(func, args) {
  Object.keys(this.peers).forEach(function(id) {
    this.peers[id][func].apply(this.peers[id], args);
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
    var options = extend({}, this._peerOptions);
    this.peers[data.id] = new SimplePeer(options);
    this.registerPeerEvents(this.peers[data.id], data.id);
  }
  this.peers[data.id].signal(data.signal);
};

SimpleMultiPeer.prototype.onSignallerPeers = function(peers) {
  peers.forEach(function(id) {
    var options = extend({initiator: true}, this._peerOptions);
    this.peers[id] = new SimplePeer(options);
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
  this.callbacks.connect && this.callbacks.connect.call(this, id);
};

SimpleMultiPeer.prototype.onPeerSignal = function(id, signal) {
  this.signaller.emit('signal', {
    id: id,
    signal: signal,
  });
};

SimpleMultiPeer.prototype.onPeerData = function(id, data) {
  console.log('received ' + data + ' from ' + id);
  this.callbacks.data && this.callbacks.data.call(this, id, data);
};

SimpleMultiPeer.prototype.onPeerClose = function(id) {
  delete this.peers[id];
  console.log('closed to ' + id);
  this.callbacks.close && this.callbacks.close.call(this, id);
};

module.exports = SimpleMultiPeer;
