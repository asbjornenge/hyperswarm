var mdns = require('multicast-dns')
var uuid = require('node-uuid')

function serviceCluster(options) {
    this.id      = uuid.v4()
    this.peers   = []
    this.options = this.validateOptions(options)
}
serviceCluster.prototype = {
    start : function() {
        this.mdns = mdns()
        this.mdns.on('query', this.handleQuery.bind(this))
        this.mdns.on('response', this.handleResponse.bind(this))
        this.query()
        this.queryInterval = setInterval(this.query.bind(this), 5000)
        return this
    },
    stop : function() {
        clearInterval(this.queryInterval)
        this.mdns.destroy()
        return this
    },
    query : function() {
        this.mdns.query({
            questions : [
                {
                    name : this.options.name,
                    type : 'SRV'
                }
            ]
        })
    },
    handleResponse : function(res) {
        res.answers.forEach(function(a) {
            if (a.name != this.options.name) return
            if (a.type == 'TXT') {
                var id = JSON.parse(a.data).id
                if (id == this.id) return
                if (this.peers.indexOf(id) >= 0) return
                this.peers.push(id)
            }
        }.bind(this))
    },
    handleQuery : function(query) { 
        query.questions.forEach(function(q) {
            if (q.name !== this.options.name) return
            this.mdns.respond({
                answers : [
                    {
                        type : 'SRV',
                        ttl  : 5,
                        name : this.options.name,
                        data : { port : 5000, target : '127.0.0.1' }
                    },
                    {
                        type : 'TXT',
                        ttl  : 5,
                        name : this.options.name,
                        data : JSON.stringify({ id : this.id })
                    }
                ]
            })
        }.bind(this))
    },
    validateOptions : function(options) {
        if (!options.name) { console.error('Service name required'); process.exit(1) } 
        return options
    }
}

module.exports = function(name, options) {
    options = options || {}
    options.name = name
    return new serviceCluster(options)
}
