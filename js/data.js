// Study spot data
let studySpots = [];


async function fetchStudySpots() {
    try {
        const response = await fetch('http://localhost:8080/api/studyspots/getall');
        const data = await response.json();

        studySpots = await Promise.all(data.map(async (spot) => {
            const reviewsResponse = await fetch(`http://localhost:8080/comments/spot/${spot.spotId}`);
            const reviews = await reviewsResponse.json();

            return {
                spotId: spot.spotId,
                name: spot.name,
                address: spot.address,
                image: spot.image,
                position: {
                    lat: spot.latitude,
                    lng: spot.longitude
                },
                rating: spot.rating,
                characteristics: [], 
                reviews: reviews.map(review => ({
                    author: `User ${review.userId}`,
                    rating: review.rating,
                    text: review.description
                }))
            };
        }));

        createMarkers();
    } catch (error) {
        console.error('Error fetching study spots:', error);
    }
}



// const studySpots = [
//     {
//         image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/USCLeavey2007.jpg",
//         name: "Leavey Library",
//         position: { lat: 34.0219, lng: -118.2828 },
//         rating: 9,
//         characteristics: ["24/7", "WiFi", "AC", "Silent Areas", "Group Rooms"],
//         reviews: [
//             { author: "John D.", rating: 9, text: "Perfect for late night studying. Always quiet and clean." },
//             { author: "Sarah M.", rating: 8, text: "Great facilities, but can get crowded during finals." }
//         ]
//     },
//     {
//         image: "https://libraries.usc.edu/sites/default/files/styles/16_9_xlarge/public/2019-08/dml-front.jpg?itok=fFEBm0a3",
//         name: "Doheny Library",
//         position: { lat: 34.0205, lng: -118.2837 },
//         rating: 8.5,
//         characteristics: ["Historic Building", "WiFi", "AC", "Research Resources"],
//         reviews: [
//             { author: "Mike R.", rating: 9, text: "Beautiful architecture and peaceful atmosphere." },
//             { author: "Emma L.", rating: 8, text: "Love the quiet study rooms and old book smell." }
//         ]
//     },
//     {
//         image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2-lyBbsfHYb8gwHXGNk1WvF1BVHbVRQZBJg&s",
//         name: "Dulce Cafe",
//         position: { lat: 34.0250, lng: -118.2849 },
//         rating: 7.5,
//         characteristics: ["Coffee", "WiFi", "Food Available", "Casual Environment"],
//         reviews: [
//             { author: "Alex P.", rating: 7, text: "Good coffee and decent wifi. Can get noisy." },
//             { author: "Lisa K.", rating: 8, text: "Perfect for group study sessions!" }
//         ]
//     }
// ];
