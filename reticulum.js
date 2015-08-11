/* global THREE */
/*! Reticulum - v1.0.7 - 2015-08-11
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
    var settings = {};

    var frustum;
    var cameraViewProjectionMatrix;

    //Required from user
    settings.camera = null;

    //Gazing
    settings.gazingDuration = 2.5;

    //Proximity
    settings.proximity = false;
    
    //Reticle
    reticle.initiate = function( options ) {
        this.active         = options.reticle.active        || true;
        this.far            = options.reticle.far           || settings.camera.far-10.0;
        this.color          = options.reticle.color         || 0xcc0000;
        this.innerRadius    = options.reticle.innerRadius   || 0.004;
        this.outerRadius    = options.reticle.outerRadius   || 0.005;
        this.scaleTo        = options.reticle.scaleTo       || 2;
        this.scale          = 1;
        this.size           = 0;
        
        //Build
        var geometry = new THREE.RingGeometry( this.innerRadius, this.outerRadius, 32, 3, 0, Math.PI * 2 );
        var material = new THREE.MeshBasicMaterial({
            color: new THREE.Color( this.color ),
            side: THREE.FrontSide
        });
        this.crosshair = new THREE.Mesh( geometry, material );
        
        //Prep size
        this.setPosition();
        
        //Add to camera
        settings.camera.add( this.crosshair );
    };
    
    reticle.setPosition = function( transformZ ) {

        var crosshair = this.crosshair;
        var z = transformZ || this.far; //Default to user far setting

        crosshair.position.x = 0;
        crosshair.position.y = 0;
        crosshair.position.z = Math.abs(z)*-1;

        //If you set position you got to set the size 
        this.setSize();
        this.setScale();
    };
    
    reticle.setSize = function() {
        var crosshairZ = this.crosshair.position.z;
        var cameraZ =  settings.camera.position.z;
        //Force reticle to appear the same size
        //http://answers.unity3d.com/questions/419342/make-gameobject-size-always-be-the-same.html
        this.size = Math.abs( cameraZ - crosshairZ ) - Math.abs( cameraZ );
    };
    
    reticle.setScale = function( ) {
        var sizeTo = this.size * this.scale;
        this.crosshair.scale.set( sizeTo, sizeTo, sizeTo );
    };
    
    reticle.update = function( delta ) {
        
    };

    var initiate = function (camera, options) {
        //Update Settings:
        if (options) {
            settings.camera = camera || settings.camera;
            settings.gazingDuration = options.gazingDuration || settings.gazingDuration;
            settings.proximity = options.proximity || settings.proximity;
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
        if( settings.camera ) {
            reticle.initiate(options);
        }
    };

    /*var positionAndReizeReticle = function( transformZ ) {

        var distance;
        var z = transformZ || settings.reticle.far; //Set it to its furthest viewing - this might be worth changing to a focus depth instead...

        reticle.position.x = 0;
        reticle.position.y = 0;
        reticle.position.z = Math.abs(z)*-1;

        //Force reticle to appear the same size
        //http://answers.unity3d.com/questions/419342/make-gameobject-size-always-be-the-same.html
        distance = Math.abs(settings.camera.position.z - reticle.position.z) - Math.abs(settings.camera.position.z);
        scaleReticle( 1, distance );

        return distance;
    };*/

    /*var scaleReticle = function( scale, size ) {
        var scaleTo = scale || 1;
        var resize = (size || newReticleScale) * scaleTo;
        reticle.scale.set( resize, resize, resize );
    };*/
    
    var proximity = function() {
        var camera = settings.camera;
        var showReticle = false;
        // every time the camera or objects change position (or every frame)

        camera.updateMatrixWorld(); // make sure the camera matrix is updated
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
        if( reticle.active ) {
            //Scale reticle 
            //positionAndReizeReticle();
            reticle.scale = 1;
            reticle.setPosition();
        }
        if (threeObject.ongazeout != undefined) {
            threeObject.ongazeout();
        }

    };

    var gazeOver = function(threeObject) {
        var distance;
        threeObject.hitTime = clock.getElapsedTime();
        //There has to be a better  way...
        if( reticle.active ) {
            distance = settings.camera.position.distanceTo(threeObject.position);
            distance -= threeObject.geometry.boundingSphere.radius;
            //newReticleScale = positionAndReizeReticle( objectsCore );
            //scaleReticle( settings.reticle.scale );
            reticle.scale = reticle.scaleTo;
            reticle.setPosition( distance );
        }

        if (threeObject.ongazeover != undefined) {
            threeObject.ongazeover();
        }
    };

    var gazeLong = function( threeObject ) {
        var elapsed = clock.getElapsedTime();
        if( elapsed - threeObject.hitTime >= settings.gazingDuration ) {
            if (threeObject.ongazelong != undefined) {
                threeObject.ongazelong();
            }
            //Reset the clock
            threeObject.hitTime = elapsed;
        }

    }


    return {
        addCollider: function (threeObject) {
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
        update: function (threeObject) {
            detectHit();
            if(settings.proximity) {
                proximity();
            }
        },
        destroy: function (options) {
            //clean up
        },
        init: function (camera, options) {
            var c = camera || null;
            var o = options || {};
            if ( c === null || c.constructor != THREE.PerspectiveCamera  ) {
                console.error("ERROR: Camera was not correctly defined. Unable to initiate Reticulum.");
                return;
            }
            initiate(c, o);
        }
    };
})();