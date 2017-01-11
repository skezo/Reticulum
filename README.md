#Reticulum

> A simple gaze interaction manager for VR with Three.js. [See examples](https://skezo.github.io/Reticulum/)

![Material Design](https://skezo.github.io/Reticulum/examples/img/interactivepatterns_displayreticle.png)

##Purpose
Reticulum attempts to follow Google's interactive pattern for the [display reticle](http://www.google.com/design/spec-vr/interactive-patterns/display-reticle.html). It creates the illusion of depth by projecting spatially onto targeted objects while maintaining a fixed size so that it is easy to see at all times.


### Features:
- Avoids double vision and depth issues by projecting spatially onto targeted objects
- Gaze and click events for targeted objects `onGazeOver`, `onGazeOut`, `onGazeLong` and `onGazeClick`
- Set different fuze durations for targeted objects
- Built in [fuse support](http://www.google.com/design/spec-vr/interactive-patterns/controls.html#controls-fuse-buttons)
- Display the reticle only when the camera can see a targeted object 
- Works in the browser with Three.js (r73)


### 1. Getting Started

Load Three.js and include the Reticulum.js file. You might also want to use the [Web VR boilerplate](https://github.com/borismus/webvr-boilerplate):

```html
<script src="three.js"></script>
<script src="reticulum.js"></script>

```

### 2. Initiate and set options

Call the Reticulum initializer function and set your options. Options can be set globally or per targeted object. 

**Note:** You must define the `camera`... it is required. 

```javascript
Reticulum.init(camera, {
	proximity: false,
	clickevents: true,
	near: null, //near factor of the raycaster (shouldn't be negative and should be smaller than the far property)
	far: null, //far factor of the raycaster (shouldn't be negative and should be larger than the near property)
	reticle: {
		visible: true,
		restPoint: 1000, //Defines the reticle's resting point when no object has been targeted
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
		vibrate: 100, //Set to 0 or [] to disable
		clickCancelFuse: false //If users clicks on targeted object fuse is canceled
	}
});
```

### 3. Define targeted objects and options

Add the three.js objects you want to be targeted objects. Override global options by setting local ones.

```javascript

Reticulum.add( object, {
	clickCancelFuse: true, // Overrides global setting for fuse's clickCancelFuse
	reticleHoverColor: 0x00fff6, // Overrides global reticle hover color
	fuseVisible: true, // Overrides global fuse visibility
	fuseDuration: 1.5, // Overrides global fuse duration
	fuseColor: 0xcc0000, // Overrides global fuse color
	onGazeOver: function(){
		// do something when user targets object
		this.material.emissive.setHex( 0xffcc00 );
	},
	onGazeOut: function(){
		// do something when user moves reticle off targeted object
		this.material.emissive.setHex( 0xcc0000 );
	},
	onGazeLong: function(){
		// do something user targetes object for specific time
		this.material.emissive.setHex( 0x0000cc );
	},
	onGazeClick: function(){
		// have the object react when user clicks / taps on targeted object
		this.material.emissive.setHex( 0x0000cc );
	}
});
``` 

You can also remove targeted objects.
```javascript
Reticulum.remove( object );
```


### 4. Add to animation loop

Add Reticulum to your animation loop 

```javascript
Reticulum.update()
```


### 5. Add Camera to scene

If you require to display the reticle you will need to add the `camera` to the `scene`. 

**Note:** See Known Issues below if ghosting occurs. 

```javascript
scene.add(camera);
```

## Demos

- [Basic](https://skezo.github.io/Reticulum/examples/basic.html)
- [Proximity](https://skezo.github.io/Reticulum/examples/proximity.html) - only display reticle if targeted object is visible
- [Depth Test](https://skezo.github.io/Reticulum/examples/depth.html) - hit moving targets 
- [Objects in Groups](https://skezo.github.io/Reticulum/examples/groups.html) - hit object in group, get world values 
- [Fuse](https://skezo.github.io/Reticulum/examples/fuse.html) - selective objects have fuse
- [Visibility](https://skezo.github.io/Reticulum/examples/visibility.html) - test for hitting only visible objects  
- [Gazeable](https://skezo.github.io/Reticulum/examples/gazeable.html) - test for hitting only gazeable objects  

## Known Issues
- Ghosting occurs to the reticle and fuse when in VR mode. More details on the issue can found [here](https://github.com/mrdoob/three.js/issues/7041). **A quick workaround** to this issue is adding `camera.updateMatrixWorld();` before the render call (e.g. `manager.render(scene, camera, timestamp);` to the callback function of the `requestAnimationFrame()` method. 


## Acknowledgements:
Reticulum was inspired by the work done by [neuman](https://github.com/neuman/vreticle)

## License
The MIT License (MIT)