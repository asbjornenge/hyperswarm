var assert = require('assert')
var cluster = require('../')

it('can auto-cluster', function(done) {
    var a = cluster('superservice').start()
    var b = cluster('superservice').start()
    // Allow a little time for the discovery
    setTimeout(function() {
        a.stop()
        b.stop()
        var a_peerIds = a.peers.map(function(peer) { return peer.id })
        var b_peerIds = b.peers.map(function(peer) { return peer.id })
        assert(a_peerIds.indexOf(b.id) >= 0 && a.peers.length == 1)
        assert(b_peerIds.indexOf(a.id) >= 0 && b.peers.length == 1)
        done()
    }, 50)
})

it.only('shares a distributed state', function(done) {
    var a = cluster('superservice2').start()
    var b = cluster('superservice2').start()
    // Allow a little time for the discovery
    setTimeout(function() {
        a.emitter.emit('mutation', {type : 'put', key : ['reincarnation'], value : 'yolo'})
        // Allow a little time for propagation
        setTimeout(function() {
            assert(b.state.reincarnation == 'yolo')
            a.stop()
            b.stop()
            done()
        }, 100)
    }, 50)
})

//it('can recover lost nodes', function() {
    // patch holes in commit-log
//})
