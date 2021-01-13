#escs

An adaptation of an entity component system. escs (pronounced "essex") stands for Entity, Structure, Component, System

Install via [npm](https://www.npmjs.com):

```bash
npm install virtuosity
```

### Code Example

```js
// imports escs
var escs = require('escs');

// creates a component "position" with values x and y
var position = escs.component("position", (x, y)=>{
	return {
		x: x,
		y: y
	}
});

// creates an entity called foo
var foo = escs.entity("foo");
// adds the "position" component to "foo" with values x: 1, y: 2
foo.addComponent("position", 1, 2);


// foo_x_value is now "1"
var foo_x_value = foo.getComponent("position").x;


var health = escs.component("health", (health)=>{
	return {
		health: health
	}
});


var bar = escs.entity("bar");
bar.addComponent("position", 3, 4)
	.addComponent('health', 10);

//creates a system
print_position = escs.system(["position"], (entity)=>{
	// logs the y value of a given entity
	// since both foo and bar have the "position" component, it will print out 2 and 4 (the values for foo and bar respectively)
	console.log(entity.getComponent("position").y);
});

print_position_health = escs.system(["health", "position"], (entity)=>{
	// logs the y value of a given entity
	// since only bar has both the "position" component and the "health" component, it will only print out 4 (the value for bar)
	console.log(entity.getComponent("position").y);
});

// runs the print_position system
print_position.run();

print_position_health.run();
```