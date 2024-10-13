<?php
//turn on error reporting in php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "";

// Create connection
$mysqli = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($mysqli->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}else{
    //echo'Connected to mysql<br/>';
    //print_r($_SERVER);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if(isset($_POST['get_past_locations'])){
        //get the last 10 entries from the database
        //select unique latitude and longitude
        $result = $mysqli->query("SELECT DISTINCT `latitude`, `longitude` FROM `test_geolocation_coordinates_1` WHERE `device_id` = '93.122.251.70' ORDER BY `reported_timestamp`  DESC LIMIT 100");
        if($result){
            $data = $result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($data);
        }else{
            echo $mysqli->error;
        }
        //return the data as json
    }else{

        $json_data = $_POST['data'];
        $data = json_decode($json_data);

        $device_id = $_SERVER['HTTP_CF_CONNECTING_IP'] ? $_SERVER['HTTP_CF_CONNECTING_IP'] : $_SERVER['HTTP_USER_AGENT'];

        $data_to_insert = $mysqli->real_escape_string($json_data);
        $speed = $data->coords->speed ? $data->coords->speed : NULL;
        $accuracy = $data->coords->accuracy ? $data->coords->accuracy : NULL;
        $latitude = $data->coords->latitude;
        $longitude = $data->coords->longitude;

        $query = "INSERT INTO `test_geolocation_coordinates_1` (`reported_timestamp`, `longitude`, `latitude`, `speed`, `accuracy`, `data`, `device_id`) VALUES (FROM_UNIXTIME(".$data->timestamp."), ".$longitude.", ".$latitude.", ".$speed .", ".$accuracy.", \"".$data_to_insert."\", \"".$device_id."\")";

        $prepare = $mysqli->prepare("INSERT INTO `test_geolocation_coordinates_1` (`reported_timestamp`, `longitude`, `latitude`, `speed`, `accuracy`, `data`, `device_id`) VALUES (FROM_UNIXTIME(?), ?, ?, ?, ?, ?, ?)");

        $prepare->bind_param("iddddss", $data->timestamp, $longitude, $latitude, $speed, $accuracy, $data_to_insert, $device_id);

        $prepare->execute();
        //check if query executed successfully
        if($prepare->affected_rows > 0){
            echo "Data inserted successfully";
        }else{
            echo "Error inserting data";
            //display the error
            echo $prepare->error;
        }
    }
    exit;
}

//get the last 10 entries from the database
//select unique latitude and longitude
//$result = $mysqli->query("SELECT DISTINCT `latitude`, `longitude` FROM `test_geolocation_coordinates_1` ORDER BY `reported_timestamp` DESC LIMIT 100");

$result = $mysqli->query("SELECT * FROM `test_geolocation_coordinates_1` WHERE `device_id` = '93.122.251.70' GROUP BY `longitude` ORDER BY `reported_timestamp` DESC LIMIT 100");
if($result){
    $data = $result->fetch_all(MYSQLI_ASSOC);
}else{
    echo $mysqli->error;
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Geolocation API Test</title>
<!-- viewport meta to reset iPhone inital scale -->

<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
crossorigin=""></script>
<script src="script.js?<?=rand()?>" type="text/javascript"></script>
</head>
<body>
    <div id="status">Not tracking</div>
<button id="start_tracking">Start Tracking</button><br/>
<button id="stop_tracking">Stop Tracking</button><br/>
<button id="send_data">Send Data</button><br/>

<div id="history">
<?php

//display the $data array in a table
if(isset($data)){
    echo '<table>';
    echo '<tr><th>Reported Timestamp</th><th>Latitude</th><th>Longitude</th><th>Accuracy</th><th>Speed</th><th>Device ID</th></tr>';
    foreach($data as $row){
        echo '<tr>';
        //add a link to openstreetmap with the latitude and longitude as the marker
        echo '<td><a href="https://www.openstreetmap.org/#map=19/'.$row['latitude'].'/'.$row['longitude'].'">'.$row['reported_timestamp'].'</a></td>';

        echo '<td>'.$row['latitude'].'</td>';
        echo '<td>'.$row['longitude'].'</td>';
        echo '<td>'.$row['accuracy'].'</td>';
        echo '<td>'.$row['speed'].'</td>';
        echo '<td>'.$row['device_id'].'</td>';
        echo '</tr>';
    }
    echo '</table>';
}
//plot these value onto a map from openstreetmap
if(isset($data)){
    //echo '<iframe width="100%" height="500px" src="https://www.openstreetmap.org/export/embed.html?bbox='.$data[0]['longitude'].'%2C'.$data[0]['latitude'].'%2C'.$data[0]['longitude'].'%2C'.$data[0]['latitude'].'&amp;layer=mapnik&amp;marker='.$data[0]['latitude'].'%2C'.$data[0]['longitude'].'" style="border: 1px solid black"></iframe><br/><small><a href="https://www.openstreetmap.org/#map=19/'.$data[0]['latitude'].'/'.$data[0]['longitude'].'">View Larger Map</a></small>';
}

//make a route on openstreetmap from all these points in $data
if(isset($data)){
    $route = "";
    foreach($data as $row){
        $route .= $row['latitude'].",".$row['longitude'].";";
    }
    //echo '<iframe width="100%" height="500px" src="https://www.openstreetmap.org/export/embed.html?bbox='.$data[0]['longitude'].'%2C'.$data[0]['latitude'].'%2C'.$data[0]['longitude'].'%2C'.$data[0]['latitude'].'&amp;layer=mapnik&amp;marker='.$data[0]['latitude'].'%2C'.$data[0]['longitude'].'&amp;route='.$route.'" style="border: 1px solid black"></iframe><br/><small><a href="https://www.openstreetmap.org/#map=19/'.$data[0]['latitude'].'/'.$data[0]['longitude'].'">View Larger Map</a></small>';
}
?>
</div>
<!--

display a route on the leaflet map
-->
<script type="text/javascript">
    //on document ready
    document.addEventListener("DOMContentLoaded", () => {
        //create a leaflet map
        var mymap = L.map('leafletmap').setView([45.6493, 25.6284], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);
        // //add a marker to the map
        // var marker = L.marker([51.5, -0.09]).addTo(mymap);
        // //add a circle to the map
        // var circle = L.circle([51.508, -0.11], {
        //     color: 'red',
        //     fillColor: '#f03',
        //     fillOpacity: 0.5,
        //     radius: 500
        // }).addTo(mymap);
        // //add a polygon to the map
        // var polygon = L.polygon([
        //     [51.509, -0.08],
        //     [51.503, -0.06],
        //     [51.51, -0.047]
        // ]).addTo(mymap);
        // //bind a popup to the marker
        // marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
        // //bind a popup to the circle
        // circle.bindPopup("I am a circle.");
        // //bind a popup to the polygon
        // polygon.bindPopup("I am a polygon.");
        // //create a popup
        // var popup = L.popup()
        //     .setLatLng([51.5, -0.09])
        //     .setContent("I am a standalone popup.")
        //     .openOn(mymap);
        // //create a popup when the map is clicked
        // var popup = L.popup();
        // function onMapClick(e) {
        //     popup
        //         .setLatLng(e.latlng)
        //         .setContent("You clicked the map at " + e.latlng.toString())
        //         .openOn(mymap);
        // }
        // mymap.on('click', onMapClick);
    });
</script>
 <div id="leafletmap" style="height:500px"></div>
</body>
</html>

