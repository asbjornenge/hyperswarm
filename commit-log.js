var db   = require('level')
var fdb  = require('forkdb')
var lock = require('lockfile')

// TODO: User cluster service name and rather allow option
// to overwrite the name

function commitlog(options) {
    this.name = options.name
    this.options = options
    this.findDb(function(path) {
        this.path = path
        this.db = db(path)
        console.log('found me',path)
    }.bind(this))
//    this.db = db('/tmp/'+this.dbPath())
//    this.fdb = fdb(db, { dir: '/tmp/yolo.blob' })
//    var r = this.fdb.heads('meta')
}
commitlog.prototype = {
    findDb : function(fn, i) {
        var path = '/tmp/'+this.name
        if (i) path = path+'-'+i
        console.log(path, i)
        var res = lock.check(path, function(err, res) {
            if (res) setTimeout(function() {
                this.findDb(fn, i == undefined ? 0 : i+1)
            }.bind(this),1000)
            else fn(path)
        }.bind(this))
    },
    destroy : function() {
        db.destroy(this.db.location)
    }
}

module.exports = function(name, options) {
    options = options || {}
    options.name = name
    return new commitlog(options)
}
