function updateNavigation() {
  const isLoggedIn = localStorage.getItem('userToken') !== null;
  const nav = document.querySelector('.nav-links');

  if (!nav) {
      console.error('Navigation menu not found');
      return;
  }

  try {
      nav.innerHTML = '';

      const commonLinks = [
          { href: './addspot.html', text: 'Add Spot' },
          { href: './map.html', text: 'Map' },
          { href: './review_page.html?spotid=1', text: 'Reviews' },
          { href: './trending.html', text: 'Trending' },
          { href: './login.html', text: 'Login' },
          { href: './register.html', text: 'Register' }
      ];

      const userLinks = [
          ...commonLinks.filter(link => 
              link.href !== './login.html' && 
              link.href !== './register.html'
          ),
          { href: './pages/savedspots.html', text: 'Saved Spots' },  
          { href: '#', text: 'Logout', id: 'logout-btn' }
      ];

      const linksToRender = isLoggedIn ? userLinks : commonLinks;

      linksToRender.forEach(link => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.text;

          // Highlight the active link
          if (window.location.pathname.endsWith(link.href.split('/').pop())) {
              a.classList.add('active');
          }

          // Add logout functionality
             if (link.id === 'logout-btn') {
                        a.addEventListener('click', (e) => {
                            e.preventDefault();
                            
                            localStorage.removeItem('userToken');
                            localStorage.removeItem('userId');
                            
                            window.location.href = '/pages/login.html';
                        });
                    }

          li.appendChild(a);
          nav.appendChild(li);
      });
  } catch (error) {
      console.error('Error updating navigation:', error);
  }
}

// -------------------------- Map Functionality --------------------------

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
* Fetch study spots from the server and create markers on the map.
*/
async function fetchStudySpots() {
  try {
      const response = await fetch('http://localhost:8080/api/studyspots'); // Adjust the endpoint as needed
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const studySpots = await response.json();
      createMarkers(studySpots);
  } catch (error) {
      console.error('Error fetching study spots:', error);
  }
}

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

/**
* Display details of the selected study spot.
* @param {Object} spot - The study spot object.
*/
function showSpotDetails(spot) {
  console.log('Spot Details:', spot);
}
document.addEventListener('DOMContentLoaded', () => {
  updateNavigation();
});
