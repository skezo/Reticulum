/// <reference path="typings/threejs/three.d.ts"/>
/*! Reticulum - v1.0.11 - 2015-08-14
 * http://gqpbj.github.io/examples/basic.html
 *
 * Copyright (c) 2015 Godfrey Q;
 * Licensed under the MIT license */

var Reticulum = (function () {
    var INTERSECTED = null;
    
    var collisionList = [];
    var raycaster;
    var vector;
    var clock;
    var reticle = {};
    var fuse = {};

    var frustum;
    var cameraViewProjectionMatrix;
    
    //Settings from user
    var settings = {
        camera:             null, //Required
        gazingDuration:     2.5,
        proximity:          false
    };
    
    //Fuse
    fuse.initiate = function( options ) {
        var parameters = options || {};
        
        this.color          = parameters.fuse.color         || 0x00fff6;
        this.innerRadius    = parameters.fuse.innerRadius   || reticle.innerRadiusTo;
        this.outerRadius    = parameters.fuse.outerRadius   || reticle.outerRadiusTo;
        this.phiSegments    = 3;
        this.thetaSegments  = 32;
        this.thetaStart     = Math.PI/2;
        
        
        //var geometry = new THREE.CircleGeometry( reticle.outerRadiusTo, 32, Math.PI/2, 0 );
        var geometry = new THREE.RingGeometry( this.innerRadius, this.outerRadius, this.thetaSegments, this.phiSegments, this.thetaStart, 0 );
       
        //Make Mesh
        this.timer = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { 
            color: this.color,
            side: THREE.BackSide
        }));
        
        this.timer.position.z = 0.0001; // Keep in front of reticle
        this.timer.rotation.y = 180*(Math.PI/180); //Make it clockwise
        
        //Add to reticle
        reticle.crosshair.add( this.timer );
    };
    
    fuse.out = function() {
        this.active = false;
        this.timer.visible = false;
        this.update(0);    
    }
    
    fuse.over = function() {
        this.active = true;
        this.update(0); 
        this.timer.visible = true; 
    }
    
    fuse.update = function(elapsed) {
        
        if(!this.active) return;
        
        //Morph
        //var time = Date.now() * 0.001;
        //this.ellipse.morphTargetInfluences[ 0 ] = (1 + Math.sin(4 * time)) / 2;

//--CIRCLE   
        // @radius — Radius of the circle, default = 50.
        // @segments — Number of segments (triangles), minimum = 3, default = 8.
        // @thetaStart — Start angle for first segment, default = 0 (three o'clock position).
        // @thetaLength — The central angle, often called theta, of the circular sector. The default is 2*Pi, which makes for a complete circle. 
      /*
        var elapsed = clock.getElapsedTime()*1000; //Convert into milliseconds
        var thetaStart = 0;
        var thetaLength = oscillation(Math.PI, elapsed, 1000, Math.PI);
        var vertices = this.ellipse.geometry.vertices;
        var faces = this.ellipse.geometry.faces;
        var fUV = this.ellipse.geometry.faceVertexUvs[ 0 ];
        var segments = vertices.length;
        var radius = reticle.outerRadiusTo;
        var uvs = [];
        var v = 0;
        var centerUV = new THREE.Vector2( 0.5, 0.5 );
        
        uvs.push( centerUV );
        
        //Skip the first one
        for ( v = 1; v < segments; v++ ) {
    
            var vertex = vertices[ v ];
            
            var segment = thetaStart + v / segments * thetaLength;
            
            vertex.x = radius * Math.cos( segment ); 
            vertex.y = radius * Math.sin( segment ); 
           
    
        }
        this.ellipse.geometry.verticesNeedUpdate = true;
        */
 //--CIRCLE EOF

//--RING
        //var elapsed = clock.getElapsedTime()*1000; //Convert into milliseconds
        //var thetaLength = oscillation(Math.PI, elapsed, settings.gazingDuration, Math.PI);
        var gazedTime = elapsed/settings.gazingDuration; 
        var thetaLength = gazedTime * (Math.PI*2);
        
        var vertices = this.timer.geometry.vertices;
        var radius = this.innerRadius;
        var radiusStep = ( ( this.outerRadius - this.innerRadius ) / this.phiSegments );
        var count = 0;
        
        for ( var i = 0; i < this.phiSegments + 1; i ++ ) { 
        
            for ( var o = 0; o < this.thetaSegments + 1; o++ ) {
            
                var vertex = vertices[ count ];
                var segment = this.thetaStart + o / this.thetaSegments * thetaLength;
                vertex.x = radius * Math.cos( segment ); 
                vertex.y = radius * Math.sin( segment ); 
                count++;
            }
            radius += radiusStep;  
        }
        
        this.timer.geometry.verticesNeedUpdate = true;
        
        //Disable fuse if reached 100%
        if(gazedTime >= 1) {
            this.active = false;
        }
//--RING EOF

        
    }
    
    //Reticle
    reticle.initiate = function( options ) {
        var parameters = options || {};
        
        this.active         = parameters.reticle.active        !== false; //default to true;
        this.visible        = parameters.reticle.visible       !== false; //default to true;
        this.far            = parameters.reticle.far           || settings.camera.far-10.0;
        this.color          = parameters.reticle.color         || 0xcc0000;
        this.colorTo        = parameters.reticle.colorTo       || 0xcc0000;
        this.innerRadius    = parameters.reticle.innerRadius   || 0.0001;
        this.outerRadius    = parameters.reticle.outerRadius   || 0.003;
        this.innerRadiusTo  = parameters.reticle.innerRadiusTo || 0.02;
        this.outerRadiusTo  = parameters.reticle.outerRadiusTo || 0.024;
        this.hit            = false;
        this.worldPosition  = new THREE.Vector3();
        //Animation options
        this.animate        = parameters.reticle.animate       !== false; //default to true;
        this.speed          = parameters.reticle.speed         || 5;
        this.moveSpeed      = 0;
        
        //If not active
        if(!this.active) return;
        
        //Geometry
        var geometry = new THREE.RingGeometry( this.innerRadius, this.outerRadius, 32, 3, 0, Math.PI * 2 );
        var geometryScale = new THREE.RingGeometry( this.innerRadiusTo, this.outerRadiusTo, 32, 3, 0, Math.PI * 2 );
        
        //Add Morph Targets for scale animation
        geometry.morphTargets.push( { name: "target1", vertices: geometryScale.vertices } );
        
        //Make Mesh
        this.crosshair = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { 
            color: this.color,
            morphTargets: true
        }));
        
        //set depth and scale
        this.setDepthAndScale();
        
        //Add to camera
        settings.camera.add( this.crosshair );
        
    };
    
    //Sets the depth and scale of the reticle - reduces eyestrain and depth issues 
    reticle.setDepthAndScale = function( depth ) {
        var crosshair = this.crosshair;
        var z = Math.abs( depth || this.far ); //Default to user far setting
        var cameraZ =  settings.camera.position.z;
        //Force reticle to appear the same size - scale
        //http://answers.unity3d.com/questions/419342/make-gameobject-size-always-be-the-same.html
        var scale = Math.abs( cameraZ - z ) - Math.abs( cameraZ );
        
        //Set Depth
        crosshair.position.x = 0;
        crosshair.position.y = 0;
        crosshair.position.z = THREE.Math.clampBottom( z, settings.camera.near+0.1 ) * -1;
        
        //Set Scale
        crosshair.scale.set( scale, scale, scale );
    };
    
    reticle.update = function(delta) {
        //If not active
        if(!this.active) return;
        
        var accel = delta * this.speed;
        
        if( this.hit ) {
            this.moveSpeed += accel;
            this.moveSpeed = Math.min(this.moveSpeed, 1);
        } else {
            this.moveSpeed -= accel;
            this.moveSpeed = Math.max(this.moveSpeed, 0);
        }
        //Morph
        this.crosshair.morphTargetInfluences[ 0 ] = this.moveSpeed;
    };

    var initiate = function (camera, options) {
        //Update Settings:
        if (options) {
            settings.camera = camera; //required
            settings.gazingDuration = options.gazingDuration || settings.gazingDuration;
            settings.proximity = options.proximity || settings.proximity;
            options.reticle = options.reticle || {};
            options.fuse = options.fuse || {};
        }
        
        //Raycaster Setup
        raycaster = new THREE.Raycaster();
        vector = new THREE.Vector2(0, 0);

        //Proximity Setup
        if( settings.proximity ) {
            frustum = new THREE.Frustum();
            cameraViewProjectionMatrix = new THREE.Matrix4();
        }
        
        //Clock Setup
        clock = new THREE.Clock(true);
        
        //Initiate Reticle
        reticle.initiate(options);
        
        //Initiate Fuse
        fuse.initiate(options);
    };
    
    var proximity = function() {
        var camera = settings.camera;
        var showReticle = false;
        
        //Use frustum to see if any targetable object is visible
        //http://stackoverflow.com/questions/17624021/determine-if-a-mesh-is-visible-on-the-viewport-according-to-current-camera
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

        frustum.setFromMatrix( cameraViewProjectionMatrix );
        

        for( var i =0, l=collisionList.length; i<l; i++) {

            var newObj = collisionList[i];

            if(!newObj.gazeable) {
                continue;
            }

            if( frustum.intersectsObject( newObj ) ) {
                showReticle = true;
                break;
            }

        }
        reticle.crosshair.visible = showReticle;
        
    };

    var detectHit = function() {
        try {
            raycaster.setFromCamera( vector, settings.camera );
        } catch (e) {
            //Assumes PerspectiveCamera for now... 
            //Support for Three.js < rev70
            raycaster.ray.origin.copy( settings.camera.position );
            raycaster.ray.direction.set( vector.x, vector.y, 0.5 ).unproject( settings.camera ).sub( settings.camera.position ).normalize();
        }

        //
        var intersects = raycaster.intersectObjects(collisionList);
        //Detect
        if (intersects.length) {

            var newObj = intersects[ 0 ].object

            //Is it a new object?
            if( INTERSECTED != newObj ) {
                //If old INTERSECTED i.e. not null reset and gazeout 
                if ( INTERSECTED ) {
                    gazeOut(INTERSECTED);
                };
                
                //If new object is not gazeable skip it.
                if (!newObj.gazeable) {
                    return;
                }

                //Updated INTERSECTED with new object
                INTERSECTED = newObj;
                //Is the object gazeable?
                //if (INTERSECTED.gazeable) {
                    //Yes
                    gazeOver(INTERSECTED);
                //}
            } else {
                //Ok it looks like we are in love
                gazeLong(INTERSECTED);
            }

        } else {
            //Is the object gazeable?
            //if (INTERSECTED.gazeable) {
                if (INTERSECTED) {
                    //GAZE OUT
                    gazeOut(INTERSECTED);
                }
            //}
            INTERSECTED = null;

        }
    };

    var gazeOut = function(threeObject) {
        threeObject.hitTime = 0;
        if(threeObject.fuse) {
            fuse.out();    
        }
        if ( reticle.active ) {
            reticle.hit = false;
            reticle.setDepthAndScale();
        }
        if ( threeObject.ongazeout != undefined ) {
            threeObject.ongazeout();
        }
    };

    var gazeOver = function(threeObject) {
        if(threeObject.fuse) {
            fuse.over();    
        }
        threeObject.hitTime = clock.getElapsedTime();
        //Does object have an action assigned to it?
        if (threeObject.ongazeover != undefined) {
            threeObject.ongazeover();
        }
    };

    var gazeLong = function( threeObject ) {
        var distance;
        var elapsed = clock.getElapsedTime();
        var gazeTime = elapsed - threeObject.hitTime;
         //There has to be a better  way...
         //Keep updating distance while user is focused on target
        if( reticle.active ) {
            reticle.worldPosition.setFromMatrixPosition( threeObject.matrixWorld ); 
            distance = settings.camera.position.distanceTo( reticle.worldPosition );
            distance -= threeObject.geometry.boundingSphere.radius;
            reticle.hit = true;
            reticle.setDepthAndScale( distance );
        }
        
        //Fuse
        if(threeObject.fuse) {
            fuse.update(gazeTime);    
        }
        
        if( gazeTime >= settings.gazingDuration ) {
            //Does object have an action assigned to it?
            if (threeObject.ongazelong != undefined) {
                threeObject.ongazelong();
            }
            //Reset the clock
            threeObject.hitTime = elapsed;
        }
    };

    
    return {
        addCollider: function (threeObject, options) {
            var parameters = options || {};
            threeObject.fuse = parameters.fuse !== false; //default to true;
            threeObject.gazeable = true;
            
            collisionList.push(threeObject);
        },
        removeCollider: function (threeObject) {
            var index = collisionList.indexOf(threeObject);
            threeObject.gazeable = false;
            if (index > -1) {
                collisionList.splice(index, 1);
            }
        },
        update: function () {
            var delta = clock.getDelta(); //
            detectHit();
            
            //Proximity
            if(settings.proximity) {
                proximity();
            }
            
            //Animation
            if( reticle.animate ) {
                reticle.update(delta);
            }
            
        },
        init: function (camera, options) {
            var c = camera || null;
            var o = options || {};
            if ( !c instanceof THREE.Camera ) {
                console.error("ERROR: Camera was not correctly defined. Unable to initiate Reticulum.");
                return;
            }
            initiate(c, o);
        }
    };
})();