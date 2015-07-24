L.mapbox.accessToken = 'pk.eyJ1IjoiZ3NjcGxhbm5pbmciLCJhIjoiRVZMNXpsQSJ9.5OxUlJTCDplPkdkKNlB91A';
var map = L.map('map').setView([38.046441, -84.497019], 10);

var base = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);


new L.geoJson({"type": "LineString","coordinates":[[0,0],[0,0]]}).addTo(map);

var mapsense_url = "https://{s}-api.mapsense.co/explore/api/universes/mapsense.demographics/{z}/{x}/{y}.topojson?s=10&ringSpan=8&api-key=key-b4bc5affdce44f7d86e3efdf72f5d0d4";
mapsense_url += "&where=layer=='county'";

new L.TileLayer.d3_JSON(mapsense_url, {
    attribution: '<a target="_blank" href="https://developer.mapsense.co/tileViewer/?tileset=mapsense.demographics">©Mapsense ©OpenStreetMap</a>',
    // https://developer.mapsense.co/documentation/basemap
    mapsenseStyle: false // choose a basemap style, or style your own at styler.mapsense.co
}).addTo(map);




var bcc2013, bcc2014, bcc2015, ky, layers

var kyStyle = {
		color: '#333',
		fillOpacity: 0,
		// opacity:0.1,
		weight: 2
	}

var style = {
		color: '#E80087',
		opacity: 0.06,
		weight: 1
	}



bcc2013 = omnivore.topojson('bcc_2013.json')
	.on('ready', function(e) {
		layers = e.target;
		myStyleFunction();
	}).addTo(map);
bcc2014 = omnivore.topojson('bcc_2014.json')
	.on('ready', function(e) {
		layers = e.target;
		myStyleFunction();
	}).addTo(map);
bcc2015 = omnivore.topojson('bcc_201501-201507.json')
	.on('ready', function(e) {
		layers = e.target;
		myStyleFunction();
	}).addTo(map);

// ky  = omnivore.topojson('ky_counties.json')
// 	.on('ready', function(e) {
// 		layers = e.target;
// 		kyStyleFunction();
// 	}).addTo(map);

function kyStyleFunction() {
	layers.setStyle(kyStyle);
}
function myStyleFunction() {
	layers.setStyle(style);
}

L.control.layers({}, {
    '2013': bcc2013,
    '2014': bcc2014,
    '2015': bcc2015
},{collapsed:false}).addTo(map);

$( "form" ).before( "<p><strong>BCC Ride Years</strong></p>" );