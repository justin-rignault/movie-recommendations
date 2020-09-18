/***************************************************************************
Filename: main.js
Author: Justin Rignault
Description: main javascript file linked to index.html for api project
Date: Nov 12 2018
***************************************************************************/

/* globals APIKEY */
let immediatelyInvokedFunctionExpression = (function () {
    const movieDataBaseURL = "https://api.themoviedb.org/3/"
    let imageURL = null;
    let imageSizes = [];
    let searchString = "";
    let videoMode = "";

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        addEventListeners();
        getDataFromLocalStorage();

        videoMode = "movie";

        document.querySelector("#search-input").focus();

        document.querySelector(".backButtonDiv").classList.add("hide");
    }

    function addEventListeners() {
        let searchButton = document.querySelector(".searchButtonDiv");
        searchButton.addEventListener("click", startSearch);
        document.querySelector("#search-input").addEventListener("keydown", ev => {
            if (ev.keyCode == '13') {
                if (document.querySelector("#initial-page").classList.value != "page") {
                    document.querySelector(".backButtonDiv").classList.add("hide");
                } else {
                    document.querySelector(".backButtonDiv").classList.remove("hide");
                }
                startSearch();
            }
        })
        document.querySelector(".backButtonDiv").addEventListener("click", goBack)
        document.querySelector(".preferencesDiv").addEventListener("click", showOverlay);
        document.querySelector(".cancelButton").addEventListener("click", hideOverlay);
        document.querySelector(".overlay").addEventListener("click", hideOverlay);
        document.querySelector(".saveButton").addEventListener("click", saveClick);
    }

    function getDataFromLocalStorage() {

      

        // Check if image secure base url and sizes array are saved in local storage, if not call getPosterURLAndSizes()

        // If in local storage, check if saved over 60 minutes ago, if true call getPosterURLAndSizes()

        //in local storage and < 60 minutes old, load and use from local storage
        getPosterURLAndSizes();
    }

    function getPosterURLAndSizes() {
        let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                imageURL = data.images.secure_base_url;
                imageSizes = data.images.poster_sizes;
                return data.images;
            })
            .catch(error => {
                console.log(error);
            })
    }

    function startSearch() {
        searchString = document.querySelector("#search-input").value;
        if (!searchString) {
            alert("Please input something in the search bar.");
            document.querySelector("#search-input").focus();
            return;
        } else {
            // this is a new search so you should reset any exisiting page data

            getSearchResults();
        }
        if (document.querySelector("#initial-page").classList.value != "page") {
            document.querySelector(".backButtonDiv").classList.add("hide");
        } else {
            document.querySelector(".backButtonDiv").classList.remove("hide");
        }
    }

    function getSearchResults() {

        let url = `${movieDataBaseURL}search/${videoMode}?api_key=${APIKEY}&query=${searchString}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                createPage(data);
            })
            .catch(error => alert(error));

        document.querySelector("#search-results").classList.remove("page");
        document.querySelector("#initial-page").classList.add("page");
    }

    function showOverlay(ev) {
        ev.preventDefault();
        let overlay = document.querySelector(".overlay");
        overlay.classList.remove("hide");
        overlay.classList.add("show");
        if (document.querySelector("#initial-page").classList.value != "page") {
            document.querySelector(".backButtonDiv").classList.add("hide");
        } else {
            document.querySelector(".backButtonDiv").classList.remove("hide");
        }
        showModalWindow(ev);
    }

    function showModalWindow(ev) {
        ev.preventDefault();
        let modal = document.querySelector(".modal");
        modal.classList.remove("off");
        modal.classList.add("on");
    }

    function hideOverlay(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let overlay = document.querySelector(".overlay");
        overlay.classList.remove("show");
        overlay.classList.add("hide");
        hideModalWindow(ev);
    }

    function hideModalWindow(ev) {
        ev.preventDefault();
        let modal = document.querySelector(".modal");
        modal.classList.remove("on");
        modal.classList.add("off");
    }

    function saveClick(ev) {

        let videoList = document.getElementsByName("video");
        let videoType = null;
        let title = document.querySelector("#modeRecommendations");
        for (let i = 0; i < videoList.length; i++) {
            if (videoList[i].checked) {
                videoType = videoList[i].value;
                break;
            }
        }
        if (videoType == "tv") {
            title.textContent = "TV Series Recommendations";
            videoMode = "tv";
        } else if (videoType == "movie") {
            title.textContent = "Movie Recommendations";
            videoMode = "movie";
        }
        document.querySelector("#initial-page>.title").appendChild(title);
        hideOverlay(ev);
    }

    function goBack() {
        let initialPage = document.querySelector("#initial-page");
        let searchResults = document.querySelector("#search-results");
        let recommendResults = document.querySelector("#recommend-results");

        if (searchResults.className != "page") {
            searchResults.classList.add("page");
            initialPage.classList.remove("page");
        } else if (recommendResults.className != "page") {
            recommendResults.classList.add("page");
            searchResults.classList.remove("page");
        }
        if (document.querySelector("#initial-page").classList.value != "page") {
            console.log("worked");
            document.querySelector(".backButtonDiv").classList.add("hide");
        } else {
            document.querySelector(".backButtonDiv").classList.remove("hide");
        }
    }

    function createPage(data) {
        let content = document.querySelector("#search-results>.content");
        let contentTitle = document.querySelector("#search-results>.title");

        let message = document.createElement("h3");
        let message2 = document.createElement("h5");
        content.innerHTML = "";
        contentTitle.innerHTML = "";

        if (data.total_results == 0) {
            message.textContent = `No results found for "${searchString}"`;
        } else {
            message.textContent = `Showing results 1-${data.results.length} of ${data.total_results} for "${searchString}"`;
            message2.textContent = `Click a movie to get recommendations based on that movie`;

        }
        contentTitle.appendChild(message);
        contentTitle.appendChild(message2);

        let documentFragment = new DocumentFragment();

        documentFragment.appendChild(createMovieCards(data.results));

        content.appendChild(documentFragment);

        let searchResultsCardList = document.querySelectorAll("#search-results>.content>div");
        searchResultsCardList.forEach(card => {
            card.addEventListener("click", getRecommendations);
        })
    }

    function createMovieCards(results) {

        let documentFragment = new DocumentFragment();
        results.forEach(movie => {
            let movieCard = document.createElement("div");
            let section = document.createElement("section");
            let image = document.createElement("img");
            let videoTitle = document.createElement("h3");
            let videoDate = document.createElement("p");
            let videoRating = document.createElement("p");
            let videoOverview = document.createElement("p");
            if (videoMode == "movie") {
                videoTitle.textContent = `${movie.title}`;
                videoDate.textContent = `Release date: ${movie.release_date}`;
                videoRating.textContent = `Rating: ${movie.vote_average}`;
                videoOverview.textContent = `Quick summary: ${movie.overview}`;
                movieCard.setAttribute("data-title", movie.title);
            } else if (videoMode == "tv") {
                videoTitle.textContent = `${movie.name}`;
                videoDate.textContent = `First aired: ${movie.first_air_date}`
                videoRating.textContent = `Rating: ${movie.vote_average}`;
                videoOverview.textContent = `Quick summary: ${movie.overview}`;
                movieCard.setAttribute("data-title", movie.name);
            }
            if (movie.poster_path) {
                image.src = `${imageURL}${imageSizes[2]}${movie.poster_path}`;
            } else {
                image.src = "img/imageNotFound.png";
            }
            movieCard.setAttribute("data-id", movie.id);

            movieCard.className = "movieCard";
            section.className = "imageSection";

            section.appendChild(image);
            movieCard.appendChild(section);
            movieCard.appendChild(videoTitle);
            movieCard.appendChild(videoDate);
            movieCard.appendChild(videoRating);
            movieCard.appendChild(videoOverview);

            documentFragment.appendChild(movieCard);
        });

        return documentFragment;
    }

    function getRecommendations() {
        let movieTitle = this.getAttribute("data-title");
        searchString = movieTitle;
        let movieID = this.getAttribute("data-id")

        document.querySelector("#search-results").classList.add("page");
        document.querySelector("#recommend-results").classList.remove("page");

        let recommendTitle = document.querySelector("#recommend-results>.title")
        let recommendContent = document.querySelector("#recommend-results>.content")

        recommendTitle.innerHTML = "";
        recommendContent.innerHTML = "";

        let documentFragment = new DocumentFragment();

        recommendContent.appendChild(documentFragment);

        let url = `${movieDataBaseURL}${videoMode}/${movieID}/recommendations?api_key=${APIKEY}`
        fetch(url)
            .then(response => response.json())
            .then(data => {
                createRecommendationsPage(data);
            })
            .catch(error => alert(error));
    }

    function createRecommendationsPage(data) {

        let content = document.querySelector("#recommend-results>.content");
        let contentTitle = document.querySelector("#recommend-results>.title");
        let message = document.createElement("h3");

        content.innerHTML = "";
        contentTitle.innerHTML = "";

        if (data.total_results == 0) {
            message.textContent = `No recommendations found for "${searchString}"`;
        } else {
            message.textContent = `Recommendations based on "${searchString}". Showing results 1-${data.results.length} of ${data.total_results}`;
        }
        contentTitle.appendChild(message);

        let documentFragment = new DocumentFragment();

        documentFragment.appendChild(createMovieCards(data.results));

        content.appendChild(documentFragment);

        let recommendResultsCardList = document.querySelectorAll("#recommend-results>.content>div");
        recommendResultsCardList.forEach(card => {
            card.addEventListener("click", getRecommendations);
        })
    }
})();
