var uuid      = require('node-uuid')
var immutable = require('immutable')
var flat      = require('flat')
var eemitter  = require('events').EventEmitter
var assign    = require('object.assign')
var mdns      = require('./mdns')
var clog      = require('./clog')
var utils     = require('./utils')

function hyperswarm(options) {
    this.id           = uuid.v4()
    this.options      = options
    this.state        = immutable.Map()
    this.peers        = []
    this.mdns         = new mdns(options)
    this.clog         = new clog(options)
}
hyperswarm.prototype = {
    start : function(cb) {
        if (!this.ready) return utils.initNode(this, this.start.bind(this, cb))
        this.clog.start(function() {
            this.clog.on('commit', this.handleStateMutation.bind(this))
            this.mdns.on('peer', this.handlePeer.bind(this))
            this.mdns.start()
            if (typeof cb === 'function') cb()
        }.bind(this))
        return this
    },
    stop : function() {
        this.mdns.stop()
        this.clog.stop()
    },
    setState : function(changeset) {
        this.clog.commit(JSON.stringify(flat(changeset)))
    },
    handlePeer : function(peer) {
        var peerIds = this.peers.map(function(p) { return p.id })
        if (peer.id == this.id) return
        if (peerIds.indexOf(peer.id) >= 0) return
        this.peers.push(peer)
        this.clog.connect(peer)
        this.emit('peer', peer)
    },
    handleStateMutation : function(commit) {
        var changeset = flat.unflatten(JSON.parse(commit.changeset))
        this.state = this.state.merge(changeset)
        this.emit('change', this.state)
    }
}
assign(hyperswarm.prototype, eemitter.prototype)

module.exports = function(name, options, cb) {
    if (!name) { 
        console.error('Service name required')
        process.exit(1) 
    }
    if (typeof options === 'function') { cb = options; options = undefined }
    options = options || {}
    options.name = name
    return new hyperswarm(options).start(cb)
}
