#Reticulum

> A gaze interaction manager for VR with three.js, supporting depth.  [http://gqpbj.github.io/reticulum/example](http://gqpbj.github.io/reticulum/example)


## How to use

Example of initiating Reticulum with all options:

```
Reticulum.init({
	camera: camera,
	gazing_duration: 2.5,
	crosshair: {
		visible: true,
		color: 0xcc0000,
		radius: 0.005,
		tube: 0.001
	}
});

```

Assign gaze events to objects:

```
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

Add object to be tracked

```
Reticulum.addCollider(object);


Add Reticulum to your animation loop 

```
Reticulum.loop()
```

## To do
Clean up "crosshair"

## Acknowledgements:
Reticulum is an adaptation from the work done by [neuman](https://github.com/neuman/vreticle)