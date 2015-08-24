#Reticulum

> A simple gaze interaction manager for VR with Three.js. [See an example](http://gqpbj.github.io/Reticulum/)

![Material Design](http://gqpbj.github.io/Reticulum/examples/img/interactivepatterns_displayreticle.png)

##Purpose
Reticulum attempts to follow Google's interactive pattern for the [display reticle](http://www.google.com/design/spec-vr/interactive-patterns/display-reticle.html). It creates the illusion of depth by projecting spatially onto targeted objects while maintaining a fixed size so that it is easy to see at all times.


### Features:
- Reticle projects spatially onto targeted objects
- Display the reticle only when the user approaches a target that they can activate
- Avoids double vision and depth issues
- Gaze events for targeted objects `ongazeover`, `ongazeout` and `ongazelong`
- Built in [fuse support](http://www.google.com/design/spec-vr/interactive-patterns/controls.html#controls-fuse-buttons) 
- Works in the browser with Three.js 


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
	proximity: false,
	reticle: {
		visible: true,
		far: 1000, //Defines the reticle's resting point when no object has been targeted
		color: 0xcc0000,
		innerRadius: 0.0001,
		outerRadius: 0.003,
		hover: {
			color: 0xcc0000,
			innerRadius: 0.02,
			outerRadius: 0.024,
			speed: 5,
			vibrate: 50 //Set to 0 or [] to disable
		}
	},
	fuse: {
		visible: true,
		duration: 2.5,
		color: 0x00fff6,
		innerRadius: 0.045,
		outerRadius: 0.06,
		vibrate: 100 //Set to 0 or [] to disable
	}
});
```

### 3. Define targeted objects

Add the three.js objects you want to be targeted objects

```
Reticulum.addCollider( object );
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
Reticulum.update()
```


### 6. Add Camera to scene

If you require to display the reticle you will need to add the `camera` to the `scene`. 

```
scene.add(camera);
```

## Demos

- [Basic](http://gqpbj.github.io/Reticulum/)
- [Proximity](http://gqpbj.github.io/Reticulum/examples/proximity.html) - only display reticle if targeted object is visible
- [Depth Test](http://gqpbj.github.io/Reticulum/examples/depth.html) - hit moving targets 
- [Objects in Groups](http://gqpbj.github.io/Reticulum/examples/groups.html) - hit object in group, get world values 
- [Fuse](http://gqpbj.github.io/Reticulum/examples/fuse.html) - selective objects have fuse  

## Known Issues
- Ghosting occurs to the reticle and fuse when in VR mode. More details on the issue can found [here](https://github.com/mrdoob/three.js/issues/7041). A quick workaround to this issue is adding a second `effect.render(scene, camera);` to the callback of the `requestAnimationFrame()` method. 


## Acknowledgements:
Reticulum was inspired by the work done by [neuman](https://github.com/neuman/vreticle)

## License
The MIT License (MIT)