# hyperswarm 

Hyperswarm is an experimental mdns swarm with a shared distributed state.

It relies heavily on [multicast-dns](https://www.npmjs.com/package/multicast-dns) and [hyperemitter](https://www.npmjs.com/package/hyperemitter).

## Install

```sh
npm install --save hyperswarm
```

## Use

```js
var hswarm = require('hyperswarm')

// ComputerA
var a = hswarm('superswarm')

// ComputerB on the same network
var b = hswarm('superswarm')

// A little while later...
a.setState({ volume : 5 })
setTimeout(function() {
    b.state.get('volume') // => 5
},100)

// Computer C on the same network, even more later...
var c = hswarm('superswarm')
setTimeout(function() {
    c.state.get('volume') // => 5
},100)

// Cleanup
a.close()
b.close()
c.close()
```

## Changelog

### 1.0.0

* Initial release :tada:

enjoy.
