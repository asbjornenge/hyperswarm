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
var a = hswarm('superswarm').start()

// ComputerB on the same network
var b = hswarm('superswarm').start()

// A little while later...
a.setState({ nob : 5 })
setTimeout(function() {
    b.state.get('nob') // => 5
},100)

// Computer C on the same network, even more later...
var c = hswarm('superswarm').start()
setTimeout(function() {
    c.state.get('nob') // => 5
},100)
```

## Changelog

### 1.0.0

* Initial release :tada:

enjoy.
