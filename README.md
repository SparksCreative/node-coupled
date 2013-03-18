coupled
=======

A component manager for node.js - inverts control of binding event emitters with listeners.

By specifying a shared context, loosely coupled components may receive events from each other without explicitly binding
 listeners to every other member. This functionality is provided to any class by wrapping it in the coupled function.


## Sample

```js
var coupled = require('../');

var Greeter = coupled(function (context) {
    this.setContext(context);
    this.greet = function(thing) { this.emit('greeting', thing); }
});

var English = coupled(function (context) {
    this.setContext(context);
    this.on('greeting', function(thing) { console.log('Hello %s!', thing); });
});

var French = coupled(function (context) {
    this.setContext(context);
    this.on('greeting', function(thing) { console.log('Bonjour %s!', thing); });
});

var German = coupled(function (context) {
    this.setContext(context);
    this.on('greeting', function(thing) { console.log('Hallo %s!', thing); });
});

var Spanish = coupled(function (context) {
    this.setContext(context);
    this.on('greeting', function(thing) { console.log('Hola %s!', thing); });
});



var context = 'SharedContext';

new English(context);
new French(context);
new German(context);
new Spanish(context);

new Greeter(context).greet('World');
```