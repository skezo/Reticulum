/*! Reticulum - v1.0.0 - 2015-07-03
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
    var reticleScale;
    var settings = {};

    //Required from user
    settings.camera = null;

    //Gazing
    settings.gazingDuration = 2.5;
    
    //Reticle
    settings.reticle = {};
    settings.reticle.visible = true;
    settings.reticle.color = 0xcc0000;
    settings.reticle.radius = 0.005;
    settings.reticle.tube = 0.001;

    var initiate = function (camera, options) {
        //Update Settings:
        if (options) {
            settings.camera = camera || settings.camera;
            settings.gazingDuration = options.gazingDuration || settings.gazingDuration;
            settings.reticle.visible = options.reticle.visible || settings.reticle.visible;
            settings.reticle.color = options.reticle.color || settings.reticle.color;
            settings.reticle.radius = options.reticle.radius || settings.reticle.radius;
            settings.reticle.tube = options.reticle.tube || settings.reticle.tube;
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
        var geometry = new THREE.TorusGeometry(settings.reticle.radius, settings.reticle.tube, 2, 12);
        var material = new THREE.MeshBasicMaterial({
            color: settings.reticle.color
        });
        reticle = new THREE.Mesh(geometry, material);
        reticle.visible = settings.reticle.visible;

        if(settings.camera) {
            reticleScale = positionAndReizeReticle();
            settings.camera.add( reticle );
        }
    };

    var positionAndReizeReticle = function( transformZ ) {

        var distance;
        //var resize = scale || 1; 
        var z = transformZ || settings.camera.near+0.01; //To stop flashing place it a little bit in front of the camera (i.e. add 0.01)

        reticle.position.x = 0;
        reticle.position.y = 0;
        reticle.position.z = Math.abs(z)*-1;

        //Force reticle to appear the same size
        //http://answers.unity3d.com/questions/419342/make-gameobject-size-always-be-the-same.html
        distance = Math.abs(camera.position.z - reticle.position.z) - Math.abs(camera.position.z);
        scaleReticle( 1, distance );

        return distance;
    };

    var scaleReticle = function( scale, size ) {
        var scale = scale || 1;
        var size = (size || reticleScale) * scale;
        reticle.scale.set( size, size, size );
    }

    var detectHit = function() {
        //Update ray
        raycaster.setFromCamera( vector, settings.camera );
        //
        var intersects = raycaster.intersectObjects(collisionList);
        //Detect
        if (intersects.length) {

            //Is it a new object?
            if( INTERSECTED != intersects[ 0 ].object ) {
                //If old INTERSECTED not null reset and gazeout 
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
            reticleScale = positionAndReizeReticle( objectsCore );
            scaleReticle( 2 );
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
        loop: function (threeObject) {
            detectHit();
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
            initiate(camera, options);
        }
    };
})();