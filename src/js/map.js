// Constants
var WIKI_EXTRACT_BASE_QUERY = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exsentences=2&exlimit=1&explaintext=true&titles=";

var map;
var infoWindow;

// Default marker icon
var defaultIcon;
// Highlighted marker icon when mouse hovers over it
var highlightedIcon;

// Call back for map Initialization
var initMap = function() {
    // Create a map to be displayed in HTML element #map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 12.9716, lng: 77.5946},
        zoom: 13
    });

    // Create infowindow
    infoWindow = new google.maps.InfoWindow({});

    // Add listener to clear the marker on infowindow close
    infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
    });

    // Create marker icons
    defaultIcon = makeMarkerIcon('ff0000');
    highlightedIcon = makeMarkerIcon('00ffff');

    // Add listener to handle the browser size change
    google.maps.event.addDomListener(window, "resize", resizeMap);

    // Activate knockout
    ko.applyBindings(new LocationsViewModel());
};

// Map error
var mapError = function() {
    document.getElementById('map').innerHTML = "Error loading Map!";
};

// Resize Function
var resizeMap = function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
};

// Create a marker for specified location
var createMarker = function(location) {
    var marker = new google.maps.Marker({
        position: location.position,
        map: map,
        title: location.title,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
    });
    return marker;
};

var addMarkerListeners = function(marker) {
    // On marker click open the infowindow
    marker.addListener('click', function() {
        markerClicked(this);
    });

    // On mouseover set the highlighted marker icon
    marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });

    // On mouseout set the default marker icon
    marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });
};

var markerClicked = function(marker) {
    bounceMarker(marker);
    showInfoWindow(marker);
};

// Bounce the marker
var bounceMarker = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 700);
};

// Show infowindow containing the title and wikipedia information of the location
var showInfoWindow = function(marker) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infoWindow.marker != marker) {
        infoWindow.marker = marker;
        loadWikiInfo(marker);
    }
};

var showMarker = function(marker) {
    marker.setMap(map);
};

var hideMarker = function(marker) {
    marker.setMap(null);
};

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
var makeMarkerIcon = function(markerColor) {
    var markerIconImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34)
    );
    return markerIconImage;
};

// Fetch wikipedia information for location and display in the infowindow
var loadWikiInfo = function(marker) {
    // Wikipedia Api
    var wikiURL = WIKI_EXTRACT_BASE_QUERY + marker.title;

    // Invoke wikipedi API to fetch the information for the location
    $.ajax({
        url:wikiURL,
        dataType:"jsonp",
        timeout: 10000,
        success:function(data) {
            if (data && data.query && data.query.pages) {
                var pages = data.query.pages;
                for (var pageid in pages) {
                    infoWindow.setContent(
                        '<h4>' + marker.title + '</h4>' +
                        '<p>' + pages[pageid].extract + '</p>');
                }
            }
            else {
                infoWindow.setContent('<h4>' + marker.title + '</h4>');
                // No record fetched from wiki
            }
            infoWindow.open(map, marker);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            infoWindow.setContent(
                '<h4>' + marker.title + '</h4>' +
                '<p>' + errorThrown + ': Failed to load the wikipedia information</p>');
            infoWindow.open(map, marker);
        }
    });
};
