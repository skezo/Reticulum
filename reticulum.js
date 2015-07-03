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
    var crosshair;
    var crosshairScale;
    var settings = {};

    //Required from user
    settings.camera = null;

    //Gazing
    settings.gazing_duration = 2.5;
    
    //Crosshair
    settings.crosshair = {};
    settings.crosshair.visible = true;
    settings.crosshair.color = 0xcc0000;
    settings.crosshair.radius = 0.005;
    settings.crosshair.tube = 0.001;

    var initiate = function (options) {
        //Update Settings:
        if (options) {
            settings.camera = options.camera || settings.camera;
            settings.gazing_duration = options.gazing_duration || settings.gazing_duration;
            settings.crosshair.visible = options.crosshair.visible || settings.crosshair.visible;
            settings.crosshair.color = options.crosshair.color || settings.crosshair.color;
            settings.crosshair.radius = options.crosshair.radius || settings.crosshair.radius;
            settings.crosshair.tube = options.crosshair.tube || settings.crosshair.tube;
        }
        //
        raycaster = new THREE.Raycaster();
        vector = new THREE.Vector2(0, 0);

        //
        clock = new THREE.Clock(true);

        if(settings.crosshair.visible) {
            createCrosshair();
        }
    };

    var createCrosshair = function() {
        var geometry = new THREE.TorusGeometry(settings.crosshair.radius, settings.crosshair.tube, 2, 12);
        var material = new THREE.MeshBasicMaterial({
            color: settings.crosshair.color
        });
        crosshair = new THREE.Mesh(geometry, material);
        crosshair.visible = settings.crosshair.visible;

        if(settings.camera) {
            crosshairScale = positionAndReizeCrosshair();
            settings.camera.add( crosshair );
        }
    };

    var positionAndReizeCrosshair = function( transformZ ) {

        var scaleSize;
        //var resize = scale || 1; 
        var z = transformZ || settings.camera.near+0.01; //To stop flashing place it a little bit in front of the camera (i.e. add 0.01)

        crosshair.position.x = 0;
        crosshair.position.y = 0;
        crosshair.position.z = Math.abs(z)*-1;

        //Force crosshair to appear the same size
        //http://answers.unity3d.com/questions/419342/make-gameobject-size-always-be-the-same.html
        scaleSize = settings.camera.position.distanceTo(crosshair.position);
        scaleCrosshair( 1, scaleSize );

        return scaleSize;
    };

    var scaleCrosshair = function( scale, size ) {
        var scale = scale || 1;
        var size = (size || crosshairScale) * scale;
        crosshair.scale.set( size, size, size );
    }

    var detectHit = function() {
        //Update ray
        raycaster.setFromCamera( vector, camera );
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
                if( crosshair ) {
                    //Scale Crosshair 
                    scaleCrosshair();
                }
            }
            INTERSECTED = null;

        }
    };

    var gazeOut = function(three_object) {
        three_object.hitTime = 0;
        if (three_object.ongazeout != undefined) {
            three_object.ongazeout();
        }
    };

    var gazeOver = function(three_object) {
        var objectsCore;
        three_object.hitTime = clock.getElapsedTime();
        //There has to be a better  way...
        if( crosshair ) {
            objectsCore = settings.camera.position.distanceTo(three_object.position);
            objectsCore -= three_object.geometry.boundingSphere.radius;
            crosshairScale = positionAndReizeCrosshair( objectsCore );
            scaleCrosshair( 2 );
        }

        if (three_object.ongazeover != undefined) {
            three_object.ongazeover();
        }
    };

    var gazeLong = function( three_object ) {
        //We ready for a long gaze
        var elapsed = clock.getElapsedTime();
        if( elapsed - three_object.hitTime >= settings.gazing_duration ) {
            if (three_object.ongazelong != undefined) {
                three_object.ongazelong();
            }
            //Reset the clock
            three_object.hitTime = elapsed;
        }

    }


    return {
        addCollider: function (three_object) {
            three_object.gazeable = true;
            collisionList.push(three_object);
        },
        removeCollider: function (three_object) {
            var index = collisionList.indexOf(three_object);
            three_object.gazeable = false;
            if (index > -1) {
                collisionList.splice(index, 1);
            }
        },
        loop: function (three_object) {
            detectHit();
        },
        destroy: function (options) {
            //clean up
        },
        init: function (options) {
            initiate(options);
        }
    };
})();