var aircraft = 'Phantom3';
//Get aircraft xml data
getAircraftData()

var lon,lat,alt,loc_count,timer_animation;
var droneEntity;
function playAnimation(){
    if(GeoJSONData==null || GeoJSONData.features.length<2)   return;
    
    $("#cesiumContainer").css('cursor','url(images/cursor.png),auto');
    drawingMode=null;
    $("#views").show()
    
    //Set bounds of our simulation time
    //var start = _cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    var start = _cesium.JulianDate.fromDate(new Date());
    
    //Compute the entity position property.
    var position = computeFlight(start);

    //Set bounds of our simulation time
    var stop = _cesium.JulianDate.addSeconds(start, totalFlightTime, new _cesium.JulianDate());
    
    //Make sure viewer is at the desired time.
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = _cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.clock.multiplier = 1;
    
    //Set timeline to simulation bounds
    viewer.timeline.zoomTo(start, stop);
    
    droneEntity = createModel(position, start, stop);
    viewer.trackedEntity = droneEntity;
    viewer.selectedEntity = droneEntity;
   
    
}

var totalFlightTime;
function computeFlight(start){
    var property = new _cesium.SampledPositionProperty();
    var locationTimeFromStart=0;
    //Ascend from ground to height at location 1
    var time = _cesium.JulianDate.addSeconds(start, locationTimeFromStart, new _cesium.JulianDate());
    var lon = GeoJSONData.features[0].geometry.coordinates[0];
    var lat = GeoJSONData.features[0].geometry.coordinates[1];
    var alt = 0;
    var position = _cesium.Cartesian3.fromDegrees(lon, lat, alt);
    property.addSample(time, position);

    //Also create a point for each sample we generate.
    viewer.entities.add({
        name : "Home Ground",
        position : position,
        point : {
            pixelSize : 8,
            color : _cesium.Color.TRANSPARENT,
            outlineColor : _cesium.Color.YELLOW,
            outlineWidth : 3
        },
        description : "Drone arrives in " + locationTimeFromStart.toFixed(0) + " sec"
    });
        
    //Move over all locations
    for (var i = 0; i < GeoJSONData.features.length; i++) {
        locationTimeFromStart = locationTimeFromStart + locationTime[i];
        time = _cesium.JulianDate.addSeconds(start, locationTimeFromStart, new _cesium.JulianDate());
        lon = GeoJSONData.features[i].geometry.coordinates[0];
        lat = GeoJSONData.features[i].geometry.coordinates[1];
        alt = GeoJSONData.features[i].geometry.coordinates[2];
        position = _cesium.Cartesian3.fromDegrees(lon, lat, alt);
        property.addSample(time, position);

        //Also create a point for each sample we generate.
        viewer.entities.add({
            name : "Location " + (i+1),
            position : position,
            point : {
                pixelSize : 8,
                color : _cesium.Color.TRANSPARENT,
                outlineColor : _cesium.Color.YELLOW,
                outlineWidth : 3
            },
            description : "Drone arrives in " + locationTimeFromStart.toFixed(0) + " sec"
        });
    }
    
    //Descend from height to ground at last location
    locationTimeFromStart = locationTimeFromStart + locationTime[locationTime.length-1];
    time = _cesium.JulianDate.addSeconds(start, locationTimeFromStart, new _cesium.JulianDate());
    lon = GeoJSONData.features[GeoJSONData.features.length-1].geometry.coordinates[0];
    lat = GeoJSONData.features[GeoJSONData.features.length-1].geometry.coordinates[1];
    alt = 0;
    position = _cesium.Cartesian3.fromDegrees(lon, lat, alt);
    property.addSample(time, position);

    //Also create a point for each sample we generate.
    viewer.entities.add({
        name : "Destination Ground",
        position : position,
        point : {
            pixelSize : 8,
            color : _cesium.Color.TRANSPARENT,
            outlineColor : _cesium.Color.YELLOW,
            outlineWidth : 3
        },
        description : "Drone arrives in " + locationTimeFromStart.toFixed(0) + " sec"
    });
    totalFlightTime = locationTimeFromStart;
    return property;
}


function createModel(position, start, stop) {
    console.log(position._property)
    //Actually create the entity
    var entity = viewer.entities.add({
        
        name : aircraft,
        
        //Set the entity availability to the same interval as the simulation time.
        availability : new _cesium.TimeIntervalCollection([new _cesium.TimeInterval({
            start : start,
            stop : stop
        })]),

        //Use our computed positions
        position : position,

        //Automatically compute orientation based on position movement.
        //orientation : new _cesium.VelocityOrientationProperty(position),

        //Load the Cesium plane model to represent the entity
        model : {
            uri : 'aircraft/'+aircraft+'.gltf'
        },

        //Show the path as a pink line sampled in 1 second increments.
        path : {
            resolution : 1,
            material : new _cesium.PolylineGlowMaterialProperty({
                glowPower : 0.1,
                color : _cesium.Color.YELLOW
            }),
            width : 2
        }/*,
        //description :  _cesium.Ellipsoid.WGS84.cartesianToCartographic(position)
        description : "<table class='cesium-infoBox-defaultTable'>\n\
                        <tbody>\n\
                            <tr><th>Total Flight Time</th><td>" + totalFlightTime.toFixed(0) + " sec</td></tr>\n\
                            <tr><th>Total Flight Distance</th><td>" + totalFlightDistance.toFixed(0) + " meters</td></tr>\n\
                            <tr><th>Max Ascent Speed</th><td>" + Max_Ascent_Speed + " m/s</td></tr>\n\
                            <tr><th>Max Speed</th><td>" + Max_Speed + " m/s</td></tr>\n\
                            <tr><th>Max Descent Speed</th><td>" + Max_Descent_Speed + " m/s</td></tr>\n\
                        </tbody>\n\
                    </table>"*/
  
   });
    //console.log(position.getValue(start));
    //console.log(_cesium.Ellipsoid.WGS84.cartesianToCartographic(position.getValue(start)))
    return entity;
}

var Max_Ascent_Speed,Max_Descent_Speed,Max_Speed,Max_Altitude_Above_Sea_Level,Max_Distance;
function getAircraftData(){
    $.get( "aircraft/"+aircraft+".xml", function( xml ) {
        Max_Ascent_Speed = $(xml).find( "Max_Ascent_Speed" ).text();
        Max_Descent_Speed = $(xml).find( "Max_Descent_Speed" ).text();
        Max_Speed = $(xml).find( "Max_Speed" ).text();
        Max_Altitude_Above_Sea_Level = $(xml).find( "Max_Altitude_Above_Sea_Level" ).text();
        Max_Distance = $(xml).find( "Max_Distance" ).text();
    });
}

function changeView(object){
    if(object=='drone'){
        viewer.trackedEntity = droneEntity;
        viewer.selectedEntity = droneEntity;
    }
    else if(object=='home'){
        viewer.trackedEntity = locationHomeEntity;
        viewer.selectedEntity = locationHomeEntity;
    }
    else if(object=='destination'){
        viewer.trackedEntity = locationDestinationEntity;
        viewer.selectedEntity = locationDestinationEntity;
    }
}