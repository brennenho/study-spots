let map;
let markers = [];

/**
 * Initialize the Google Map.
 */
window.initMap = function() {
    console.log('initMap called'); // For debugging purposes
  
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 34.0224, lng: -118.2851 }, // USC coordinates
      zoom: 15,
      mapId: "f9624ecfd26562d1",
      styles: [
        {
          featureType: 'poi.school',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }],
        },
      ],
    });
  
    fetchStudySpots(); // Call to fetch and create markers
  };
/**
 * Create markers on the map using AdvancedMarkerElement.
 * @param {Array} studySpots - Array of study spot objects.
 */
function createMarkers(studySpots) {
  // Clear existing markers
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  studySpots.forEach((spot) => {
    // Create a custom HTML element for the marker (no text, just icon)
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = `
      <div class="marker-icon"></div>
    `;

    const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: { lat: spot.latitude, lng: spot.longitude },
      content: markerElement,
      title: spot.name,
    });

    // Add event listener for click events
    advancedMarker.element.addEventListener('click', () => {
      showSpotDetails(spot);

      // Remove bounce class from all markers
      markers.forEach((m) => {
        if (m.content) {
          m.content.classList.remove('bounce');
        }
      });
      
      // Add bounce animation to the clicked marker
      markerElement.classList.add('bounce');
      setTimeout(() => markerElement.classList.remove('bounce'), 750);
    });

    advancedMarker.content = markerElement;
    markers.push(advancedMarker);
  });
}
