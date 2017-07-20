// ViewModel
var LocationsViewModel = function() {
    var self = this;

    // Declaring a location filter as knockout observable
    self.locationFilter = ko.observable('');

    // Creating an empty array for location markers
    self.locationMarkers = [];
    var i = 0;

    /*
     * Looping over each location object in locations array defined in map.js and
     * creating a marker and adding listeners for each location.
     * Finally adding markers into locationMarkers array
     */
    locations.forEach(function(loc) {
        var marker = createMarker(loc);

        // Add listeners for each marker
        addMarkerListeners(marker);
        self.locationMarkers.push(marker);
        i++;
    });

    self.locationClicked = function(marker) {
        markerClicked(marker);
    };

    /*
     * A knockout computed variable which filters location markers
     * on the map corresponding to the the user entered location in the
     * filter box from among the list of locations
     */
    self.filteredLocationMarkers = ko.computed(function() {
        var filter = self.locationFilter().toLowerCase();

        // In case no location is entered by user, all the location markers
        // are visible on the map
        if (!filter) {
            self.locationMarkers.forEach(function(marker) {
                showMarker(marker);
            });
            return self.locationMarkers;
        }
        else {
            var filteredMarkers = [];
            /*
             * Iterate through locationMarkers array to filter the locations
             * matching with the user entered prefix.
             * Only the matching location markers will be displayed on the map.
             * At the end of loop filteredMarkers array will contain all the
             * visible markers.
             */
            self.locationMarkers.forEach(function(marker) {
                if (marker.title.toLowerCase().indexOf(filter) != -1) {
                    showMarker(marker);
                    filteredMarkers.push(marker);
                }
                else {
                    hideMarker(marker);
                }
            });
            return filteredMarkers;
        }
    }, self);
 };

// Visibility status of left navigation bar containing the locations list
var leftNavigationVisible = false;

// Toggles the visibility of left navigation bar
var toggleLeftNavigation = function () {
    leftNavigationVisible = !leftNavigationVisible;
    if (leftNavigationVisible) {
        document.getElementById("locationlist-leftnavigation").style.width = "260px";
    }
    else {
        document.getElementById("locationlist-leftnavigation").style.width = "0";
    }
};

