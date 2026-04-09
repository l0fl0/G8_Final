const games = [
    {
        id: 1,
        name: "Call of Duty",
        description: "A fast-paced action shooter with online multiplayer and competitive gameplay.",
        genre: "Action",
        tags: ["Shooter", "Multiplayer", "Competitive"],
        averageRating: 8.7
    },
    {
        id: 2,
        name: "FIFA",
        description: "A soccer game focused on team building, online matches, and tournament play.",
        genre: "Sports",
        tags: ["Soccer", "Online", "Team Building"],
        averageRating: 7.9
    },
    {
        id: 3,
        name: "NBA 2K",
        description: "A basketball simulation game with franchise, career, and online modes.",
        genre: "Sports",
        tags: ["Basketball", "Career", "Franchise"],
        averageRating: 8.3
    }
];

const sampleReviews = {
    1: [
        { username: "Alex", rating: 9, comment: "Really fun multiplayer and smooth gameplay." },
        { username: "Jamar", rating: 8, comment: "Good game overall and easy to get into." }
    ],
    2: [
        { username: "Sammy", rating: 7, comment: "Fun with friends and good for quick matches." }
    ],
    3: [
        { username: "Louis", rating: 8, comment: "Solid graphics and realistic gameplay." }
    ]
};

const userReviewsData = [
    "Call of Duty — Rating: 9 — Great maps and fun gameplay.",
    "FIFA — Rating: 7 — Fun to play but can get frustrating online."
];

const favoriteGamesData = [
    "Call of Duty",
    "NBA 2K"
];

const topRatedThisMonth = [
    "Call of Duty — Average Rating: 8.7",
    "NBA 2K — Average Rating: 8.3",
    "FIFA — Average Rating: 7.9"
];

const similarGamesData = [
    "Because you played Call of Duty: Try Rainbow Six Siege",
    "Because you like sports games: Try Madden NFL",
    "Because you reviewed NBA 2K: Try MLB The Show"
];

const followerRecommendationsData = [
    "Alex recommends Elden Ring",
    "Jamar recommends Helldivers 2",
    "Louis recommends FC 25"
];

function getCurrentUser() {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
}

function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem("currentUser");
}

function updateNavState() {
    const user = getCurrentUser();
    const guestLinks = document.querySelectorAll(".guest-link");
    const logoutLinks = document.querySelectorAll("#logoutLink");

    guestLinks.forEach((link) => {
        link.classList.toggle("hidden", !!user);
    });

    logoutLinks.forEach((link) => {
        link.classList.toggle("hidden", !user);
        link.onclick = function (e) {
            e.preventDefault();
            clearCurrentUser();
            window.location.href = "index.html";
        };
    });
}

function getGameIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"), 10);
}

updateNavState();

const gameList = document.getElementById("gameList");
if (gameList) {
    games.forEach((game) => {
        const card = document.createElement("div");
        card.className = "game-card";
        card.innerHTML = `
            <h3><a href="game.html?id=${game.id}">${game.name}</a></h3>
            <p><strong>Genre:</strong> ${game.genre}</p>
            <p><strong>Average Rating:</strong> ${game.averageRating}</p>
            <div>${game.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join("")}</div>
        `;
        gameList.appendChild(card);
    });
}

const gameTitle = document.getElementById("gameTitle");
const gameDescription = document.getElementById("gameDescription");
const gameGenre = document.getElementById("gameGenre");
const gameTags = document.getElementById("gameTags");
const averageRating = document.getElementById("averageRating");
const reviewsList = document.getElementById("reviews");

if (gameTitle && gameDescription && reviewsList) {
    const gameId = getGameIdFromURL();
    const selectedGame = games.find((game) => game.id === gameId) || games[0];

    gameTitle.textContent = selectedGame.name;
    gameDescription.textContent = selectedGame.description;
    if (gameGenre) gameGenre.textContent = selectedGame.genre;
    if (gameTags) gameTags.textContent = selectedGame.tags.join(", ");
    if (averageRating) averageRating.textContent = `${selectedGame.averageRating}/10`;

    const reviews = sampleReviews[selectedGame.id] || [];
    reviews.forEach((review) => {
        const li = document.createElement("li");
        li.textContent = `${review.username} — Rating: ${review.rating}/10 — ${review.comment}`;
        reviewsList.appendChild(li);
    });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const message = document.getElementById("loginMessage");

        setCurrentUser({ username });
        message.textContent = `Welcome, ${username}! Redirecting...`;

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);
    });
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("signupUsername").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const signupMessage = document.getElementById("signupMessage");

        if (password !== confirmPassword) {
            signupMessage.textContent = "Passwords do not match.";
            return;
        }

        setCurrentUser({ username, email });
        signupMessage.textContent = `Account created for ${username}. Redirecting...`;

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);
    });
}

const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const rating = document.getElementById("rating").value;
        const reviewText = document.getElementById("reviewText").value;
        const reviewMessage = document.getElementById("reviewMessage");
        const currentUser = getCurrentUser();
        const username = currentUser ? currentUser.username : "You";

        const li = document.createElement("li");
        li.textContent = `${username} — Rating: ${rating}/10 — ${reviewText}`;

        const reviews = document.getElementById("reviews");
        reviews.appendChild(li);

        reviewMessage.textContent = "Review submitted successfully.";
        reviewForm.reset();
    });
}

const favoriteBtn = document.getElementById("favoriteBtn");
if (favoriteBtn) {
    favoriteBtn.addEventListener("click", () => {
        const favoriteMessage = document.getElementById("favoriteMessage");
        favoriteMessage.textContent = "Game added to favorites.";
    });
}

const followBtn = document.getElementById("followBtn");
if (followBtn) {
    followBtn.addEventListener("click", () => {
        const followMessage = document.getElementById("followMessage");
        followMessage.textContent = "You are now following this user.";
    });
}

const userReviews = document.getElementById("userReviews");
if (userReviews) {
    userReviewsData.forEach((review) => {
        const li = document.createElement("li");
        li.textContent = review;
        userReviews.appendChild(li);
    });
}

const favoriteGames = document.getElementById("favoriteGames");
if (favoriteGames) {
    favoriteGamesData.forEach((game) => {
        const li = document.createElement("li");
        li.textContent = game;
        favoriteGames.appendChild(li);
    });
}

const profileUsername = document.getElementById("profileUsername");
if (profileUsername) {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.username) {
        profileUsername.textContent = currentUser.username;
    }
}

const topRatedList = document.getElementById("topRatedList");
if (topRatedList) {
    topRatedThisMonth.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        topRatedList.appendChild(li);
    });
}

const similarGamesList = document.getElementById("similarGamesList");
if (similarGamesList) {
    similarGamesData.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        similarGamesList.appendChild(li);
    });
}

const followerRecommendationsList = document.getElementById("followerRecommendationsList");
if (followerRecommendationsList) {
    followerRecommendationsData.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        followerRecommendationsList.appendChild(li);
    });
}
