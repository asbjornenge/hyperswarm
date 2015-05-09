var fs           = require('fs')
var path         = require('path')
var HyperEmitter = require('hyperemitter')
var freeport     = require('freeport')
var memdb        = require('memdb')
var schema       = fs.readFileSync(path.join('.', 'mutations.proto'))

function CommitLog(options) {
    this.options = options
    this.hypem   = new HyperEmitter(memdb(), schema)
}
CommitLog.prototype = {
    start : function(cb) {
        freeport(function(err, port) {
            if (err) { console.error(error); process.exit(1) }
            this.hypem.listen(port, this.options.host, function(err, bound) {
                if (err) { console.error('hypem listen error',err); process.exit(1) }
                cb(port)
            }.bind(this))
        }.bind(this))
    },
    stop : function() {
        this.hypem.close()
        return this
    },
    on : function(e, fn) {
        this.hypem.on(e, fn)
    },
    commit : function(data) {
        this.hypem.emit('mutation', data)
    }
}

module.exports = CommitLog
