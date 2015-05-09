var uuid     = require('node-uuid')
var diff     = require('changeset')
var mdns     = require('./mdns')
var clog     = require('./clog')
var utils    = require('./utils')

// TODO: Have a setState function that does
// object.assign, diff and emit diff !!

function hyperswarm(options) {
    this.id           = uuid.v4()
    this.options      = options
    this.state        = {}
    this.peers        = []
    this.mdns         = new mdns(options)
    this.clog         = new clog(options)
}
hyperswarm.prototype = {
    start : function() {
        if (!this.ready) return utils.initNode(this, this.start.bind(this))
        this.clog.start(function() {
            this.clog.on('mutation', this.handleStateMutation.bind(this))
            this.mdns.on('peer', this.handlePeer.bind(this))
            this.mdns.start()
        }.bind(this))
        return this
    },
    stop : function() {
        this.mdns.stop()
        this.clog.stop()
        return this
    },
    handlePeer : function(peer) {
        var peerIds = this.peers.map(function(p) { return p.id })
        if (peer.id == this.id) return
        if (peerIds.indexOf(peer.id) >= 0) return
        this.peers.push(peer)
        this.clog.connect(peer)
    },
    handleStateMutation : function(change) {
        diff.apply([change], this.state, true) 
    }
}

module.exports = function(name, options) {
    if (!name) { 
        console.error('Service name required')
        process.exit(1) 
    } 
    options = options || {}
    options.name = name
    return new hyperswarm(options)
}
