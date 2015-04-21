var mdns     = require('multicast-dns')
var uuid     = require('node-uuid')
var freeport = require('freeport')
var ip       = require('ip')

function serviceCluster(options) {
    this.id      = uuid.v4()
    this.peers   = []
    this.options = this.validateOptions(options)
}
serviceCluster.prototype = {
    start : function() {
        if (!this.options.host) this.options.host = ip.address()
        if (!this.options.port) freeport(function(err, port) {
            if (err) { console.error(err); process.exit(1) }
            this.options.port = port
            this.startMdns()
        }.bind(this))
        else startMdns()
        return this
    },
    startMdns : function() {
        this.mdns = mdns()
        this.mdns.on('query', this.handleQuery.bind(this))
        this.mdns.on('response', this.handleResponse.bind(this))
        this.query()
        this.queryInterval = setInterval(this.query.bind(this), 5000)
    },
    stop : function() {
        // NOTE: Not clearing peers in purpose.
        clearInterval(this.queryInterval)
        if (this.mdns) this.mdns.destroy()
        return this
    },
    query : function() {
        this.mdns.query({
            questions : [
                {
                    name : this.options.name,
                    type : 'TXT'
                }
            ]
        })
    },
    handleResponse : function(res) {
        res.answers.forEach(function(a) {
            if (a.type != 'TXT' || a.name != this.options.name) return
            var peer = JSON.parse(a.data)
            if (peer.id == this.id) return
            var peerIds = this.peers.map(function(peer) { return peer.id })
            if (peerIds.indexOf(peer.id) >= 0) return
            this.peers.push(peer)
        }.bind(this))
    },
    handleQuery : function(query) { 
        query.questions.forEach(function(q) {
            if (q.name !== this.options.name) return
            this.mdns.respond({
                answers : [
                    {
                        type : 'TXT',
                        ttl  : 5,
                        name : this.options.name,
                        data : JSON.stringify({ 
                            id   : this.id, 
                            port : this.options.port, 
                            host : this.options.host
                        })
                    }
                ]
            })
        }.bind(this))
    },
    validateOptions : function(options) {
        if (!options.name) { 
            console.error('Service name required')
            process.exit(1) 
        } 
        return options
    }
}

module.exports = function(name, options) {
    options = options || {}
    options.name = name
    return new serviceCluster(options)
}
