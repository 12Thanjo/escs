#escs

An adaptation of an entity component system. escs (pronounced "essex") stands for Entity, Singleton, Component, System

Install via [npm](https://www.npmjs.com):

```bash
npm install virtuosity
```

### Code Example

```js
// imports escs
var escs = require('escs');
var env = escs.add.environment('env');

// creates a component "position" with values x and y
var position = escs.add.component("position", "env", (x, y)=>{
 return {
     x: x,
     y: y
 }
});

// creates an entity called foo
var foo = escs.add.entity("foo", 'env');
// adds the "position" component to "foo" with values x: 1, y: 2
foo.addComponent("position", 1, 2);


// foo_x_value is now "1"
var foo_x_value = foo.getComponent("position").x;


var health = escs.add.component("health", "env", (health)=>{
 return {
     health: health
 }
});


var bar = escs.add.entity("bar", "env");
bar.addComponent("position", 3, 5)
 .addComponent('health', 10);

//creates a system
print_position = escs.add.system("print position", "env", (environment)=>{
     // logs the y value of a given entity
     // since both foo and bar have the "position" component, it will print out 2 and 5 (the values for foo and bar respectively)
     environment.getEntities('position').forEach((entity)=>{
         console.log(entity.getComponent("position").y);
     });
});

print_position_health = escs.add.system("print position health", "env", (environment)=>{
     // logs the y value of a given entity
     // since only bar has both the "position" component and the "health" component, it will only print out 5 (the value for bar)
     environment.getEntities(['position', 'health']).forEach((entity)=>{
         console.log(entity.getComponent("position").y);
     });
});

// runs the print_position system
print_position.run();

print_position_health.run();
```