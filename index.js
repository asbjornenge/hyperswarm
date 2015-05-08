var uuid = require('node-uuid')
var mdns = require('./mdns')

function HyperSwarm(options) {
    this.id         = uuid.v4()
    this.options    = options
    this.options.id = this.id
    this.peers      = []
    this.mdns       = new mdns(options)
//    this.state      = new hyperState(options)
}
HyperSwarm.prototype = {
    start : function() {
        this.mdns.start()
        this.mdns.on('peer', this.handlePeer.bind(this))
        return this
    },
    stop : function() {
        this.mdns.stop()
        return this
    },
    handlePeer : function(peer) {
        var peerIds = this.peers.map(function(peer) { return peer.id })
        if (peerIds.indexOf(peer.id) >= 0) return
        this.peers.push(peer)
    }
}

module.exports = function(name, options) {
    if (!name) { 
        console.error('Service name required')
        process.exit(1) 
    } 
    options = options || {}
    options.name = name
    return new HyperSwarm(options)
}
