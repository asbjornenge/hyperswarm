var assert = require('assert')
var memdb  = require('memdb')
var hswarm = require('../')

it('can auto-hswarm', function(done) {
    var a = hswarm('superservice')
    var b = hswarm('superservice')
    // Allow a little time for the discovery
    setTimeout(function() {
        var a_peerIds = a.peers.map(function(peer) { return peer.id })
        var b_peerIds = b.peers.map(function(peer) { return peer.id })
        assert(a_peerIds.indexOf(b.id) >= 0 && a.peers.length == 1)
        assert(b_peerIds.indexOf(a.id) >= 0 && b.peers.length == 1)
        a.close()
        b.close()
        setTimeout(done, 100)
    }, 200)
})

it('shares a distributed state', function(done) {
    var a = hswarm('superservice2')
    var b = hswarm('superservice2')
    a.setState({ reincarnation : 'yolo' })
    b.setState({ lives : [1,2,3], eple : { kake : 'moms'}})
    // Allow a little time for propagation
    setTimeout(function() {
        assert(b.state.get('reincarnation') == 'yolo')
        assert(a.state.get('lives').get(0) == 1)
        // Start a new from scratch
        var c = hswarm('superservice2')
        setTimeout(function() {
            assert(c.state.get('eple').get('kake') == 'moms')
            a.close()
            b.close()
            c.close()
            setTimeout(done, 100)
        },250)
    }, 250)
})

// Kida silly netsplit test, but netsplits are hard to simulate
it('can recover from netsplits', function(done) {
    var bdb = memdb()
    var a = hswarm('shakynetworkswarm')
    var b = hswarm('shakynetworkswarm', { db : bdb })
    a.setState({ volume : 5 })
    setTimeout(function() {
        assert(b.state.get('volume') == 5)
        b.close()
        a.setState({ volume : 6 })
        a.setState({ volume : 7 })
        a.setState({ volume : 8 })
        bdb.open(function() {
            var c = hswarm('shakynetworkswarm', { db : bdb })
            var changes = 0
            var test = function(change) {
                changes += 1
                if (changes == 3) { 
                    a.close()
                    c.close()
                    done() 
                }
            }
            c.on('change', test)
        })
    },350)
})

it('emits events on peer and statechange', function(done) {
    var events = []
    var test = function(type) {
        events.push(type)
        if (events.indexOf('peer') < 0) return
        if (events.indexOf('change') < 0) return
        a.close()
        b.close()
        done()
    }
    var a = hswarm('superswarm3')
    a.on('peer', test.bind(undefined, 'peer'))
    a.on('change', test.bind(undefined, 'change'))
    var b = hswarm('superswarm3')
    b.setState({ yolo : 'yeah'})
})


