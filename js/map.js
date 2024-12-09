let map;
let activeInfoWindow = null;
let markers = [];

// Wait for DOM to load before initializing
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    updateNavigation();
});

function initMap() {
    try {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 34.0224, lng: -118.2851 }, // USC area
            zoom: 15,
            styles: [
                {
                    featureType: "poi.school",
                    elementType: "labels",
                    stylers: [{ visibility: "on" }]
                }
            ]
        });
        fetchStudySpots();
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

async function fetchStudySpots() {
    try {
        const response = await fetch('http://localhost:8080/spots', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch study spots');
        }

        const studySpots = await response.json();
        clearMarkers();
        createMarkers(studySpots);
    } catch (error) {
        console.error('Error fetching study spots:', error);
    }
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

function createMarkers(studySpots) {
    studySpots.forEach(spot => {
        const marker = new google.maps.Marker({
            position: {
                lat: parseFloat(spot.latitude),
                lng: parseFloat(spot.longitude)
            },
            map: map,
            title: spot.name
        });

        marker.addListener("click", () => {
            showSpotDetails(spot, marker);
            markers.forEach(m => m.setAnimation(null));
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 750);
        });

        markers.push(marker);
    });
}

function showSpotDetails(spot, marker) {
    if (activeInfoWindow) {
        activeInfoWindow.close();
    }

    const rating = spot.averageRating ? spot.averageRating.toFixed(1) : 'No ratings';
    const content = `
        <div class="info-window">
            <h3>${spot.name}</h3>
            <p><strong>Type:</strong> ${spot.type}</p>
            <p><strong>Rating:</strong> ${rating}</p>
            <p><strong>Noise Level:</strong> ${spot.noiseLevel || 'Not specified'}</p>
            <p><strong>Hours:</strong> ${spot.hours || 'Not specified'}</p>
            <div class="info-window-buttons">
                <button onclick="viewSpotDetails(${spot.id})" class="btn-details">
                    View Details
                </button>
                <button onclick="navigateToSpot(${spot.latitude}, ${spot.longitude})" class="btn-navigate">
                    Navigate
                </button>
            </div>
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: content,
        maxWidth: 300
    });

    infoWindow.open(map, marker);
    activeInfoWindow = infoWindow;
}

function viewSpotDetails(spotId) {
    window.location.href = `./pages/spot_details.html?id=${spotId}`;
}

function navigateToSpot(lat, lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
}

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
            { href: 'pages/addspot.html', text: 'Add Spot' },
            { href: 'pages/map.html', text: 'Map' },
            { href: 'pages/review_page.html', text: 'Reviews' },
            { href: 'pages/trending.html', text: 'Trending' },
            { href: 'pages/login.html', text: 'Login' },
            { href: 'pages/register.html', text: 'Register' }
        ];

        const userLinks = [
            ...commonLinks.filter(link => 
                link.href !== 'pages/login.html' && 
                link.href !== 'pages/register.html'
            ),
            { href: '#', text: 'Logout', id: 'logout-btn' }
        ];

        const linksToRender = isLoggedIn ? userLinks : commonLinks;

        linksToRender.forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;

            if (window.location.pathname.endsWith(link.href.split('/').pop())) {
                a.classList.add('active');
            }

            if (link.id === 'logout-btn') {
                a.addEventListener('click', handleLogout);
            }

            li.appendChild(a);
            nav.appendChild(li);
        });
    } catch (error) {
        console.error('Error updating navigation:', error);
    }
}

async function handleLogout(e) {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:8080/users/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        });

        if (response.ok) {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userId');
            window.location.href = './pages/login.html';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Error during logout. Please try again.');
    }
}


window.addEventListener('resize', () => {
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
});
