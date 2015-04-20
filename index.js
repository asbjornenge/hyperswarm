var mdns = require('multicast-dns')

function serviceCluster(options) {
    this.options = this.validateOptions(options)
}
serviceCluster.prototype.start = function() {
    console.log('starting')
}
serviceCluster.prototype.stop = function() {
    console.log('stopping')
}
serviceCluster.prototype.validateOptions = function(options) {
    if (!options.name) return
    return options
}

module.exports = function(options) {
    return new serviceCluster(options)
}
