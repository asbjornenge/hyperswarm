var freeport = require('freeport')
var network  = require('network')

var utils = {
    initNode : function(node, cb) {
        var finish = function() {
            if (node.options.host && node.options.port) cb()
        }
        node.options.id   = node.id
        node.options.host = node.options.host || network.get_active_interface(function(err, iface) {
            if (err) { 
                console.error('Error getting network interfaces', err); 
                process.exit(1) 
            }
            node.options.host = iface.ip_address 
            finish()
        }) 
        node.options.port = node.options.port || freeport(function(err, port) {
            if (err) { 
                console.error('Error getting random port', err); 
                process.exit(1) 
            }
            node.options.port = port
            node.ready = true
            finish()
        })
        if (node.options.port) { node.ready = true; cb() }
        return node
    }
}

module.exports = utils
