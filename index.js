import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

class SimpleMultiPeer {
  constructor(options) {
    this.signaller = io(options.server, options.connectionOptions || {});

    this._peerOptions = options.peerOptions || {};
    this._room = options.room;

    this.callbacks = options.callbacks || {};
    ['Connect', 'Disconnect', 'Signal', 'Peers'].forEach((event) => {
      const callback = this['onSignaller' + event];
      this.signaller.on(event.toLowerCase(), callback);
    });

    this.peers = {};
  }

  /**
   * Public API
   */

  registerPeerEvents = (peer, id) => {
    ['Connect', 'Signal', 'Data', 'Stream', 'Close'].forEach((event) => {
      peer.on(event.toLowerCase(), this['onPeer' + event].bind(this, id));
    });
  }

  send = (data) => {
    Object.keys(this.peers).forEach((id) => {
      this.peers[id].send(data);
    });
  }

  apply = (func, args) => {
    Object.keys(this.peers).forEach((id) => {
      this.peers[id][func].apply(this.peers[id], args);
    });
  }

  getPeer = (id) => {
    return this.peers[id];
  }

  /**
   * Signaller Events
   */

  onSignallerConnect = () => {
    this.signaller.emit('join', this._room);
  }

  onSignallerSignal = (data) => {
    if (!this.peers[data.id]) {
      const options = Object.assign({}, this._peerOptions);
      this.peers[data.id] = new SimplePeer(options);
      this.registerPeerEvents(this.peers[data.id], data.id);
    }
    this.peers[data.id].signal(data.signal);
  }

  onSignallerPeers = (peers) => {
    peers.forEach((id) => {
      const options = Object.assign({ initiator: true }, this._peerOptions);
      this.peers[id] = new SimplePeer(options);
      this.registerPeerEvents(this.peers[id], id);
    });
  }

  onSignallerDisconnect = () => {}

  /**
   * Peer Events
   */

  onPeerConnect = (id) => {
    console.log('connected to ' + id);
    this.callbacks.connect && this.callbacks.connect(id);
  }

  onPeerSignal = (id, signal) => {
    this.signaller.emit('signal', {
      id: id,
      signal: signal,
    });
  }

  onPeerData = (id, data) => {
    console.log('received data ' + data + ' from ' + id);
    this.callbacks.data && this.callbacks.data(id, data);
  }

  onPeerStream = (id, stream) => {
    console.log('received stream ' + stream + ' from ' + id);
    this.callbacks.stream && this.callbacks.stream(id, stream);
  }

  onPeerClose = (id) => {
    delete this.peers[id];
    console.log('closed to ' + id);
    this.callbacks.close && this.callbacks.close(id);
  }
}

export default SimpleMultiPeer;
