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

    // test 
    // fakeData.forEach(spot => container.appendChild(createSpotCard(spot)));

    displaySavedSpots();
}); 
