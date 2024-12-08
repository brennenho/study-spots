// Function to dynamically update navigation links
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
            { href: './review_page.html', text: 'Reviews' },
            { href: './trending.html', text: 'Trending' },
            { href: './login.html', text: 'Login' },
            { href: './register.html', text: 'Register' }
        ];

        const userLinks = [
            ...commonLinks.filter(link => link.href !== './login.html' && link.href !== './register.html'),
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
                a.addEventListener('click', async (e) => {
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
                            window.location.href = './login.html';
                        } else {
                            alert('Logout failed. Please try again.');
                        }
                    } catch (error) {
                        alert('Error during logout. Please try again.');
                    }
                });
            }

            li.appendChild(a);
            nav.appendChild(li);
        });
    } catch (error) {
        console.error('Error updating navigation:', error);
    }
}

// Initialize the map
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 34.0224, lng: -118.2851 },
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
}

// Fetch and create markers for study spots
function createMarkers(studySpots) {
    const markers = [];
    studySpots.forEach(spot => {
        const marker = new google.maps.Marker({
            position: spot.position,
            map: map,
            title: spot.name
        });

        marker.addListener("click", () => {
            showSpotDetails(spot);
            markers.forEach(m => m.setAnimation(null));
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 750);
        });

        markers.push(marker);
    });
}

// Ensure everything initializes when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation(); // Update navigation links dynamically
    initMap(); // Initialize the map
});
