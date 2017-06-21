// Constants
var WIKI_EXTRACT_BASE_QUERY = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exsentences=2&exlimit=1&explaintext=true&titles=";

// Neighborhood locations
var locations = [
    {
        title: 'Lal Bagh',
        position: {
            lat: 12.9507 ,
            lng: 77.5848
        }
    },
    {
        title: 'UB City',
        position: {
            lat: 12.9719 ,
            lng: 77.5962
        }
    },
    {
        title: 'M. Chinnaswamy Stadium',
        position: {
            lat: 12.9790 ,
            lng: 77.5994
        }
    },
    {
        title: 'Vidhana Soudha',
        position: {
            lat: 12.9765,
            lng: 77.5888
        }
    },
    {
        title: 'Nehru Planetarium',
        position: {
            lat: 12.9849 ,
            lng: 77.5896
        }
    },
    {
        title: 'Bangalore Fort',
        position: {
            lat: 12.9629,
            lng: 77.5761
        }
    },
    {
        title: 'Hard Rock Cafe',
        position: {
            lat: 12.9762,
            lng: 77.6016
        }
    }
];

var map;

var infoWindow;
// HTML structure of infowindow content corresponding to each location marker
var infoWindowContent =
    '<div id = "info-window">' +
    '<h4 id = "infowin-title"></h4>' +
    '<p id = "infowin-extract"></p>' +
    '</div>';

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

    // Create infowindow with HTML structure 'infoWindowContent'
    infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

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
    }, 800);
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

    // Handle wikipedia Api request timeout
    var wikiRequestTimeout = setTimeout(function() {
        document.getElementById('infowin-title').innerHTML = marker.title;
        document.getElementById('infowin-extract').innerHTML = "Failed to load the wikipedia information";
        infoWindow.open(map, marker);
    }, 8000);

    // Invoke wikipedi API to fetch the information for the location
    $.ajax({
        url:wikiURL,
        dataType:"jsonp",
        success:function(data) {
            if (data && data.query && data.query.pages) {
                var pages = data.query.pages;
                for (var pageid in pages) {
                    infoWindow.open(map, marker);
                    document.getElementById('infowin-title').innerHTML = marker.title;
                    document.getElementById('infowin-extract').innerHTML = pages[pageid].extract;
                }
            }
            else {
                document.getElementById('infowin-title').innerHTML = marker.title;
                // No record fetched from wiki
            }
            infoWindow.open(map, marker);
            clearTimeout(wikiRequestTimeout);
        },
        error: function (data) {
            document.getElementById('infowin-title').innerHTML = marker.title;
            document.getElementById('infowin-extract').innerHTML = "Failed to load the wikipedia information";
            infoWindow.open(map, marker);
        }
    });
};
