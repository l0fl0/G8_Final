// ============================================================
// GameVault — app.js
// All data is fetched dynamically from the REST API.
// No hardcoded game/review/user data.
// ============================================================

const API = 'http://localhost:3000/api';

// ============================================================
// SECTION 1 — AUTH HELPERS
// JWT token is stored in localStorage after login/signup.
// Every protected request sends it in the Authorization header.
// ============================================================

function getToken() {
    return localStorage.getItem('gv_token');
}

function setToken(token) {
    localStorage.setItem('gv_token', token);
}

function clearToken() {
    localStorage.removeItem('gv_token');
    localStorage.removeItem('gv_user');
}

function getCurrentUser() {
    const stored = localStorage.getItem('gv_user');
    return stored ? JSON.parse(stored) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('gv_user', JSON.stringify(user));
}

// Returns headers for authenticated requests.
// Include this in any fetch() call that requires a logged-in user
// (submitting a review, adding a favorite, following a user, etc.)
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// Returns headers for unauthenticated requests (GET public data)
function jsonHeaders() {
    return { 'Content-Type': 'application/json' };
}

// ============================================================
// SECTION 2 — NAV STATE
// Shows/hides Login + Sign Up links based on whether a JWT
// token exists. Call this on every page load.
// ============================================================

function updateNavState() {
    const user = getCurrentUser();
    const guestLinks    = document.querySelectorAll('.guest-link');
    const logoutLinks   = document.querySelectorAll('#logoutLink');
    const addGameLinks  = document.querySelectorAll('#addGameLink');

    // Show Login/Sign Up only when logged out
    guestLinks.forEach(link => link.classList.toggle('hidden', !!user));

    // Show Add Game + Logout only when logged in
    addGameLinks.forEach(link => link.classList.toggle('hidden', !user));

    logoutLinks.forEach(link => {
        link.classList.toggle('hidden', !user);
        link.onclick = (e) => {
            e.preventDefault();
            clearToken();
            window.location.href = 'index.html';
        };
    });
}

// Helper to pull a query param from the current URL
// Usage: getParam('id') on game.html?id=3 returns '3'
function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

// ============================================================
// SECTION 3 — GAMES PAGE (games.html)
// Fetches all games from the API and renders game cards.
// Genre filter buttons hit the same endpoint with ?genre=
// ============================================================

const gameList = document.getElementById('gameList');
if (gameList) {

    // Wire genre filter buttons to pass ?genre= to loadGames()
    // Each .filter-btn has a data-genre attribute set in games.html.
    // 'All' button calls loadGames() with no argument.
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const genre = btn.dataset.genre === 'all' ? null : btn.dataset.genre;
            loadGames(genre);
        });
    });

    // ------------------------------------------------------------
    // API: GET /api/games
    // API: GET /api/games?genre=Action   ← when genre filter active
    //
    // Response shape (array):
    // [
    //   {
    //     GameID:        1,
    //     Title:         "Elden Ring",
    //     Genre:         "Action RPG",
    //     Release_date:  "2022-02-25",
    //     Developer:     "FromSoftware",
    //     Cover_image:   "https://...",
    //     AverageRating: 8.5,    ← computed by LEFT JOIN + AVG in games.js route
    //     TotalReviews:  12
    //   },
    //   ...
    // ]
    //
    // Each game object becomes one .game-card div in #gameList.
    // Link each card to game.html?id={GameID}
    // ------------------------------------------------------------
    async function loadGames(genre = null) {
        gameList.innerHTML = '<p class="text-muted">Loading games...</p>';

        const url = genre
            ? `${API}/games?genre=${encodeURIComponent(genre)}`
            : `${API}/games`;

        try {
            const res = await fetch(url);
            const games = await res.json();

            gameList.innerHTML = '';

            if (!games.length) {
                gameList.innerHTML = '<p class="text-muted">No games found.</p>';
                return;
            }

            // For each game from the API, build and append a .game-card
            // Fields available on each game object:
            //   game.GameID, game.Title, game.Genre, game.AverageRating,
            //   game.TotalReviews, game.Cover_image, game.Developer, game.Release_date
            games.forEach(game => {
                const card = document.createElement('div');
                card.className = 'game-card';
                card.dataset.genre = game.Genre;

                card.innerHTML = `
                    <h3><a href="game.html?id=${game.GameID}">${game.Title}</a></h3>
                    <p><strong>Genre:</strong> ${game.Genre || '—'}</p>
                    <div class="rating-badge">${game.AverageRating ?? '—'} / 10</div>
                    <p class="text-muted" style="font-size:0.8rem; margin-top:6px;">
                        ${game.TotalReviews ?? 0} review${game.TotalReviews !== 1 ? 's' : ''}
                    </p>
                `;
                gameList.appendChild(card);
            });

        } catch (err) {
            gameList.innerHTML = '<p class="text-muted">Failed to load games. Is the server running?</p>';
            console.error('loadGames error:', err);
        }
    }

    loadGames(); // Initial load — no genre filter
}

// ============================================================
// SECTION 4 — GAME DETAIL PAGE (game.html)
// Reads ?id= from the URL, fetches that game's details,
// fetches its reviews, and handles review submission + favorite.
// ============================================================

const gameTitle = document.getElementById('gameTitle');
if (gameTitle) {

    const gameId = getParam('id');

    // ------------------------------------------------------------
    // API: GET /api/games/:id
    //
    // Response shape (single object):
    // {
    //   GameID:            1,
    //   Title:             "Elden Ring",
    //   Genre:             "Action RPG",
    //   Release_date:      "2022-02-25",
    //   Developer:         "FromSoftware",
    //   Publisher:         "Bandai Namco",
    //   Description:       "An open-world action RPG...",
    //   Cover_image:       "https://...",
    //   Minimum_specs:     "CPU: i5-8600K...",
    //   Recommended_specs: "CPU: i7-8700K...",
    //   AverageRating:     8.5,
    //   TotalReviews:      12
    // }
    //
    // Inject into:
    //   #gameTitle (the <h1> in the page header)
    //   #gameDescription
    //   #gameGenre
    //   #averageRating
    //
    // NOTE: The DB does not have a Tags column.
    //   Either remove #gameTags from game.html or use Genre as a stand-in.
    // ------------------------------------------------------------
    async function loadGameDetail() {
        if (!gameId) {
            document.getElementById('gameDescription').textContent = 'No game ID provided.';
            return;
        }

        try {
            const res = await fetch(`${API}/games/${gameId}`);
            if (!res.ok) throw new Error('Game not found');
            const game = await res.json();

            // Inject game fields into their elements
            gameTitle.textContent = game.Title;
            document.title = `GameVault — ${game.Title}`;

            const desc = document.getElementById('gameDescription');
            if (desc) desc.textContent = game.Description || 'No description available.';

            const genreEl = document.getElementById('gameGenre');
            if (genreEl) genreEl.textContent = game.Genre || '—';

            // Tags: DB has no tags column — using Genre as placeholder
            // TODO: Add a Tags column to Game table, or remove this element
            const tagsEl = document.getElementById('gameTags');
            if (tagsEl) tagsEl.textContent = game.Genre || '—';

            const ratingEl = document.getElementById('averageRating');
            if (ratingEl) ratingEl.textContent = game.AverageRating
                ? `${game.AverageRating} / 10`
                : 'No ratings yet';

        } catch (err) {
            gameTitle.textContent = 'Game Not Found';
            console.error('loadGameDetail error:', err);
        }
    }

    // ------------------------------------------------------------
    // API: GET /api/reviews?gameId={id}
    //
    // Response shape (array):
    // [
    //   {
    //     ReviewID:   1,
    //     Rating:     9,
    //     Comment:    "Incredible open world...",
    //     Created_At: "2025-04-01T10:22:00",
    //     Username:   "alex_g",
    //     AvatarURL:  "https://...",
    //     GameTitle:  "Elden Ring"
    //   },
    //   ...
    // ]
    //
    // Render each review as an <li> in #reviews.
    //
    // NOTE: The reviews route currently does not return UserID.
    //   Ask Jamar to add u.UserID to the SELECT in reviews.js so
    //   each username can link to profile.html?id={UserID}
    // ------------------------------------------------------------
    async function loadReviews() {
        const reviewsList = document.getElementById('reviews');
        if (!reviewsList) return;

        try {
            const res = await fetch(`${API}/reviews?gameId=${gameId}`);
            const reviews = await res.json();

            reviewsList.innerHTML = '';

            if (!reviews.length) {
                const noReviews = document.getElementById('noReviews');
                if (noReviews) noReviews.style.display = '';
                return;
            }

            // Render each review — Username, Rating, Comment
            // TODO: Wrap Username in <a href="profile.html?id={UserID}">
            //       once Jamar adds UserID to the reviews route response
            reviews.forEach(review => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${review.Username}</strong>
                    &nbsp;·&nbsp;
                    <span style="color: var(--gold);">★ ${review.Rating}/10</span>
                    <br>
                    <span style="color: var(--muted); font-size:0.85rem;">${review.Comment || ''}</span>
                `;
                reviewsList.appendChild(li);
            });

        } catch (err) {
            console.error('loadReviews error:', err);
        }
    }

    // ------------------------------------------------------------
    // API: POST /api/reviews
    // PROTECTED — requires JWT token in Authorization header
    //
    // Request body:
    // {
    //   userId:  <getCurrentUser().UserID>,
    //   gameId:  <from URL param, as integer>,
    //   rating:  <1–10>,
    //   comment: <string>
    // }
    //
    // Success: { message: "Review added", ReviewID: 7 }
    // 409: User already reviewed this game
    // 400: Missing fields or rating out of range
    //
    // On success: re-fetch reviews so the new one appears
    // without a page reload
    // ------------------------------------------------------------
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = getCurrentUser();
            const reviewMessage = document.getElementById('reviewMessage');

            // Redirect to login if no JWT present
            if (!user) {
                reviewMessage.textContent = 'You must be logged in to submit a review.';
                reviewMessage.style.color = 'var(--danger)';
                return;
            }

            const rating  = parseInt(document.getElementById('rating').value);
            const comment = document.getElementById('reviewText').value.trim();

            try {
                const res = await fetch(`${API}/reviews`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        userId: user.UserID,
                        gameId: parseInt(gameId),
                        rating,
                        comment
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    reviewMessage.textContent = 'Review submitted!';
                    reviewMessage.style.color = 'var(--success)';
                    reviewForm.reset();
                    loadReviews(); // Refresh list without page reload
                } else {
                    // 409 means the user already reviewed this game
                    reviewMessage.textContent = data.error || 'Failed to submit review.';
                    reviewMessage.style.color = 'var(--danger)';
                }

            } catch (err) {
                reviewMessage.textContent = 'Server error. Please try again.';
                console.error('submitReview error:', err);
            }
        });
    }

    // ------------------------------------------------------------
    // API: POST /api/favorites
    // PROTECTED — requires JWT token in Authorization header
    //
    // Request body: { userId: <int>, gameId: <int> }
    //
    // Success: { message: "Added to favorites", FavoriteID: 4 }
    // 409: Game already in favorites
    //
    // On success: change button text to "✓ Favorited" and disable it
    // so the user can't double-submit
    // ------------------------------------------------------------
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', async () => {
            const user = getCurrentUser();
            const favoriteMessage = document.getElementById('favoriteMessage');

            if (!user) {
                favoriteMessage.textContent = 'You must be logged in to favorite a game.';
                favoriteMessage.style.color = 'var(--danger)';
                return;
            }

            try {
                const res = await fetch(`${API}/favorites`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        userId: user.UserID,
                        gameId: parseInt(gameId)
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    favoriteMessage.textContent = '★ Added to favorites!';
                    favoriteMessage.style.color = 'var(--success)';
                    favoriteBtn.textContent = '✓ Favorited';
                    favoriteBtn.disabled = true;
                } else {
                    favoriteMessage.textContent = data.error || 'Could not add to favorites.';
                    favoriteMessage.style.color = 'var(--danger)';
                }

            } catch (err) {
                favoriteMessage.textContent = 'Server error. Please try again.';
                console.error('addFavorite error:', err);
            }
        });
    }

    loadGameDetail();
    loadReviews();
}

// ============================================================
// SECTION 5 — PROFILE PAGE (profile.html)
// Reads ?id= from the URL to load any user's public profile.
// If no ?id= is present, falls back to the logged-in user's ID.
// Fetches: user info, their reviews, their favorites.
// Follow/unfollow requires the logged-in user's JWT.
// ============================================================

const profileUsername = document.getElementById('profileUsername');
if (profileUsername) {

    // Determine which user's profile to display:
    //   profile.html?id=3  → loads the user with UserID=3
    //   profile.html       → loads the currently logged-in user
    const profileUserId = getParam('id') || getCurrentUser()?.UserID;

    // ------------------------------------------------------------
    // API: GET /api/users/:id   ← ROUTE DOES NOT EXIST YET
    //
    // Samuel's users.js currently only has GET /api/users (all users).
    // Ask Samuel to add GET /api/users/:id that returns a single user:
    //
    // Response shape:
    // {
    //   UserID:    3,
    //   Username:  "samuel_l",
    //   Email:     "samuel@example.com",
    //   AvatarURL: "https://...",
    //   CreatedAt: "2025-04-01T09:02:00"
    // }
    //
    // Inject Username into #profileUsername
    // TODO: Add a "Member since" element to profile.html → inject CreatedAt
    // TODO: Add an <img> avatar to the profile card → inject AvatarURL if present
    //
    // TEMPORARY workaround below: fetches all users and filters client-side.
    // Replace with GET /api/users/:id once Samuel adds that route.
    // ------------------------------------------------------------
    async function loadUserProfile() {
        if (!profileUserId) {
            profileUsername.textContent = 'Not logged in';
            return;
        }

        try {
            // TEMPORARY: fetch all users, find the one matching profileUserId
            // TODO: Replace with: fetch(`${API}/users/${profileUserId}`)
            const res = await fetch(`${API}/users`);
            const users = await res.json();
            const user = users.find(u => u.UserID === parseInt(profileUserId));

            if (!user) {
                profileUsername.textContent = 'User not found';
                return;
            }

            profileUsername.textContent = user.Username;

            // TODO: Inject user.CreatedAt into a "Member since" element
            // TODO: Inject user.AvatarURL into an <img> element if present

        } catch (err) {
            profileUsername.textContent = 'Error loading profile';
            console.error('loadUserProfile error:', err);
        }
    }

    // ------------------------------------------------------------
    // API: GET /api/reviews?userId={profileUserId}   ← FILTER DOES NOT EXIST YET
    //
    // The reviews route in reviews.js currently only filters by gameId.
    // Ask Jamar to add a userId filter:
    //
    //   if (userId) { sql += ' WHERE r.UserID = ?'; params.push(userId); }
    //
    // Once added, this fetch will return all reviews written by a user:
    // [
    //   {
    //     ReviewID:  1,
    //     Rating:    9,
    //     Comment:   "Incredible open world...",
    //     Created_At:"2025-04-01T10:22:00",
    //     Username:  "alex_g",
    //     GameTitle: "Elden Ring",
    //     GameID:    1           ← needed to link back to game.html?id={GameID}
    //   },
    //   ...
    // ]
    //
    // Render each as an <li> in #userReviews
    // GameTitle should link to game.html?id={GameID}
    //
    // NOTE: GameID also needs to be added to the SELECT in reviews.js
    //   (currently only GameTitle is returned via g.Title AS GameTitle)
    // ------------------------------------------------------------
    async function loadUserReviews() {
        const userReviews = document.getElementById('userReviews');
        if (!userReviews) return;

        // TODO: Uncomment once Jamar adds userId filter + GameID to reviews route
        // try {
        //     const res = await fetch(`${API}/reviews?userId=${profileUserId}`);
        //     const reviews = await res.json();
        //     userReviews.innerHTML = '';
        //     if (!reviews.length) {
        //         userReviews.innerHTML = '<li style="color:var(--muted);">No reviews yet.</li>';
        //         return;
        //     }
        //     reviews.forEach(review => {
        //         const li = document.createElement('li');
        //         li.innerHTML = `
        //             <a href="game.html?id=${review.GameID}" style="color:var(--accent2);">
        //                 ${review.GameTitle}
        //             </a>
        //             &nbsp;·&nbsp; ★ ${review.Rating}/10
        //             <br>
        //             <span style="color:var(--muted); font-size:0.85rem;">${review.Comment || ''}</span>
        //         `;
        //         userReviews.appendChild(li);
        //     });
        // } catch (err) {
        //     console.error('loadUserReviews error:', err);
        // }

        userReviews.innerHTML = '<li style="color:var(--muted);">Reviews pending — ask Jamar to add userId filter to reviews route.</li>';
    }

    // ------------------------------------------------------------
    // API: GET /api/favorites?userId={profileUserId}
    //
    // This route already exists in favorites.js (Alex's route).
    // Response shape (array):
    // [
    //   {
    //     FavoriteID:    1,
    //     Added_At:      "2025-04-01T10:30:00",
    //     GameID:        1,
    //     Title:         "Elden Ring",
    //     Genre:         "Action RPG",
    //     Cover_image:   "https://...",
    //     AverageRating: 8.5
    //   },
    //   ...
    // ]
    //
    // Render each as an <li> in #favoriteGames
    // Title should link to game.html?id={GameID}
    // ------------------------------------------------------------
    async function loadUserFavorites() {
        const favoriteGames = document.getElementById('favoriteGames');
        if (!favoriteGames) return;

        try {
            const res = await fetch(`${API}/favorites?userId=${profileUserId}`);
            const favorites = await res.json();

            favoriteGames.innerHTML = '';

            if (!favorites.length) {
                favoriteGames.innerHTML = '<li style="color:var(--muted);">No favorites yet.</li>';
                return;
            }

            // Render each favorite — Title links to game detail page
            // Fields available: fav.GameID, fav.Title, fav.Genre,
            //   fav.AverageRating, fav.Cover_image, fav.Added_At
            favorites.forEach(fav => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="game.html?id=${fav.GameID}" style="color:var(--accent2); font-weight:600;">
                        ${fav.Title}
                    </a>
                    &nbsp;·&nbsp;
                    <span style="color:var(--muted); font-size:0.85rem;">${fav.Genre || ''}</span>
                `;
                favoriteGames.appendChild(li);
            });

        } catch (err) {
            console.error('loadUserFavorites error:', err);
        }
    }

    // ------------------------------------------------------------
    // API: POST /api/users/follow     ← follow a user
    // API: DELETE /api/users/follow   ← unfollow a user
    // PROTECTED — requires JWT token in Authorization header
    //
    // POST body:   { followerUserId: <loggedInUser.UserID>, followedUserId: <profileUserId> }
    // DELETE body: { followerUserId: <loggedInUser.UserID>, followedUserId: <profileUserId> }
    //
    // Success POST:   { message: "Now following user" }
    // Success DELETE: { message: "Unfollowed successfully" }
    // 409: Already following this user
    // 400: Cannot follow yourself
    //
    // TODO: On page load, check if the logged-in user already follows this profile.
    //   Fetch GET /api/users/{loggedInUser.UserID}/following → check if profileUserId is in list.
    //   Set isFollowing = true and update button text to "✓ Following" if so.
    //
    // TODO: If the logged-in user is viewing their own profile
    //   (getCurrentUser()?.UserID === parseInt(profileUserId))
    //   hide the follow button entirely.
    // ------------------------------------------------------------
    const followBtn = document.getElementById('followBtn');
    if (followBtn) {
        let isFollowing = false; // TODO: Set from following-list check on page load

        // Hide follow button on own profile
        const loggedIn = getCurrentUser();
        if (loggedIn && loggedIn.UserID === parseInt(profileUserId)) {
            followBtn.style.display = 'none';
        }

        followBtn.addEventListener('click', async () => {
            const followMessage = document.getElementById('followMessage');

            if (!loggedIn) {
                followMessage.textContent = 'You must be logged in to follow users.';
                followMessage.style.color = 'var(--danger)';
                return;
            }

            const method = isFollowing ? 'DELETE' : 'POST';

            try {
                const res = await fetch(`${API}/users/follow`, {
                    method,
                    headers: authHeaders(),
                    body: JSON.stringify({
                        followerUserId: loggedIn.UserID,
                        followedUserId: parseInt(profileUserId)
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    isFollowing = !isFollowing;
                    followBtn.textContent = isFollowing ? '✓ Following' : '+ Follow User';
                    followMessage.textContent = data.message;
                    followMessage.style.color = 'var(--success)';
                } else {
                    followMessage.textContent = data.error || 'Action failed.';
                    followMessage.style.color = 'var(--danger)';
                }

            } catch (err) {
                followMessage.textContent = 'Server error. Please try again.';
                console.error('followUser error:', err);
            }
        });
    }

    loadUserProfile();
    loadUserReviews();
    loadUserFavorites();
}

// ============================================================
// SECTION 6 — RECOMMENDATIONS PAGE (recommendations.html)
// Three separate fetches:
//   1. Top-rated games (sorted by AverageRating)
//   2. Similar games by genre (based on logged-in user's activity)
//   3. Games reviewed by users the logged-in user follows
// ============================================================

const topRatedList = document.getElementById('topRatedList');
if (topRatedList) {

    // ------------------------------------------------------------
    // TOP RATED
    // API: GET /api/games  → sort client-side by AverageRating DESC, take top 5
    //
    // TODO: Ask Louis to add ?sort=rating&limit=5 to the games route
    //   so the DB does the sorting and limiting instead of the client.
    //   That way we don't fetch all games just to show 5.
    //
    // Fields used: GameID, Title, Genre, AverageRating, TotalReviews
    // Render each as an <li> in #topRatedList
    // Title links to game.html?id={GameID}
    // ------------------------------------------------------------
    async function loadTopRated() {
        try {
            const res = await fetch(`${API}/games`);
            const games = await res.json();

            // Client-side sort — replace with server-side once route supports it
            const top = games
                .filter(g => g.AverageRating)
                .sort((a, b) => b.AverageRating - a.AverageRating)
                .slice(0, 5);

            topRatedList.innerHTML = '';

            top.forEach(game => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="game.html?id=${game.GameID}" style="color:var(--accent2); font-weight:600;">
                        ${game.Title}
                    </a>
                    &nbsp;·&nbsp;
                    <span style="color:var(--gold);">★ ${game.AverageRating} / 10</span>
                    <span style="color:var(--muted); font-size:0.8rem; margin-left:8px;">
                        ${game.TotalReviews} review${game.TotalReviews !== 1 ? 's' : ''}
                    </span>
                `;
                topRatedList.appendChild(li);
            });

        } catch (err) {
            topRatedList.innerHTML = '<li style="color:var(--muted);">Failed to load top rated games.</li>';
            console.error('loadTopRated error:', err);
        }
    }

    // ------------------------------------------------------------
    // SIMILAR GAMES
    // API: GET /api/games?genre={genre}
    //
    // To show relevant similar games we need to know the logged-in
    // user's preferred genre. The cleanest way to derive it:
    //   Query the user's reviews, find the most-reviewed genre.
    //
    // TODO: Ask Louis to add a backend endpoint:
    //   GET /api/recommendations/similar?userId={id}
    //   This should run a query grouping the user's reviewed games
    //   by Genre and returning the top genre, then fetching other
    //   games in that genre that the user hasn't reviewed yet.
    //
    // Until that endpoint exists, this section shows a placeholder.
    // Fields to render: GameID, Title, Genre, AverageRating
    // ------------------------------------------------------------
    const similarGamesList = document.getElementById('similarGamesList');
    async function loadSimilarGames() {
        if (!similarGamesList) return;

        const user = getCurrentUser();

        if (!user) {
            similarGamesList.innerHTML = '<li style="color:var(--muted);">Log in to see personalized recommendations.</li>';
            return;
        }

        // TODO: Replace with dedicated recommendations endpoint
        // const res = await fetch(`${API}/recommendations/similar?userId=${user.UserID}`, { headers: authHeaders() });
        // const games = await res.json();
        // ... render games the same way as top-rated

        similarGamesList.innerHTML = '<li style="color:var(--muted);">Similar games — requires GET /api/recommendations/similar route.</li>';
    }

    // ------------------------------------------------------------
    // FOLLOWED USER RECOMMENDATIONS
    // API step 1: GET /api/users/{userId}/following
    //   → list of users the logged-in user follows
    // API step 2: GET /api/reviews?userId={followedId}
    //   → reviews from each followed user (requires Jamar's userId filter)
    //
    // Better alternative: one dedicated endpoint that runs Query 8
    // from queries.sql (the multi-join recommendation query):
    //   GET /api/recommendations/following?userId={id}
    //
    // TODO: Ask Louis to add the recommendations route, or ask Samuel
    //   to expose the following list so the client can chain the calls.
    //
    // Fields to render: Username (who recommends), GameTitle, GameID, Rating
    // Username links to profile.html?id={UserID}
    // GameTitle links to game.html?id={GameID}
    // ------------------------------------------------------------
    const followerRecommendationsList = document.getElementById('followerRecommendationsList');
    async function loadFollowingRecommendations() {
        if (!followerRecommendationsList) return;

        const user = getCurrentUser();

        if (!user) {
            followerRecommendationsList.innerHTML = '<li style="color:var(--muted);">Log in to see what people you follow are playing.</li>';
            return;
        }

        // TODO: Implement once userId filter exists on reviews route
        // Step 1: GET /api/users/{user.UserID}/following
        // Step 2: For each followed user, GET /api/reviews?userId={followedUser.UserID}
        // Step 3: Flatten, deduplicate by GameID, render

        followerRecommendationsList.innerHTML = '<li style="color:var(--muted);">Followed recommendations — requires reviews userId filter (ask Jamar).</li>';
    }

    loadTopRated();
    loadSimilarGames();
    loadFollowingRecommendations();
}

// ============================================================
// SECTION 7 — LOGIN PAGE (login.html)
// POST credentials to the auth endpoint.
// On success: store JWT + user object in localStorage, redirect.
// ============================================================

const loginForm = document.getElementById('loginForm');
if (loginForm) {

    // ------------------------------------------------------------
    // API: POST /api/auth/login   ← ROUTE DOES NOT EXIST YET
    //
    // This route needs to be created in a new file: backend/routes/auth.js
    // Register it in server.js:
    //   app.use('/api/auth', require('./routes/auth'));
    //
    // npm packages needed: bcrypt, jsonwebtoken
    //   npm install bcrypt jsonwebtoken
    //
    // Add to your .env file:
    //   JWT_SECRET=some_long_random_secret_string
    //
    // Request body:  { username: <string>, password: <string> }
    //
    // What the route should do:
    //   1. SELECT * FROM User WHERE Username = ?
    //   2. bcrypt.compare(password, user.PasswordHash)
    //   3. If match: jwt.sign({ UserID, Username }, process.env.JWT_SECRET, { expiresIn: '7d' })
    //   4. Return: { token: <jwt_string>, user: { UserID, Username, AvatarURL } }
    //
    // 401: Invalid username or password
    //
    // On success: setToken(data.token) + setCurrentUser(data.user)
    // then redirect to index.html
    // ------------------------------------------------------------
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const message  = document.getElementById('loginMessage');

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: jsonHeaders(),
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                setToken(data.token);
                setCurrentUser(data.user); // { UserID, Username, AvatarURL }

                message.textContent = `Welcome back, ${data.user.Username}! Redirecting...`;
                message.style.color = 'var(--success)';

                setTimeout(() => { window.location.href = 'index.html'; }, 800);
            } else {
                message.textContent = data.error || 'Invalid username or password.';
                message.style.color = 'var(--danger)';
            }

        } catch (err) {
            message.textContent = 'Server error. Is the backend running?';
            console.error('login error:', err);
        }
    });
}

// ============================================================
// SECTION 8 — SIGNUP PAGE (signup.html)
// POST new user data to the auth endpoint.
// On success: store JWT + user object, redirect to index.
// ============================================================

const signupForm = document.getElementById('signupForm');
if (signupForm) {

    // ------------------------------------------------------------
    // API: POST /api/auth/register   ← ROUTE DOES NOT EXIST YET
    //
    // Add a /register handler to the same auth.js file as login.
    //
    // Request body: { username: <string>, email: <string>, password: <string> }
    //
    // What the route should do:
    //   1. SELECT count WHERE Username = ? OR Email = ? → return 409 if taken
    //   2. bcrypt.hash(password, 10) → get PasswordHash
    //   3. INSERT INTO User (Username, Email, PasswordHash)
    //   4. jwt.sign({ UserID, Username }, process.env.JWT_SECRET, { expiresIn: '7d' })
    //   5. Return: { token: <jwt_string>, user: { UserID, Username, AvatarURL } }
    //
    // 409: Username or email already taken
    // 400: Missing required fields
    // ------------------------------------------------------------
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('signupUsername').value.trim();
        const email    = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirm  = document.getElementById('confirmPassword').value;
        const message  = document.getElementById('signupMessage');

        if (password !== confirm) {
            message.textContent = 'Passwords do not match.';
            message.style.color = 'var(--danger)';
            return;
        }

        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: jsonHeaders(),
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                setToken(data.token);
                setCurrentUser(data.user);

                message.textContent = `Account created! Welcome, ${data.user.Username}. Redirecting...`;
                message.style.color = 'var(--success)';

                setTimeout(() => { window.location.href = 'index.html'; }, 800);
            } else {
                message.textContent = data.error || 'Could not create account.';
                message.style.color = 'var(--danger)';
            }

        } catch (err) {
            message.textContent = 'Server error. Is the backend running?';
            console.error('signup error:', err);
        }
    });
}

// ============================================================
// Run nav state update on every page
// ============================================================
updateNavState();
