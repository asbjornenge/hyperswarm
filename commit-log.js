var db   = require('levelup')
var memd = require('memdown')
var fdb  = require('fwdb')
var lock = require('proper-lockfile')

// TODO: User cluster service name and rather allow option
// to overwrite the name

function commitlog(options) {
    this.name = options.name
    this.options = options
    this.db = db('/does/not/matter', { db : memd })
    this.fdb = fdb(db)
}
commitlog.prototype = {
}

module.exports = function(name, options) {
    options = options || {}
    options.name = name
    return new commitlog(options)
}
