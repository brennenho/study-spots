/**
 * Display the details of a study spot in the sidebar.
 * @param {Object} spot - The study spot object.
 */
function showSpotDetails(spot) {
    const sidebar = document.querySelector('.sidebar');
    const spotDetails = document.getElementById('spot-details');
    const spotContent = document.getElementById('spot-content');
    
    // Convert rating from 0-10 scale to 5-star rating
    const fullStars = Math.round(spot.rating / 2);
    const emptyStars = 5 - fullStars;
    const stars = "★".repeat(fullStars) + "☆".repeat(emptyStars);
  
    // If you want to show the numeric rating, you can choose how:
    // For example: `${spot.rating.toFixed(1)}/10`
    // Or just keep it as stars only. Below includes a numeric display as well.
    spotContent.innerHTML = `
      <div class="spot-header">
        ${spot.image ? `<img src="${spot.image}" alt="${spot.name}" class="spot-image">` : ''}
        <div class="spot-name">${spot.name}</div>
        <div class="rating">
          <span class="stars">${stars}</span>
          <span>${spot.rating.toFixed(1)}/10</span>
        </div>
        <div class="characteristics">
          ${spot.characteristics.map(char => 
            `<span class="characteristic">${char}</span>`
          ).join('')}
        </div>
      </div>
      <div class="reviews">
        <h3>Reviews</h3>
        ${spot.reviews.length > 0 ? spot.reviews.map(review => `
          <div class="review">
            <div class="review-header">
              <strong>${review.author}</strong>
              <span>${review.rating}/10</span>
            </div>
            <div class="review-text">${review.text}</div>
          </div>
        `).join('') : '<p>No reviews yet.</p>'}
      </div>
    `;
  
    sidebar.classList.add('active');
    spotDetails.classList.remove('hidden');
  }
  
  /**
   * Close the sidebar when the close button is clicked.
   */
  document.getElementById('close-sidebar').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('active');
    // Remove bounce animation from all markers
    markers.forEach(marker => {
      if (marker.content) {
        marker.content.classList.remove('bounce');
      }
    });
  });
  
