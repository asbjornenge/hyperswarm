var HyperEmitter = require('hyperemitter')
var EventEmitter = require('events').EventEmitter
var assign       = Object.assign || require('object.assign')

function Peer(peer, emitter, id) {
    this.id   = peer.id
    this.peer = peer
    emitter.connect(this.peer.port, this.peer.host, function(err) {
        if (err) { console.log('connection error', err); this.emit('error', err) }
    }.bind(this))
}
assign(Peer.prototype, EventEmitter.prototype)

module.exports = Peer
