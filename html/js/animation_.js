var aircraft = 'Phantom3';
var lon,lat,alt,loc_count,timer_animation;
function playAnimation(){
    if(GeoJSONData==null || GeoJSONData.features.length<2)   return;
    
    $("#cesiumContainer").css('cursor','url(images/cursor.png),auto');
    drawingMode=null;
    
    var lon_home = GeoJSONData.features[0].geometry.coordinates[0];
    var lat_home = GeoJSONData.features[0].geometry.coordinates[1];
    var alt_home = GeoJSONData.features[0].geometry.coordinates[2];
    
    var entity = createModel(lon_home, lat_home, alt_home);
    //var temp = new _cesium.EllipsoidGeodesic(new _cesium.Cartographic.fromDegrees(lon_home, lat_home, alt_home), new _cesium.Cartographic.fromDegrees(77, 23, 800));
 
    viewer.trackedEntity = entity;
    viewer.selectedEntity = entity;
    /*viewer.camera.flyTo({
        destination : _cesium.Cartesian3.fromDegrees(lon, lat, alt)
    });*/
    lon = lon_home;
    lat = lat_home;
    alt = alt_home;
    loc_count = 0;
    timer_animation = setInterval(positionModel, 1, entity);
}

function positionModel(entity){
    //model reached last location
    if(loc_count>=GeoJSONData.features.length-1){
          clearInterval(timer_animation);
          return;
    }
    var lon_next = GeoJSONData.features[loc_count+1].geometry.coordinates[0];
    var lat_next = GeoJSONData.features[loc_count+1].geometry.coordinates[1];
    var alt_next = GeoJSONData.features[loc_count+1].geometry.coordinates[2];
    
    if(lon_next>lon)    lon = lon+0.00001; 
    else    lon = lon-0.00001; 
    
    if(lat_next>lat)    lat = lat+0.000005;  
    else    lat = lat-0.000005; 
    
    if(alt_next>alt)    alt = alt+0.01;
    else alt = alt-0.01;
    
    if((lon>=lon_next-0.00001 && lon<=lon_next+0.00001) && (lat>=lat_next-0.000005 && lat<=lat_next+0.000005) && (alt>=alt_next-0.01 && alt<=alt_next+0.01)) loc_count++;
    
    var position = _cesium.Cartesian3.fromDegrees(lon, lat, alt);
    entity.position = position;
}

function createModel(lon, lat, alt) {
    //viewer.entities.removeAll();
    
    var position = _cesium.Cartesian3.fromDegrees(lon, lat, alt);
    var heading = _cesium.Math.toRadians(135);
    var pitch = 0;
    var roll = 0;
    var orientation = _cesium.Transforms.headingPitchRollQuaternion(position, heading, pitch, roll);

    var entity = viewer.entities.add({
        name : aircraft,
        position : position,
        orientation : orientation,
        model : {
            uri : 'aircraft/'+aircraft+'.gltf'
            //minimumPixelSize : 128
        },
        description:'<b>Aircraft</b>'
    });
    
    return entity;
}