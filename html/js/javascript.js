var ref = new Firebase("https://vivid-fire-4995.firebaseio.com");

$( document ).ready(function() { 
    
    $.get("page_dashboard.html", function(html) {
      $("body").append(html);
      $.get("map.html", function(html) {
        $("#map").append(html);
      });
    });
    
    $.get("page_signin.html", function(html) {
      $("body").append(html);
      $("#page_signin").show();
    });
    
    $.get("page_signup.html", function(html) {
      $("body").append(html)
    });
        
})

function projectOpenLoad(){
    $('#projectOpen div div div div select').html('');
    //var ref = new Firebase("https://vivid-fire-4995.firebaseio.com");
    ref.child("users").child(uid).child("projects").on("child_added", function(snapshot) {
      $('#projectOpen div div div div select').html( $('#projectOpen div div div div select').html() + '<option>' + snapshot.key() + '</option>' )
    });
    $('#projectOpen').modal('show');
}

function openProject(){
    var project = $('#projectOpen div div div div select option:selected').val();
    //if one of Project is selected
    if(project){
        //var ref = new Firebase("https://vivid-fire-4995.firebaseio.com");
        ref.child("users").child(uid).child("projects").child(project).child("GeoJSON").on("value", function(snapshot) {
            console.log(snapshot.val())
            GeoJSONData = snapshot.val();
            showData();
        });
        $('#projectOpen').modal('hide')
    }
}

function saveProject(){
    $('#projectSave').modal('hide')
    //var ref = new Firebase("https://vivid-fire-4995.firebaseio.com");
    ref.child("users").child(uid).child("projects").child($('#projectName').val()).set({
        GeoJSON : GeoJSONData
    });
}

function logout(){
    ref.unauth();
    ref=null;
    location.reload();
}

function showAircraftInfo(aircraft){
    $.get(aircraft+"Info.html", function(html) {
      $('#aircraftInfo div div').html(html);
      $('#aircraftInfo').modal('show');
    });
}