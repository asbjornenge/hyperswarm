var EventEmitter = require('events').EventEmitter
var assign       = Object.assign || require('object.assign')
var multicast    = require('multicast-dns')
var uuid         = require('node-uuid')
var freeport     = require('freeport')
var ip           = require('ip')

function mdns(options) {
    this.options = options 
}
mdns.prototype = {
    start : function() {
        this.mdns = multicast()
        this.mdns.on('query', this.handleQuery.bind(this))
        this.mdns.on('response', this.handleResponse.bind(this))
        this.query()
        this.queryInterval = setInterval(this.query.bind(this), 5000)
    },
    stop : function() {
        // NOTE: Not clearing peers on purpose.
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
            this.emit('peer', JSON.parse(a.data))
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
                            id   : this.options.id, 
                            port : this.options.port, 
                            host : this.options.host
                        })
                    }
                ]
            })
        }.bind(this))
    }
}
assign(mdns.prototype, EventEmitter.prototype)
module.exports = mdns
