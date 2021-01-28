//event emitting object
var EEO = function(entity, obj, event){
	this.entity = entity;
	this.values = obj;
	this.event = event;
	var keys = Object.keys(obj);

	keys.forEach((key)=>{
		Object.defineProperty(this, key, {
			get: ()=>{
				return this.values[key];
			}, set: (val)=>{
				this.values[key] = val;
				this.event(this.entity, key, val);
			}
		});
	});
}

var environments = new Map();
var Environment = function(name){
	this.name = name;
	this.entities = new Map();
	this.components = new Map();
	this.systems = new Map();
	this.tags = new Map();

	this.getEntity = function(name){
		return this.entities.get(name);
	}

	this.getEntities = function(components){
		if(typeof components != "string"){
			var component = this.components.get(components.shift());
			var output = [];
			component.entities.forEach((entity)=>{
				var match = true;
				for(var i = components.length - 1; i>=0; i--){
					if(!entity.components.has(components[i])){
						match = false;
						break;
					}
				}

				if(match){
					output.push(entity);
				}
			});
			return output;
		}else{
			return Array.from(this.components.get(components).entities.values());
		}
	}

	this.getEntitiesTag = function(tags){
		if(typeof tags != "string"){
			var component = this.tags.get(tags.shift());
			var output = [];
			component.entities.forEach((entity)=>{
				var match = true;
				for(var i = tags.length - 1; i>=0; i--){
					if(!entity.tags.has(tags[i])){
						match = false;
						break;
					}
				}

				if(match){
					output.push(entity);
				}
			});
			return output;
		}else{
			return Array.from(this.tags.get(tags).entities.values());
		}
	}

	this.getComponent = function(name){
		return this.components.get(name);
	}

	this.getSystem = function(name){
		return this.systems.get(name);
	}

	this.getTag = function(name){
		return this.tags.get(name);
	}


	environments.set(name, this);
}

var Entity = function(name, environment){
	this.name = name;
	this.components = new Set();
	this.tags = new Set();
	this.environment = environment;
	if(environments.has(environment)){
		var env = environments.get(environment);
		if(!env.entities.has(name)){
			env.entities.set(name, this);
		}else{
			console.warn(`entity "${name}" was already set and has been overwritten`);
		}
	}else{
		console.error(`environment "${environment}" is not set`);
	}

	this.addComponent = function(component_name, ...parameters){
		this.components.add(component_name);
		environments.get(this.environment).components.get(component_name).addEntity(this, ...parameters);
		return this;
	}

	this.getComponent = function(component_name){
		return environments.get(this.environment).components.get(component_name).properties.get(this.name);
	}

	this.removeComponent = function(component_name){
		this.components.delete(component_name);
		environments.get(this.environment).components.get(component_name).removeEntity(this);	
	}


	this.addTag = function(tag_name){
		this.tags.add(tag_name);
		environments.get(this.environment).tags.get(tag_name).addEntity(this);
		return this;
	}

	this.hasTag = function(tag_name){
		return this.tags.has(tag_name);
	}

	this.removeTag = function(tag_name){
		this.tags.delete(tag_name);
		environments.get(this.environment).tags.get(tag_name).removeEntity(this);	
	}
}

var Component = function(name, environment, init){
	this.name = name;
	this.init = init;
	this.entities = new Map();
	this.properties = new Map();

	if(environments.has(environment)){
		environments.get(environment).components.set(name, this);
	}else{
		console.error(`environment ${environment} is not set`);
	}

	this.onChange = ()=>{};

	this.addEntity = function(entity, ...parameters){
		this.entities.set(entity.name, entity);
		this.properties.set(entity.name, new EEO(entity, this.init(...parameters), this.onChange));
	}

	this.removeEntity = function(entity){
		this.entities.delete(entity.name);
		this.entities.delete(entity.name);
	}

	this.setOnChange = function(func){
		this.properties.forEach((prop)=>{
			prop.event = func;
		});
		this.onChange = func;
	}
}

var System = function(name, environment, run){
	this.name = name;
	this.run = ()=>{
		run(environments.get(environment));
	}
	if(environments.has(environment)){
		environments.get(environment).systems.set(name, this);
	}else{
		console.error(`environment ${environment} is not set`);
	}
}

var singletons = new Map();
var Singleton = function(name, obj){
	singletons.set(name, obj);
}

var tags = new Map();
var Tag = function(name, environment){
	this.name = name;
	this.environment = environment;
	this.entities = new Map();
	tags.set(name, this);
	environments.get(environment).tags.set(name, this);

	this.addEntity = function(entity){
		this.entities.set(entity.name, entity);
	}

	this.removeEntity = function(entity){
		this.entities.delete(entity.name);
	}
}


module.exports = {
	add:{
		entity: (name, environment)=>{
			return new Entity(name, environment);
		},
		component: (name, environment, init)=>{
			return new Component(name, environment, init);
		},
		system: (name, environment, run)=>{
			return new System(name, environment, run);
		},
		environment: (name)=>{
			return new Environment(name);
		},
		singleton: (name, obj)=>{
			new Singleton(name, obj);
		},
		tag: (name, environment)=>{
			new Tag(name, environment);
		}
	},
	get: {
		entity: (name, environment)=>{
			return environments.get(environment).entities.get(name);
		},
		component: (name, environment)=>{
			return environments.get(environment).components.get(name);
		},
		system: (name, environment)=>{
			return environments.get(environment).systems.get(name);
		},
		environment: (name)=>{
			return environments.get(name);
		},
		singleton: (name)=>{
			return singletons.get(name);
		}
	},
	delete: {
		entity: (name, environment)=>{
			entities.delete(name);
		},
		component: (name, environment)=>{
			components.delete(name);
		},
		system: (name, environment)=>{
			systems.delete(name);
		},
		environment: (name, environment)=>{
			environments.delete(name);
		},
		singleton: (name)=>{
			singletons.delete(name);
		},
		tag: (tag, environment)=>{
			tags.delete(tag);
		}
	},
}