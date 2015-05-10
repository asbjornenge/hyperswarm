var fs           = require('fs')
var path         = require('path')
var hyperemitter = require('hyperemitter')
var memdb        = require('memdb')
var schema       = fs.readFileSync(path.resolve(__dirname, 'commit.proto'))

function clog(options) {
    this.options = options
    this.hypem   = new hyperemitter(options.db || memdb(), schema)
}
clog.prototype = {
    start : function(cb) {
        this.hypem.listen(this.options.port, this.options.host, function(err, bound) {
            if (err) { console.error('hypem listen error',err); process.exit(1) }
            cb()
        }.bind(this))
    },
    stop : function() {
        this.hypem.close()
    },
    on : function(e, fn) {
        this.hypem.on(e, fn)
    },
    commit : function(changeset) {
        this.hypem.emit('commit', {changeset : changeset})
    },
    connect : function(peer) {
        this.hypem.connect(peer.port, peer.host, function(err) {
            if (err) { console.log('Peer connection error', err, peer); }
        })
    }
}

module.exports = clog 
