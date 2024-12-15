const backendBaseUrl = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  console.log("Current userId from localStorage:", userId); // Debug log

  if (!userId) {
    window.location.href = "./login.html";
    return;
  }

  updateNavigation();
  displaySavedSpots();
});

async function fetchSavedSpots() {
  const token = localStorage.getItem("userToken");
  const userEmail = localStorage.getItem("userId");

  if (!token || !userEmail) {
    window.location.href = "./login.html";
    return [];
  }

  try {
    const response = await fetch(
      `${backendBaseUrl}/SavedStudySpots/userspecific?email=${encodeURIComponent(
        userEmail,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const savedSpots = await response.json();
    console.log("Saved spots response:", savedSpots);

    const spotDetails = await Promise.all(
      savedSpots.map(async (savedSpot) => {
        const spotResponse = await fetch(
          `${backendBaseUrl}/api/studyspots/getbyid/${savedSpot.spotId}`,
        );
        if (!spotResponse.ok) {
          throw new Error(`Failed to fetch spot ${savedSpot.spotId}`);
        }
        const spot = await spotResponse.json();
        return {
          ...spot,
          savedDate: savedSpot.date,
        };
      }),
    );

    return spotDetails;
  } catch (error) {
    console.error("Error fetching saved spots:", error);
    const container = document.getElementById("saved-spots-container");
    container.innerHTML =
      "<p>Error loading saved spots. Please try again later.</p>";
    return [];
  }
}

function createSpotCard(spot) {
  const card = document.createElement("div");
  card.className = "card";

  const tags = spot.tags
    ? Array.isArray(spot.tags)
      ? spot.tags
      : spot.tags.split(",").map((tag) => tag.trim())
    : [];

  const imageUrl = spot.image ? spot.image : "/img/default-spot.jpg";

  card.innerHTML = `
        <img src="${imageUrl}" alt="${spot.name || "Study Spot"}">
        <div class="card-content">
            <h2 class="card-title">${spot.name}</h2>
            <p><strong>Location:</strong> ${spot.location}</p>
            <p><strong>Hours:</strong> ${spot.hours}</p>
            <p><strong>Added by:</strong> User #${spot.userId}</p>
            <div class="card-tags">
                ${tags
                  .map((tag) => `<span class="characteristic">${tag}</span>`)
                  .join("")}
            </div>
            <div class="card-actions">
                <a href="review_page.html?spotid=${
                  spot.spotId
                }" class="btn view-details">View Details</a>
            </div>
        </div>
    `;
  return card;
}

async function displaySavedSpots() {
  const container = document.getElementById("saved-spots-container");
  const spots = await fetchSavedSpots();

  if (!spots || spots.length === 0) {
    container.innerHTML = "<p>You have no saved spots yet!</p>";
    return;
  }

  container.innerHTML = ""; // Clear container
  spots.forEach((spot) => container.appendChild(createSpotCard(spot)));
}

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
      { href: "./spots_list.html", text: "Study Spots" },
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
