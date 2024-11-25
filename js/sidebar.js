function showSpotDetails(spot) {
    const sidebar = document.querySelector('.sidebar');
    const spotDetails = document.getElementById('spot-details');
    const spotContent = document.getElementById('spot-content');
    
    const stars = "★".repeat(Math.floor(spot.rating)) + 
                 "☆".repeat(10 - Math.floor(spot.rating));

    spotContent.innerHTML = `
        <div class="spot-header">
            ${spot.image ? `<img src="${spot.image}" alt="${spot.name}" class="spot-image">` : ''}
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