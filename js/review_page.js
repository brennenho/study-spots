const backendBaseUrl = "http://localhost:8080";
var spotId = 1;
let allComments = [];

document.addEventListener("DOMContentLoaded", () => {
  var urlParams = new URLSearchParams(window.location.search);
  spotId = urlParams.get("spotid");
  console.log("spotid:" + spotId);
  updateButton();
  fetchComments();
  fetchSpotInfo();
  document
    .getElementById("submit-review-btn")
    .addEventListener("click", submitReview);
  document
    .getElementById("sort-select")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filter-select")
    .addEventListener("change", applyFilters);
  updateNavigation();
});

function updateButton() {
  var saveButton = document.getElementById("save-button");
  const isLoggedIn = localStorage.getItem("userToken") !== null;
  if (isLoggedIn) {
    saveButton.style.display = "block";
  } else {
    saveButton.style.display = "none";
  }
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

async function saveSpot() {
  const token = localStorage.getItem("userToken");
  const userEmail = localStorage.getItem("userId");

  if (!token || !userEmail) {
    alert("Please log in to save spots");
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("email", userEmail);
    formData.append("spot_id", spotId);

    const response = await fetch(`${backendBaseUrl}/SavedStudySpots/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const result = await response.text();

    if (result === "Already Saved") {
      alert("You've already saved this study spot!");
    } else if (result === "Saved") {
      alert("Study spot saved successfully!");
    } else {
      alert("Error saving study spot");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Unable to save spot. Please check your connection and try again.");
  }
}

async function fetchSpotInfo() {
  try {
    const response = await fetch(
      `${backendBaseUrl}/api/studyspots/getbyid/${spotId}`,
    );
    const data = await response.json();
    console.log(data);
    updateSpotInfo(data);
  } catch (error) {
    console.error("Error fetching spot info:", error);
  }
}

function updateSpotInfo(data) {
  if (!data) {
    console.error("No spot data received");
    return;
  }

  const spot = {
    name: data.name || "Unknown Spot",
    location: data.location || "Location not specified",
    image:
      data.image && data.image.includes("imgur.com")
        ? data.image
        : "/img/default-spot.jpg",
    hours: data.hours || "Hours not specified",
    tags: data.tags
      ? typeof data.tags === "string"
        ? data.tags.split(",").filter((tag) => tag && tag.trim())
        : data.tags
      : [],
  };

  document.getElementById("spot-name").textContent = spot.name;
  document.getElementById("spot-hours").textContent = spot.hours;
  document.getElementById("spot-location").textContent = spot.location;
  document.getElementById("spot-tags").innerHTML = "";
  document.getElementById("spot-image").src = spot.image;

  spot.tags.forEach((tag) => {
    if (tag && tag.trim()) {
      document.getElementById(
        "spot-tags",
      ).innerHTML += `<span class="characteristic">${tag.trim()}</span>`;
    }
  });
}

function fetchComments() {
  fetch(`${backendBaseUrl}/comments/spot/${spotId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((comments) => {
      // Ensure comments is an array
      allComments = Array.isArray(comments) ? comments : [];
      renderComments(allComments);
      updateSpotStats(allComments);
    })
    .catch((error) => {
      console.error("Error fetching comments:", error);
      const reviewList = document.getElementById("reviews-list");
      reviewList.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
      updateSpotStats([]);
    });
}

function updateSpotStats(comments) {
  if (comments.length > 0) {
    const avg = (
      comments.reduce((sum, c) => sum + c.rating, 0) /
      comments.length /
      2
    ).toFixed(1);
    document.getElementById("spot-rating-avg").textContent = avg;
    document.getElementById(
      "spot-based-on",
    ).textContent = `Based on ${comments.length} reviews`;
  } else {
    document.getElementById("spot-rating-avg").textContent = "N/A";
    document.getElementById("spot-based-on").textContent = "No reviews yet";
  }
}

function applyFilters() {
  const sortValue = document.getElementById("sort-select").value;
  const filterValue = document.getElementById("filter-select").value;
  let filtered = [...allComments];
  if (filterValue !== "all") {
    const starValue = parseInt(filterValue) * 2;
    filtered = filtered.filter((c) => c.rating === starValue);
  }
  if (sortValue === "highest") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortValue === "lowest") {
    filtered.sort((a, b) => a.rating - b.rating);
  } else {
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  renderComments(filtered);
}

function renderComments(comments) {
  const reviewList = document.getElementById("reviews-list");
  reviewList.innerHTML = "";
  comments.forEach((comment) => {
    reviewList.appendChild(createReviewCard(comment));
  });
}

function createReviewCard(comment) {
  const card = document.createElement("div");
  card.classList.add("review-card");

  const header = document.createElement("div");
  header.classList.add("review-header");

  const reviewerInfo = document.createElement("div");
  reviewerInfo.classList.add("reviewer-info");

  const avatar = document.createElement("div");
  avatar.classList.add("reviewer-avatar");
  avatar.textContent = "U";

  const nameDateWrapper = document.createElement("div");
  const reviewerName = document.createElement("div");
  reviewerName.textContent = "User #" + comment.userId;
  const reviewDate = document.createElement("div");
  reviewDate.classList.add("review-date");
  reviewDate.textContent = formatDate(comment.timestamp);

  nameDateWrapper.appendChild(reviewerName);
  nameDateWrapper.appendChild(reviewDate);
  reviewerInfo.appendChild(avatar);
  reviewerInfo.appendChild(nameDateWrapper);

  const rating = document.createElement("div");
  rating.classList.add("review-rating");
  const starRating = Math.round(comment.rating / 2);
  rating.textContent = "★".repeat(starRating) + "☆".repeat(5 - starRating);

  header.appendChild(reviewerInfo);
  header.appendChild(rating);

  const reviewText = document.createElement("div");
  reviewText.classList.add("review-text");
  reviewText.textContent = comment.description;

  card.appendChild(header);
  card.appendChild(reviewText);
  return card;
}

function formatDate(timestamp) {
  const dateObj = new Date(timestamp);
  return dateObj.toLocaleString();
}

async function submitReview(e) {
  e.preventDefault();

  const token = localStorage.getItem("userToken");
  const userEmail = localStorage.getItem("userId");

  if (!token || !userEmail) {
    alert("Please log in to submit a review");
    return;
  }

  const ratingInput = document.querySelector('input[name="rating"]:checked');
  const description = document
    .getElementById("review-description")
    .value.trim();

  if (!ratingInput || !description) {
    alert("Please provide both rating and description");
    return;
  }

  const rating = parseInt(ratingInput.value) * 2;

  // First get the user ID using the email
  try {
    const userResponse = await fetch(
      `${backendBaseUrl}/users/getbyemail?email=${encodeURIComponent(
        userEmail,
      )}`,
    );
    if (!userResponse.ok) {
      throw new Error("Failed to get user information");
    }
    const userData = await userResponse.json();

    const requestData = {
      userId: userData.userId,
      postId: parseInt(spotId),
      title: "User Review",
      description: description,
      rating: rating,
    };

    const response = await fetch(`${backendBaseUrl}/comments/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error("Error submitting review");
    }

    const newComment = await response.json();
    allComments.unshift(newComment);
    renderComments(allComments);
    updateSpotStats(allComments);

    document.getElementById("review-description").value = "";
    document
      .querySelectorAll('input[name="rating"]')
      .forEach((r) => (r.checked = false));
    document.getElementById("toggle-review-form").checked = false;

    alert("Review submitted successfully!");
  } catch (error) {
    console.error("Error adding comment:", error);
    alert(error.message || "Error submitting review. Please try again.");
  }
}
