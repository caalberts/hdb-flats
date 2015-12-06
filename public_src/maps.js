/* global google */
'use strict'

/* Data points defined as an array of LatLng objects */
const heatmapData = [
  {location: new google.maps.LatLng(1.320, 103.800), weight: 10},
  {location: new google.maps.LatLng(1.321, 103.800), weight: 15},
  {location: new google.maps.LatLng(1.322, 103.850), weight: 25},
  {location: new google.maps.LatLng(1.323, 103.800), weight: 12},
  {location: new google.maps.LatLng(1.324, 103.800), weight: 30},
  {location: new google.maps.LatLng(1.325, 103.730), weight: 34},
  {location: new google.maps.LatLng(1.326, 103.800), weight: 33},
  {location: new google.maps.LatLng(1.337, 103.950), weight: 20},
  {location: new google.maps.LatLng(1.328, 103.700), weight: 10},
  {location: new google.maps.LatLng(1.379, 103.800), weight: 50}
]

// var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523)
const singapore = new google.maps.LatLng(1.320, 103.800)

var map = new google.maps.Map(document.getElementById('map'), {
  center: singapore,
  zoom: 11
})

var heatmap = new google.maps.visualization.HeatmapLayer({
  data: heatmapData,
  radius: 50
})
heatmap.setMap(map)
