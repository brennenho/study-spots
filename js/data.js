let studySpots = []; // Global variable to store study spots

async function fetchStudySpots() {
  try {
    const response = await fetch('http://localhost:8080/api/studyspots/getall');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    studySpots = await Promise.all(
      data.map(async (spot) => {
        // Fetch comments for each spot
        const commentsResponse = await fetch(`http://localhost:8080/comments/spot/${spot.spotId}`);
        if (!commentsResponse.ok) {
          throw new Error(`HTTP error! status: ${commentsResponse.status}`);
        }
        const commentsData = await commentsResponse.json();

        // Calculate average rating from comments
        const averageRating = commentsData.length > 0
          ? commentsData.reduce((sum, comment) => sum + comment.rating, 0) / commentsData.length
          : 0;

        return {
          spotId: spot.spotId,
          name: spot.name,
          location: spot.location,
          image: spot.image,
          latitude: parseFloat(spot.latitude),
          longitude: parseFloat(spot.longitude),
          hours: spot.hours,
          characteristics: spot.tags.split(',').map(tag => tag.trim()),
          rating: averageRating, // Store computed rating
          reviews: commentsData.map((comment) => ({
            author: `User ${comment.userId}`, 
            rating: comment.rating,
            text: comment.description,
          })),
        };
      })
    );

    console.log('Study spots with comments:', studySpots);
    createMarkers(studySpots); // Pass studySpots as an argument
  } catch (error) {
    console.error('Error fetching study spots or comments:', error);
  }
}
