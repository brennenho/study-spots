let studySpots = []; // Global variable to store study spots

async function fetchStudySpots() {
  try {
    const response = await fetch("http://localhost:8080/api/studyspots/getall");
    if (!response.ok) {
      throw new Error(`Failed to fetch study spots: ${response.status}`);
    }
    const data = await response.json();

    studySpots = await Promise.all(
      data.map(async (spot) => {
        try {
          // Fetch comments for each spot
          const commentsResponse = await fetch(
            `http://localhost:8080/comments/spot/${spot.spotId}`,
          );
          if (!commentsResponse.ok) {
            console.warn(
              `Unable to fetch comments for spot ${spot.spotId}: ${commentsResponse.status}`,
            );
            return transformSpotData(spot, []);
          }
          const commentsData = await commentsResponse.json();
          return transformSpotData(spot, commentsData);
        } catch (commentError) {
          console.warn(
            `Error fetching comments for spot ${spot.spotId}:`,
            commentError,
          );
          return transformSpotData(spot, []);
        }
      }),
    );

    console.log("Study spots loaded:", studySpots);
    createMarkers(studySpots);
  } catch (error) {
    console.error("Error fetching study spots:", error);
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-alert";
    errorMessage.textContent =
      "Unable to load study spots. Please try again later.";
    document.body.insertBefore(errorMessage, document.body.firstChild);
  }
}

function transformSpotData(spot, commentsData) {
  const tags = spot.tags
    ? spot.tags
        .split(",")
        .filter((tag) => tag.trim())
        .map((tag) => tag.trim())
    : [];

  // Calculate average rating
  const averageRating =
    commentsData.length > 0
      ? commentsData.reduce((sum, comment) => sum + (comment.rating || 0), 0) /
        commentsData.length
      : 0;

  const reviews = commentsData.map((comment) => ({
    author: `User ${comment.userId}`,
    rating: comment.rating || 0,
    text: comment.description || "",
  }));

  return {
    spotId: spot.spotId,
    name: spot.name || "Unnamed Location",
    location: spot.location || "",
    image: spot.image || "../img/default-spot.jpg",
    latitude: parseFloat(spot.latitude) || 0,
    longitude: parseFloat(spot.longitude) || 0,
    hours: spot.hours || "Hours not specified",
    characteristics: tags,
    rating: parseFloat(averageRating.toFixed(1)),
    reviews: reviews,
  };
}
