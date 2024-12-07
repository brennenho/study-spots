
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector("form.spot-submission");
    const spotNameInput = document.getElementById("spotname");
    const locationNameInput = document.getElementById("location");
    const addressInput = document.getElementById("address");
    const hoursInput = document.getElementById("hours");


    // Handle form submission
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        const spotName = spotNameInput.value.trim();
        const locationName = locationNameInput.value.trim();
        const address = addressInput.value.trim();
        const hours = hoursInput.value.trim();

        try {
            // Build the URL for the servlet 
            const baseURL = window.location.origin;  // Get the base URL (e.g., http://localhost:8080)
            const url = new URL("AddStudySpotServlet", baseURL); // Append the servlet path 

            // Prepare the data to send
            const params = {
                spotName,
                locationName,
                address,
                hours
            };

            // Send data to the server for validation
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            const result = await response.json();

            if (response.ok) {
                // Successful Submission
                alert("Spot submitted successfully!");
            } else {
                // Display server-side validation errors
                errorContainer.textContent = result.message || "An error occurred. Please try again.";
            }
        } catch (error) {
            errorContainer.textContent = "Unable to register. Please check your connection and try again.";
        }
    });
});
