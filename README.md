#Reticulum

> A simple gaze interaction manager for VR with Three.js. [See an example](http://gqpbj.github.io/Reticulum/example/)

![Material Design](http://gqpbj.github.io/Reticulum/example/img/interactivepatterns_displayreticle.png)

##Purpose
Reticulum attempts to follow Google's interactive pattern for the [display reticle](http://www.google.com/design/spec-vr/interactive-patterns/display-reticle.html). It creates the illusion of depth by projecting spatially onto targeted objects while maintaining a fixed size so that it is easy to see at all times.


### Features:
- Reticle projects spatially onto targeted objects
- Gaze events for targeted objects `ongazeover`, `ongazeout` and `ongazelong`
- Supports [fuse buttons](http://www.google.com/design/spec-vr/interactive-patterns/controls.html#controls-fuse-buttons) 


### 1. Getting Started

Load Three.js and include the Reticulum.js file. You might also want to use the [Web VR boilerplate](https://github.com/borismus/webvr-boilerplate):

```html
<script src="three.js"></script>
<script src="reticulum.js"></script>

```

### 2. Initiate and set options

Call the Reticulum initializer function and set your options.

**Note:** You must define the `camera`... it is required. 

```javascript
Reticulum.init(camera, {
	gazingDuration: 2.5,
	reticle: {
		visible: true,
		color: 0xcc0000,
		radius: 0.005,
		tube: 0.001,
		far: 1000 //Defines the reticle's resting point when no object has been targeted
	}
});
```

### 3. Define targeted objects

Add the three.js objects you want to be targeted objects

```
Reticulum.addCollider(object);
``` 

### 4. Define gaze events

```javascript
object.ongazeover = function(){
	// have the object react when user looks at it
	this.material.emissive.setHex( 0xffcc00 );
}

object.ongazeout = function(){
	// have the object react when user looks away from it
	this.material.emissive.setHex( 0xcc0000 );
}

object.ongazelong = function(){
	// have the object react when user looks at it for a specific time
	this.material.emissive.setHex( 0x0000cc );
}
```


### 5. Add to animation loop

Add Reticulum to your animation loop 

```
Reticulum.loop()
```


### 6. Add Camera to scene

If you require to display the reticle you will need to add the `camera` to the `scene`. 

```
scene.add(camera);
```

## Demos

- [Basic Example](http://gqpbj.github.io/Reticulum/example/)


## Acknowledgements:
Reticulum was inspired by the work done by [neuman](https://github.com/neuman/vreticle)

## License
The MIT License (MIT)