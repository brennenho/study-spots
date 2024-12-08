async function fetchStudySpots() {
    try {
        const response = await fetch('http://localhost:8080/api/studyspots/getall');
        const data = await response.json();

        // Fetch study spots and their respective comments
        studySpots = await Promise.all(data.map(async (spot) => {
            const commentsResponse = await fetch(`http://localhost:8080/api/comments/spot/${spot.spotId}`);
            const commentsData = await commentsResponse.json();

            return {
                spotId: spot.spotId,
                name: spot.name,
                location: spot.location,
                image: spot.image,
                latitude: spot.latitude,
                longitude: spot.longitude,
                hours: spot.hours,
                tags: spot.tags.split(","),
                comments: commentsData.map(comment => ({
                    id: comment.id,
                    userId: comment.user_id,
                    postId: comment.post_id,
                    title: comment.title,
                    description: comment.description,
                    timestamp: comment.timestamp,
                    rating: comment.rating
                }))
            };
        }));

        console.log('Study spots with comments:', studySpots);
        createMarkers();
    } catch (error) {
        console.error('Error fetching study spots or comments:', error);
    }
}
