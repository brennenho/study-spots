function updateNavigation() {
  const isLoggedIn = localStorage.getItem("userToken") !== null;
  const nav = document.querySelector(".nav-links");

  if (!nav) {
    console.error("Navigation menu not found");
    return;
  }

  try {
    nav.innerHTML = "";

    const commonLinks = [
      { href: "./addspot.html", text: "Add Spot" },
      { href: "./map.html", text: "Map" },
      { href: "./spots_list.html", text: "Reviews" },
      { href: "./trending.html", text: "Trending" },
      { href: "./login.html", text: "Login" },
      { href: "./register.html", text: "Register" },
    ];

    const userLinks = [
      ...commonLinks.filter(
        (link) =>
          link.href !== "./login.html" && link.href !== "./register.html",
      ),
      { href: "./savedspots.html", text: "Saved Spots" },
      { href: "#", text: "Logout", id: "logout-btn" },
    ];
    const linksToRender = isLoggedIn ? userLinks : commonLinks;

    linksToRender.forEach((link) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.text;

      if (window.location.pathname.endsWith(link.href.split("/").pop())) {
        a.classList.add("active");
      }

      if (link.id === "logout-btn") {
        a.addEventListener("click", (e) => {
          e.preventDefault();

          localStorage.removeItem("userToken");
          localStorage.removeItem("userId");

          window.location.href = "/pages/login.html";
        });
      }

      li.appendChild(a);
      nav.appendChild(li);
    });
  } catch (error) {
    console.error("Error updating navigation:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavigation();
  const registerForm = document.querySelector("form.spot-submission");
  const spotNameInput = document.getElementById("spotname");
  const locationNameInput = document.getElementById("location");
  const longitudeInput = document.getElementById("longitude");
  const latitudeInput = document.getElementById("latitude");
  const hoursInput = document.getElementById("hours");
  const imageInput = document.getElementById("image");

  const errorContainer = document.createElement("div");
  errorContainer.className = "error-message";
  errorContainer.style.cssText =
    "color: #dc2626; padding: 10px; margin: 10px 0; display: none; text-align: center;";
  registerForm.insertBefore(errorContainer, registerForm.firstChild);

  // Handle form submission
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Collect selected tags
    const selectedTags = Array.from(
      document.querySelectorAll("#tags input[type='checkbox']:checked"),
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
        window.location.href = "../pages/map.html";
      } else {
        errorContainer.textContent = data.message || "Error adding study spot";
        errorContainer.style.display = "block";
        errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      console.error("Error:", error);
      errorContainer.textContent =
        "Unable to add spot. Please check your connection and try again.";
      errorContainer.style.display = "block";
    }
  });
});
