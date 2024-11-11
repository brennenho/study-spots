// Study spot data
const studySpots = [
    {
        name: "Leavey Library",
        position: { lat: 34.0219, lng: -118.2828 },
        rating: 9,
        characteristics: ["24/7", "WiFi", "AC", "Silent Areas", "Group Rooms"],
        reviews: [
            { author: "John D.", rating: 9, text: "Perfect for late night studying. Always quiet and clean." },
            { author: "Sarah M.", rating: 8, text: "Great facilities, but can get crowded during finals." }
        ]
    },
    {
        name: "Doheny Library",
        position: { lat: 34.0205, lng: -118.2837 },
        rating: 8.5,
        characteristics: ["Historic Building", "WiFi", "AC", "Research Resources"],
        reviews: [
            { author: "Mike R.", rating: 9, text: "Beautiful architecture and peaceful atmosphere." },
            { author: "Emma L.", rating: 8, text: "Love the quiet study rooms and old book smell." }
        ]
    },
    {
        name: "Dulce Cafe",
        position: { lat: 34.0250, lng: -118.2849 },
        rating: 7.5,
        characteristics: ["Coffee", "WiFi", "Food Available", "Casual Environment"],
        reviews: [
            { author: "Alex P.", rating: 7, text: "Good coffee and decent wifi. Can get noisy." },
            { author: "Lisa K.", rating: 8, text: "Perfect for group study sessions!" }
        ]
    }
];

// Initialize map
let map;
let activeInfoWindow = null;
let markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
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

    // Create markers for each study spot
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

function showSpotDetails(spot) {
    const sidebar = document.querySelector('.sidebar');
    const spotDetails = document.getElementById('spot-details');
    const spotContent = document.getElementById('spot-content');
    
    // Generate stars string
    const stars = "★".repeat(Math.floor(spot.rating)) + 
                 "☆".repeat(10 - Math.floor(spot.rating));

    spotContent.innerHTML = `
        <div class="spot-header">
            <div class="spot-name">${spot.name}</div>
            <div class="rating">
                <span class="stars">${stars}</span>
                <span>${spot.rating}/10</span>
            </div>
            <div class="characteristics">
                ${spot.characteristics.map(char => 
                    `<span class="characteristic">${char}</span>`
                ).join('')}
            </div>
        </div>
        <div class="reviews">
            <h3>Reviews</h3>
            ${spot.reviews.map(review => `
                <div class="review">
                    <div class="review-header">
                        <strong>${review.author}</strong>
                        <span>${review.rating}/10</span>
                    </div>
                    <div class="review-text">${review.text}</div>
                </div>
            `).join('')}
        </div>
    `;

    sidebar.classList.add('active');
    spotDetails.classList.remove('hidden');
}

// Close sidebar
document.getElementById('close-sidebar').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('active');
    markers.forEach(marker => marker.setAnimation(null));
});

// Initialize the map
initMap();