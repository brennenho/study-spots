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

    fetchStudySpots();
}

function createMarkers(studySpots) {
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

initMap();
