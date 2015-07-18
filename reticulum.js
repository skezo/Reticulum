/*! Reticulum - v1.0.3 - 2015-07-18
 * http://gqpbj.github.io/
 *
 * Copyright (c) 2015 Godfrey Q;
 * Licensed under the MIT license */

var Reticulum = (function () {
    var INTERSECTED = null;
    var collisionList = [];
    var raycaster;
    var vector;
    var clock;
    var reticle;
    var newReticleScale;
    var previousReticleScale;
    var settings = {};

    //Required from user
    settings.camera = null;

    //Gazing
    settings.gazingDuration = 2.5;
    
    //Reticle
    settings.reticle = {};
    settings.reticle.far = null;
    settings.reticle.visible = true;
    settings.reticle.color = 0xcc0000;
    settings.reticle.innerRadius = 0.004;
    settings.reticle.outerRadius = 0.005;
    settings.reticle.scale = 2;

    var initiate = function (camera, options) {
        //Update Settings:
        if (options) {
            settings.camera = camera || settings.camera;
            settings.gazingDuration = options.gazingDuration || settings.gazingDuration;
            settings.reticle.visible = options.reticle.visible || settings.reticle.visible;
            settings.reticle.color = options.reticle.color || settings.reticle.color;
            settings.reticle.innerRadius = options.reticle.innerRadius || settings.reticle.innerRadius;
            settings.reticle.outerRadius = options.reticle.outerRadius || settings.reticle.outerRadius;
            settings.reticle.far = options.reticle.far || settings.camera.far-10.0;
            settings.reticle.scale = options.reticle.scale || settings.reticle.scale;
        }
        //
        raycaster = new THREE.Raycaster();
        vector = new THREE.Vector2(0, 0);

        //
        clock = new THREE.Clock(true);

        if(settings.reticle.visible) {
            createReticle();
        }
    };

    var createReticle = function() {
        var geometry = new THREE.RingGeometry(  settings.reticle.innerRadius, settings.reticle.outerRadius, 32, 3, 0, Math.PI * 2 );
        var material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(settings.reticle.color),
            side: THREE.FrontSide
        });
        reticle = new THREE.Mesh(geometry, material);
        reticle.visible = settings.reticle.visible;

        if(settings.camera) {
            newReticleScale = positionAndReizeReticle();
            settings.camera.add( reticle );
        }
    };

    var positionAndReizeReticle = function( transformZ ) {

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
    };

    var scaleReticle = function( scale, size ) {
        var scale = scale || 1;
        var size = (size || newReticleScale) * scale;
        reticle.scale.set( size, size, size );
    };

    var scale = function() {
        if( newReticleScale === previousReticleScale) {
            return;
        }
    console.log( previousReticleScale, newReticleScale)
        previousReticleScale = newReticleScale;
        
    }

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

            //Is it a new object?
            if( INTERSECTED != intersects[ 0 ].object ) {
                //If old INTERSECTED i.e. not null reset and gazeout 
                if ( INTERSECTED ) {
                    gazeOut(INTERSECTED);
                };
                
                //Updated INTERSECTED with new object

                INTERSECTED = intersects[ 0 ].object;
                //Is the object gazeable?
                if (INTERSECTED.gazeable) {
                    //Yes
                    gazeOver(INTERSECTED);
                }
            } else {
                //Ok it looks like we are in love
                gazeLong(INTERSECTED);
            }

        } else {

            if (INTERSECTED) {
                //GAZE OUT
                gazeOut(INTERSECTED);
                if( reticle ) {
                    //Scale reticle 
                    positionAndReizeReticle();
                }
            }
            INTERSECTED = null;

        }
    };

    var gazeOut = function(threeObject) {
        threeObject.hitTime = 0;
        if (threeObject.ongazeout != undefined) {
            threeObject.ongazeout();
        }
    };

    var gazeOver = function(threeObject) {
        var objectsCore;
        threeObject.hitTime = clock.getElapsedTime();
        //There has to be a better  way...
        if( reticle ) {
            objectsCore = settings.camera.position.distanceTo(threeObject.position);
            objectsCore -= threeObject.geometry.boundingSphere.radius;
            newReticleScale = positionAndReizeReticle( objectsCore );
            scaleReticle( settings.reticle.scale );
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
            scale();
        },
        destroy: function (options) {
            //clean up
        },
        init: function (camera, options) {
            var c = camera || null;
            if (c === null) {
                console.log("ERROR: Camera was not defined");
                return;
            }
            initiate(c, options);
        }
    };
})();