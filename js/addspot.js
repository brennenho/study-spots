document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("form.spot-submission");
  const spotNameInput = document.getElementById("spotname");
  const locationNameInput = document.getElementById("location");
  const longitudeInput = document.getElementById("longitude");
  const latitudeInput = document.getElementById("latitude");
  const hoursInput = document.getElementById("hours");
  const imageInput = document.getElementById("image");

  // Handle form submission
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Collect selected tags
    const selectedTags = Array.from(
      document.querySelectorAll("#tags input[type='checkbox']:checked")
    ).map((checkbox) => checkbox.value);

    const spotData = {
      name: spotNameInput.value.trim(),
      location: locationNameInput.value.trim(),
      latitude: parseFloat(latitudeInput.value.trim()),
      longitude: parseFloat(longitudeInput.value.trim()),
      hours: hoursInput.value.trim(),
      image: imageInput ? imageInput.value.trim() : "../img/default-spot.jpg",
      tags: selectedTags,
    };

    console.log("Submitting spot data:", spotData); // Debug log

    try {
      const response = await fetch("http://localhost:8080/api/studyspots/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(spotData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Study spot added successfully!");
        window.location.href = "/pages/map.html";
      } else {
        errorContainer.textContent = data.message || "Error adding study spot";
      }
    } catch (error) {
      console.error("Error:", error);
      errorContainer.textContent =
        "Unable to add spot. Please check your connection and try again.";
    }
  });
});
