var freeport = require('freeport')

var utils = {
    initNode : function(node, cb) {
        node.options.id   = node.id
        node.options.host = node.options.host || '0.0.0.0'
        node.options.port = node.options.port || freeport(function(err, port) {
            if (err) { 
                console.error('Error getting random port', err); 
                process.exit(1) 
            }
            node.options.port = port
            node.ready = true
            cb()
        })
        if (node.options.port) { node.ready = true; cb() }
        return node
    }
}

module.exports = utils
