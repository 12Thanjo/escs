/*
* @name escs
* @type head
* @description An adaptation of an entity component system. escs (pronounced "essex") stands for Entity, Structure, Component, System
*/




//event emitting object
var EEO = function(obj, event){
	this.values = obj;
	this.event = event;
	var keys = Object.keys(obj);

	keys.forEach((key)=>{
		Object.defineProperty(this, key, {
			get: ()=>{
				return this.values[key];
			}, set: (val)=>{
				this.values[key] = val;
				this.event(key, val);
			}
		});
	});
}




/*
* @name Entity
* @type obj
* @description Entity
* @param {name}{String or Number}{unique name of the Entity}
*/
var Entity = function(name){
	this.name = name;
	this.components = new Set();

	/*
	* @name addComponent
	* @type method
	* @description adds a Component to the Entity 
	* @parent Entity
	* @param {component_name}{String or Number}{name of the Component}
	* @param {...parameters}{params}{parameters to pass to the Component creation}
	*/
	this.addComponent = function(component_name, ...parameters){
		this.components.add(component_name);
		components.get(component_name).addEntity(this, ...parameters);
		return this;
	}

	/*
	* @name getComponent
	* @type method
	* @description returns the value of a Component
	* @parent Entity
	* @param {component_name}{String or Number}{name of the Component}
	*/
	this.getComponent = function(component_name){
		return components.get(component_name).properties.get(this.name);
	}


	/*
	* @name removeComponent
	* @type method
	* @description removes a Component
	* @parent Entity
	* @param {component_name}{String or Number}{name of the Component}
	*/
	this.removeComponent = function(component_name){
		this.components.delete(component_name);
		components.get(component_name).removeEntity(this);	
	}
}


/*
* @name Structure
* @type obj
* @description structure
* @param {name}{String or Number}{unique name of the Structure}
*/
var Structure = function(name){
	this.name = name;
}


/*
* @name Component
* @type obj
* @description component
* @param {name}{String or Number}{unique name of the Structure}
* @param {init}{Function}{function to run to initialize the component when added to an Entity. The function should return an object, which will be the Entitity's value of this Component}
*/

/*
* @name init
* @type options
* @parent Component
* @option {...parameters}{parameters to pass to the Component creation}
*/
components = new Map();
var Component = function(name, init){
	this.name = name;
	this.init = init;
	this.entities = new Map();
	this.properties = new Map();
	this.onChange = ()=>{};

	this.addEntity = function(entity, ...parameters){
		this.entities.set(entity.name, entity);
		this.properties.set(entity.name, new EEO(this.init(...parameters), this.onChange));
	}

	this.removeEntity = function(entity){
		this.entities.delete(entity.name);
		this.entities.delete(entity.name);
	}

	/*
	* @name setOnChange
	* @type method
	* @description sets the funtion to run when the value of this component type is changed
	* @parent Component
	*/
	this.setOnChange = function(func){
		this.properties.forEach((prop)=>{
			prop.event = func;
		});
		this.onChange = func;
	}

	components.set(name, this);
}


/*
* @name System
* @type obj
* @description system
* @param {entity_types}{String[]}{gets all entities with all of the given components. For optimal performance, the first in the array should be the component that applies to the fewwst entities}
* @param {run}{function}{function for the system to run. Takes entity as a parameter}
*/
var System = function(entity_types, run){

	/*
	* @name run
	* @type method
	* @description runs the system
	* @parent System
	*/
	this.run = function(){
		// var system_entities = [];
		components.get(entity_types[0]).entities.forEach((entity)=>{
			var match = true;
			for(var i = entity_types.length - 1; i>=1; i--){
				if(!entity.components.has(entity_types[i])){
					match = false;
				}
			}
			if(match){
				// system_entities.push(entity);
				run(entity);
			}
		});

	}
}



module.exports = {
	entity: (name)=>{
		return new Entity(name);
	},
	structure: ()=>{
		return new Structure();
	},
	component: (name, properties)=>{
		return new Component(name, properties);
	},
	system: (entity_types, run)=>{
		return new System(entity_types, run);
	}
}