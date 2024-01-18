const apiKey='952052fec6744238f97afe9e672593f7';
const imgApi = "https://image.tmdb.org/t/p/w1280";
const movieSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;
const tvSearchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=`;
const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");

let page = 1;
let isSearching = false;

// Fetch JSON data from url
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        return await response.json();
    } catch (error) {
        return null;
    }
}

// Fetch and show results based on url
async function fetchAndShowResult(url, isMovie = true) {
    const data = await fetchData(url);
    if (data && data.results) {
        // Pass the isMovie flag to showResults to distinguish between movies and TV shows
        showResults(data.results, isMovie);
    }
}

// Function to fetch and open the movie's trailer
async function fetchAndOpenTrailer(id, isMovie = true) {
    const type = isMovie ? 'movie' : 'tv';
    const videosUrl = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${apiKey}`;
    try {
        const videosData = await fetchData(videosUrl);
        const trailer = videosData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
            window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
        } else {
            alert('Trailer not found.');
        }
    } catch (error) {
        console.error('Error fetching or opening the trailer:', error);
    }
}

// Create movie card html template
function createCard(item, isMovie = true) {
    const { id, poster_path, title, name, release_date, first_air_date, overview } = item;
    const imagePath = poster_path ? `${imgApi}${poster_path}` : './placeholder-image.png';
    const cardTitle = title || name;
    const truncatedTitle = cardTitle.length > 15 ? `${cardTitle.slice(0, 15)}...` : cardTitle;
    const formattedDate = release_date || first_air_date || 'No date available';

    // Adjust the onclick function to either fetch and open a movie trailer or a TV show trailer
    const onclickAction = isMovie ? `fetchAndOpenTrailer(${id}, true)` : `fetchAndOpenTrailer(${id}, false)`;

    const cardTemplate = `
        <div class="column" onclick="${onclickAction}">
            <div class="card">
                <div class="card-media">
                    <img src="${imagePath}" alt="${cardTitle}" width="100%">
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3>${truncatedTitle}</h3>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="info">
                        ${overview || 'No overview available.'}
                    </div>
                </div>
            </div>
        </div>
    `;
    return cardTemplate;
}


// Clear result element for search
function clearResults() {
    result.innerHTML = "";
}

// Show results in page
function showResults(items, isMovie = true) {
    const newContent = items.map(item => createCard(item, isMovie)).join("");
    result.innerHTML += newContent || "<p>No results found.</p>";
}

// Load more results
async function loadMoreResults() {
    if (isSearching) {
        return;
    }
    page++;
    const searchTerm = query.value;
    const url = searchTerm ? `${searchUrl}${searchTerm}&page=${page}` : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    await fetchAndShowResult(url);
}

// Detect end of page and load more results
function detectEnd() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
        loadMoreResults();
    }
}

// Handle search
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = query.value.trim().toLowerCase(); // Convert input to lowercase
    if (searchTerm) {
        isSearching = true;
        clearResults();
        // Search for movies and TV shows
        const movieUrl = `${movieSearchUrl}${searchTerm}&page=${page}`;
        const tvUrl = `${tvSearchUrl}${searchTerm}&page=${page}`;
        await fetchAndShowResult(movieUrl, true); // Search for movies
        await fetchAndShowResult(tvUrl, false); // Search for TV shows
        query.value = "";
    }
}

// Event listeners
form.addEventListener('submit', handleSearch);
window.addEventListener('scroll', detectEnd);
window.addEventListener('resize', detectEnd);

// Initialize the page
async function init() {
    clearResults();
    const url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    isSearching = false;
    await fetchAndShowResult(url);
}

init();

