var drawingMode;
var clickCount=0;
   
$( document ).ready(function() {
    
    $("#cesiumContainer").css('cursor','url(images/cursor.png),auto');
    drawingMode='';
    
    $('#optionCursor').change(function () {
        $("#cesiumContainer").css('cursor','url(images/cursor.png),auto');
        drawingMode='';
    }) 
    $('#optionAddLocation').change(function () {
        $("#cesiumContainer").css('cursor','url(images/cursorAddLocation.png),auto');
        drawingMode='addLocation';
    })
    $('#optionRemoveLocation').change(function () {
        $("#cesiumContainer").css('cursor','url(images/cursorRemoveLocation.png),auto');
        drawingMode='removeLocation';
    })
        
});


var viewer;
var _cesium;
var cursorLon,cursorLat;
var savedLon,savedLat;
function startup(Cesium) {
       
    "use strict";
    
    //Sandcastle_Begin
    viewer = new Cesium.Viewer('cesiumContainer');
    
    //Enable lighting based on sun/moon positions
    viewer.scene.globe.enableLighting = true;

    /*var cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
        url : '//assets.agi.com/stk-terrain/world',
        requestWaterMask : true,
        requestVertexNormals : true
    });
    viewer.terrainProvider = cesiumTerrainProviderMeshes;
    */
    //Enable depth testing so things behind the terrain disappear.
    //viewer.scene.globe.depthTestAgainstTerrain = true;
    
    var scene = viewer.scene;
    
    var handler;
    
    // Mouse over the globe to see the cartographic position
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(movement) {
        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
        if (cartesian) {
            var cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            cursorLon = Cesium.Math.toDegrees(cartographic.longitude);
            cursorLat = Cesium.Math.toDegrees(cartographic.latitude);
            $('#LatLon').html(cursorLon.toFixed(2) + ', ' + cursorLat.toFixed(2));
        } 
        //scale up location when mouse over
        if(drawingMode==''){
            var pickedObject = scene.pick(movement.endPosition);
            if (Cesium.defined(pickedObject)) {
                for (var i = 0; i < entities.length; i++) {
                    var entity = entities[i];
                    if(pickedObject.id.properties.SNo == entity.properties.SNo){
                        entity.billboard.scale = 2.0;
                    }
                }
            }
            else{
                for (i = 0; i < entities.length; i++) {
                    entity = entities[i];
                    entity.billboard.scale = 0.4;
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    
    //Drawing    
    handler.setInputAction(function(movement) {
        
        if(drawingMode!=''){
            
            savedLon=parseFloat(cursorLon);
            savedLat=parseFloat(cursorLat);
        
            if(drawingMode=='addLocation'){
                clickCount++;
                if(clickCount>=1){
                    $('#locationInformation').modal('show'); 
                }
            }
            //Remove location when clicked
            else if(drawingMode=='removeLocation'){
                var selectedLocation = viewer.selectedEntity.properties.SNo-1;
                data=[];  //empty the array
                var lon,lat,alt;
                var sno,name,altitude,heading,direction,waitTime,gimbalPosition;
                $.each(GeoJSONData.features, function (key, val) {
                    lon = val.geometry.coordinates[0];
                    lat = val.geometry.coordinates[1];
                    alt = val.geometry.coordinates[2];
                    if(selectedLocation!=key){
                        $.each(val.properties, function(i,j){
                            if(i=='SNo')    sno=j;
                            else if(i=='Name')  name=j;
                            else if(i=='Altitude')  altitude=j;
                            else if(i=='Heading')  heading=j;
                            else if(i=='Direction')  direction=j;
                            else if(i=='WaitTime')  waitTime=j;
                            else if(i=='GimbalPosition')  gimbalPosition=j;
                        }) 
                        data.push({SNo:sno,Name:name,Altitude:altitude,Heading:heading,Direction:direction,WaitTime:waitTime,GimbalPosition:gimbalPosition,Point:[lon, lat, alt]});
                    }           
                    
                });
                GeoJSONData = null
                GeoJSONData = GeoJSON.parse(data, {Point: 'Point'});
                showData();
            }
        }
        
        
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    _cesium=Cesium;
    
    $(".cesium-viewer-bottom").hide();
    
    Sandcastle.finishedLoading();
       
}

var data=[],GeoJSONData = null;
function addData(){
    var name = $('#locationInformation #name').val(); 
    var altitude = parseFloat($('#locationInformation #altitude').val()); 
    var heading = parseFloat($('#locationInformation #heading').val()); 
    var direction = parseFloat($('#locationInformation #direction').val());
    var waitTime = parseFloat($('#locationInformation #waitTime').val()); 
    var gimbalPosition = parseFloat($('#locationInformation #gimbalPosition').val()); 
    
    data.push({SNo:clickCount,Name:name,Altitude:altitude,Heading:heading,Direction:direction,WaitTime:waitTime,GimbalPosition:gimbalPosition,Point:[savedLon, savedLat, altitude]});
    GeoJSONData = GeoJSON.parse(data, {Point: 'Point'});
    showData();
    
    $('#locationInformation').modal('hide');
}
var entities = [];
var locationHomeEntity,locationDestinationEntity;
function showData(){
    viewer.dataSources.removeAll()
    var promise =  _cesium.GeoJsonDataSource.load(GeoJSONData);
    promise.then(function(dataSource) {
        viewer.dataSources.add(dataSource);
        //Get the array of entities
        entities = dataSource.entities.values;
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            var j=i+1;
            entity.billboard.image='images/location'+j+'.png';
            entity.billboard.scale=0.4;
            if(i==0) locationHomeEntity=entity;
            else if(i==entities.length-1) locationDestinationEntity=entity;
        }
    });
    setLocationDistances() 
    /*var loc = viewer.entities.add({
        id : 'location'+clickCount,
        name : name,
        position : _cesium.Cartesian3.fromDegrees(savedLon, savedLat, altitude),
        billboard : {
            scale : 0.4
        }
    });
    loc.billboard.image='images/location'+clickCount+'.png';
    loc.description="Lat:"+savedLat.toFixed(2)+" Lon:"+savedLon.toFixed(2)+"<br />\n\
        Altitude:"+altitude+" Heading:"+heading+" Direction:"+direction+"<br />\n\
        Wait Time:"+waitTime+" Gimbal Position:"+gimbalPosition
      */  
}

var locationTime = [];
var totalFlightDistance;
function setLocationDistances(){
    var locationDistance=[];
    locationTime=[];
    
    //Distance from ground to height at location 1
    var lonLeft = GeoJSONData.features[0].geometry.coordinates[0];
    var latLeft = GeoJSONData.features[0].geometry.coordinates[1];
    var altLeft = 0;
                
    var lonRight = lonLeft;
    var latRight = latLeft;
    var altRight = GeoJSONData.features[0].geometry.coordinates[2];
    
    locationDistance.push(_cesium.Cartesian3.distance(_cesium.Cartesian3.fromDegrees(lonLeft, latLeft, altLeft), _cesium.Cartesian3.fromDegrees(lonRight, latRight, altRight)))
    locationTime.push(parseFloat(locationDistance[0])/parseFloat(Max_Ascent_Speed));
    totalFlightDistance=parseFloat(locationDistance[0]);
    
    //Distances between locations
    for (var i = 0; i < GeoJSONData.features.length-1; i++) {
                
        lonLeft = GeoJSONData.features[i].geometry.coordinates[0];
        latLeft = GeoJSONData.features[i].geometry.coordinates[1];
        altLeft = GeoJSONData.features[i].geometry.coordinates[2];
                
        lonRight = GeoJSONData.features[i+1].geometry.coordinates[0];
        latRight = GeoJSONData.features[i+1].geometry.coordinates[1];
        altRight = GeoJSONData.features[i+1].geometry.coordinates[2];
        
        locationDistance.push(_cesium.Cartesian3.distance(_cesium.Cartesian3.fromDegrees(lonLeft, latLeft, altLeft), _cesium.Cartesian3.fromDegrees(lonRight, latRight, altRight)))
        locationTime.push(parseFloat(locationDistance[i+1])/parseFloat(Max_Speed));
        totalFlightDistance=totalFlightDistance + parseFloat(locationDistance[i+1]);
    }
    
    //Distance from height to ground at last location
    var lonLeft = GeoJSONData.features[GeoJSONData.features.length-1].geometry.coordinates[0];
    var latLeft = GeoJSONData.features[GeoJSONData.features.length-1].geometry.coordinates[1];
    var altLeft = GeoJSONData.features[GeoJSONData.features.length-1].geometry.coordinates[2];
                
    var lonRight = lonLeft;
    var latRight = latLeft;
    var altRight = 0;
    
    locationDistance.push(_cesium.Cartesian3.distance(_cesium.Cartesian3.fromDegrees(lonLeft, latLeft, altLeft), _cesium.Cartesian3.fromDegrees(lonRight, latRight, altRight)))
    locationTime.push(parseFloat(locationDistance[locationDistance.length-1])/parseFloat(Max_Descent_Speed));
    totalFlightDistance=totalFlightDistance + parseFloat(locationDistance[locationDistance.length-1]);
}

function adjustMapHeight(){
    $("#map").css("height",$( window  ).height() - $( "#page_dashboard #header" ).height()+"px")          
}


