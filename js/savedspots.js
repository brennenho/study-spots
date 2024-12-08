document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("saved-spots-container");

    async function fetchSavedSpots() {
        try {
            const response = await fetch("http://localhost:8080/SavedStudySpots/userspecific");
            if (!response.ok) throw new Error("Failed to fetch saved spots.");
            return await response.json();
        } catch (error) {
            console.error("Error fetching saved spots:", error);
            container.innerHTML = "<p>Error loading saved spots. Please try again later.</p>";
            return [];
        }
    }

    function createSpotCard(spot) {
        const card = document.createElement("div");
        card.className = "card";
    
        card.innerHTML = `
            <img src="${spot.image}" alt="${spot.name}">
            <div class="card-content">
                <h2 class="card-title">${spot.name}</h2>
                <p><strong>Location:</strong> ${spot.location}</p>
                <p><strong>Hours:</strong> ${spot.hours}</p>
                <div class="card-tags">
                    ${spot.tags.map(tag => `<span>${tag}</span>`).join("")}
                </div>
            </div>
        `;
        return card;
    }

    async function displaySavedSpots() {
        const spots = await fetchSavedSpots();
        if (spots.length === 0) {
            container.innerHTML = "<p>You have no saved spots yet!</p>";
            return;
        }
        spots.forEach(spot => container.appendChild(createSpotCard(spot)));
    }

    displaySavedSpots();
    updateNavigation();
});

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
            { href: './savedspots.html', text: 'Saved Spots' },
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

 // Fake data to test card design
    //  const fakeData = [
    //     {
    //         name: "Leave Floor LibraryStudy Spot",
    //         location: "Doheny Library",
    //         image: "../img/leavey.jpg",
    //         hours: "Monday - Sunday 24 hours",
    //         tags: ["WiFi", "Outlets", "Silent Areas"]
    //     }
    // ];
