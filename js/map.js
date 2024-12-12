function updateNavigation() {
  const isLoggedIn = localStorage.getItem("userToken") !== null;
  const nav = document.querySelector(".nav-links");

  if (!nav) {
    console.error("Navigation menu not found");
    return;
  }

  try {
    nav.innerHTML = "";

    const commonLinks = [
      { href: "./addspot.html", text: "Add Spot" },
      { href: "./map.html", text: "Map" },
      { href: "./spots_list.html", text: "Reviews" },
      { href: "./trending.html", text: "Trending" },
      { href: "./login.html", text: "Login" },
      { href: "./register.html", text: "Register" },
    ];

    const userLinks = [
      ...commonLinks.filter(
        (link) =>
          link.href !== "./login.html" && link.href !== "./register.html",
      ),
      { href: "./pages/savedspots.html", text: "Saved Spots" },
      { href: "#", text: "Logout", id: "logout-btn" },
    ];

    const linksToRender = isLoggedIn ? userLinks : commonLinks;

    linksToRender.forEach((link) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.text;

      // Highlight the active link
      if (window.location.pathname.endsWith(link.href.split("/").pop())) {
        a.classList.add("active");
      }

      // Add logout functionality
      if (link.id === "logout-btn") {
        a.addEventListener("click", (e) => {
          e.preventDefault();

          localStorage.removeItem("userToken");
          localStorage.removeItem("userId");

          window.location.href = "/pages/login.html";
        });
      }

      li.appendChild(a);
      nav.appendChild(li);
    });
  } catch (error) {
    console.error("Error updating navigation:", error);
  }
}

// -------------------------- Map Functionality --------------------------

let map;
let markers = [];

/**
 * Initialize the Google Map.
 */
window.initMap = function () {
  console.log("initMap called"); // For debugging purposes

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.0224, lng: -118.2851 }, // USC coordinates
    zoom: 15,
    mapId: "f9624ecfd26562d1",
    styles: [
      {
        featureType: "poi.school",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
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
    const response = await fetch("http://localhost:8080/api/studyspots/getall");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    studySpots = data.map((spot) => ({
      ...spot,
      characteristics: spot.tags
        ? spot.tags.split(",").map((tag) => tag.trim())
        : [],
      // Ensure latitude and longitude are numbers
      latitude: parseFloat(spot.latitude),
      longitude: parseFloat(spot.longitude),
    }));
    console.log("Study spots loaded:", studySpots);
    createMarkers(studySpots);
  } catch (error) {
    console.error("Error fetching study spots:", error);
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
    // Validate coordinates
    if (isNaN(spot.latitude) || isNaN(spot.longitude)) {
      console.error(`Invalid coordinates for spot: ${spot.name}`);
      return;
    }

    // Create a custom HTML element for the marker
    const markerElement = document.createElement("div");
    markerElement.className = "custom-marker";
    markerElement.innerHTML = `<div class="marker-icon"></div>`;

    const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: {
        lat: spot.latitude,
        lng: spot.longitude,
      },
      content: markerElement,
      title: spot.name,
    });

    // Add click event listener
    advancedMarker.addListener("click", () => {
      showSpotDetails(spot);

      // Remove bounce animation from all markers
      markers.forEach((m) => {
        if (m.content) {
          m.content.classList.remove("bounce");
        }
      });

      // Add bounce animation to clicked marker
      markerElement.classList.add("bounce");
      setTimeout(() => markerElement.classList.remove("bounce"), 750);
    });

    markers.push(advancedMarker);
  });

  // Optionally fit map bounds to show all markers
  if (markers.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    markers.forEach((marker) => {
      bounds.extend(marker.position);
    });
    map.fitBounds(bounds);
  }
}

/**
 * Display details of the selected study spot.
 * @param {Object} spot - The study spot object.
 */
function showSpotDetails(spot) {
  // Prevent default behavior that might trigger unwanted navigation
  event.preventDefault();
  event.stopPropagation();

  const sidebar = document.getElementById("spot-details");
  const content = document.getElementById("spot-content");

  content.innerHTML = `
        <h2>${spot.name}</h2>
        <p><strong>Location:</strong> ${spot.location}</p>
        <p><strong>Hours:</strong> ${spot.hours}</p>
        <div class="characteristics">
            ${spot.characteristics
              .map((char) => `<span class="tag">${char}</span>`)
              .join("")}
        </div>
        <a href="./review_page.html?spotid=${
          spot.spotId
        }" class="view-reviews-btn">
            View Reviews
        </a>
    `;

  sidebar.classList.remove("hidden");

  content.onclick = (e) => {
    e.stopPropagation();
  };
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavigation();
});
