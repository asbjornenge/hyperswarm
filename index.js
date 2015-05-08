var fs           = require('fs')
var path         = require('path')
var uuid         = require('node-uuid')
var HyperEmitter = require('hyperemitter')
var diff         = require('changeset')
var freeport     = require('freeport')
var ip           = require('ip')
var memdb        = require('memdb')
var mdns         = require('./mdns')
var Peer         = require('./peer')
var schema       = fs.readFileSync(path.join('.', 'mutations.proto'))

function HyperSwarm(options) {
    this.id           = uuid.v4()
    this.options      = options
    this.options.id   = this.id
    this.options.host = ip.address() 
    this.state      = {}
    this.peers      = []
    this.mdns       = new mdns(options)
    this.emitter    = new HyperEmitter(memdb(), schema)
}
HyperSwarm.prototype = {
    start : function() {
        freeport(function(err, port) {
            if (err) { console.error(error); process.exit(1) }
            this.options.port = port
            this.emitter.listen(port, this.options.host, function(err, bound) {
                if (err) console.log('listen err', err)
                this.emitter.on('mutation', this.handleStateMutation.bind(this))
                this.mdns.on('peer', this.handlePeer.bind(this))
                this.mdns.start()
            }.bind(this))
        }.bind(this))
        return this
    },
    stop : function() {
        this.mdns.stop()
        this.emitter.close()
        return this
    },
    handlePeer : function(peer) {
        var peerIds = this.peers.map(function(p) { return p.id })
        if (peer.id == this.id) return
        if (peerIds.indexOf(peer.id) >= 0) return
        this.peers.push(new Peer(peer, this.emitter, this.id))
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
    return new HyperSwarm(options)
}
