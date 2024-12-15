document.addEventListener("DOMContentLoaded", () => {
  updateNavigation();
  fetchStudySpots();

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    sortSpots(e.target.value);
  });
});

let allSpots = [];

async function fetchStudySpots() {
  try {
    const response = await fetch("http://localhost:8080/api/studyspots/getall");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allSpots = await response.json();
    sortSpots("id"); // Default sort by ID
  } catch (error) {
    console.error("Error fetching study spots:", error);
    const grid = document.getElementById("spotsGrid");
    grid.innerHTML =
      '<div class="error-message">Unable to load study spots. Please try again later.</div>';
  }
}

function sortSpots(sortType) {
  const sortedSpots = [...allSpots];
  switch (sortType) {
    case "nameAsc":
      sortedSpots.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "nameDesc":
      sortedSpots.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default: // 'id'
      sortedSpots.sort((a, b) => a.spotId - b.spotId);
  }
  displaySpots(sortedSpots);
}

function displaySpots(spots) {
  const grid = document.getElementById("spotsGrid");
  grid.innerHTML = "";

  spots.forEach((spot) => {
    const card = createSpotCard(spot);
    grid.appendChild(card);
  });
}

function createSpotCard(spot) {
  const card = document.createElement("div");
  card.className = "spot-card";
  card.onclick = () =>
    (window.location.href = `/pages/review_page.html?spotid=${spot.spotId}`);

  // Safely handle tags - convert string to array if necessary
  const tagsArray = spot.tags
    ? typeof spot.tags === "string"
      ? spot.tags.split(",").map((tag) => tag.trim())
      : spot.tags
    : [];

  // Use default image if no valid imgur link
  const imageUrl = spot.image ? spot.image : "/img/default-spot.jpg";

  card.innerHTML = `
        <img src="${imageUrl}" alt="${spot.name}" class="spot-image">
        <div class="spot-info">
            <div class="spot-name">${spot.name}</div>
            <div class="spot-location">${spot.location}</div>
            <div class="spot-tags">
                ${tagsArray
                  .map((tag) => `<span class="tag">${tag}</span>`)
                  .join("")}
            </div>
        </div>
    `;

  return card;
}

function updateNavigation() {
  const isLoggedIn = localStorage.getItem("userToken") !== null;
  const nav = document.querySelector(".nav-links");
  if (!nav) return;

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
      (link) => link.href !== "./login.html" && link.href !== "./register.html",
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
}
