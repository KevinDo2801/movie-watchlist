const searchText = document.getElementById("search-text");
const searchBtn = document.getElementById("search-btn");
const mainEl = document.querySelector("main");
const myFilmId = JSON.parse(localStorage.getItem('watchlist')) || [];

async function fetchFilm(id) {
    const url = `https://www.omdbapi.com/?i=${id}&apikey=e57bb5f2`;
    const response = await fetch(url);
    const data = await response.json();

    return data;
}

async function fetchMultipleFilm(searchText) {
    const url = `https://www.omdbapi.com/?s=${searchText}&apikey=e57bb5f2`;
    const response = await fetch(url);
    const data = await response.json();

    if (data?.Response === "False") {
        return false;
    }

    const filmArr = await Promise.all(
        data.Search.map((film) => fetchFilm(film.imdbID))
    );

    return filmArr;
}

function generateFilmHtml(film, isAddedToWatchlist) {
    let plot = film.Plot;
    if (film.Plot.length > 140) {
        plot = film.Plot.substring(0, 140) + `<span>...Read more</span>`;
    }

    const watchlistButtonHtml = isAddedToWatchlist
        ? `<p class="watchlist-add" data-imdbID="${film.imdbID}"><i class="fa fa-minus-circle"></i> Remove</p>`
        : `<p class="watchlist-add" data-imdbID="${film.imdbID}"><i class="fa fa-plus-circle"></i> Watchlist</p>`;

    return `
    <div class="section">
      <div class="image">
        <img src="${film.Poster}" alt="">
      </div>
      <div class="information-movie">
        <div class="title">
          <h3>${film.Title}</h3>
          <i class="fa fa-star"></i>
          <span>${film.imdbRating}</span>
        </div>
        <div class="middle">
          <p>${film.Runtime}</p>
          <p>${film.Genre}</p>
          ${watchlistButtonHtml}
        </div>
        <div class="descriptive">
          ${plot}
        </div>
      </div>
    </div>
  `;
}

async function getFilmHtml(searchText) {
    const filmArr = await fetchMultipleFilm(searchText);

    if (!filmArr) {
        return "Unable to find what you’re looking for. Please try another search.";
    }

    const html = filmArr
        .map((film) => {
            const isAddedToWatchlist = myFilmId.includes(film.imdbID);
            return generateFilmHtml(film, isAddedToWatchlist);
        })
        .join('');

    return html;
}

async function renderFilm() {
    mainEl.innerHTML = "";
    if (searchText.value.trim().length > 0) {
        mainEl.classList.remove("default");
        mainEl.innerHTML = await getFilmHtml(searchText.value.trim());
        if (mainEl.innerHTML === "Unable to find what you’re looking for. Please try another search.") {
            mainEl.classList.add("default");
        }
    } else {
        mainEl.classList.add("default");
        mainEl.innerHTML = `
      <i class="fa fa-film"></i>
      <h1>Start exploring</h1>
    `;
    }
}

function handleAddFilm() {
    if (this.innerHTML.includes("Remove")) {
        this.innerHTML = `<i class="fa fa-plus-circle"></i> Watchlist`;
        const index = myFilmId.indexOf(this.getAttribute('data-imdbid'));
        if (index !== -1) {
            myFilmId.splice(index, 1);
        }
    } else {
        this.innerHTML = `<i class="fa fa-minus-circle"></i> Remove`;
        myFilmId.push(this.getAttribute('data-imdbid'));
    }

    localStorage.setItem("watchlist", JSON.stringify(myFilmId));
}

mainEl.addEventListener("click", function (event) {
    if (event.target.classList.contains("watchlist-add")) {
        handleAddFilm.call(event.target);
    }
});

searchBtn.addEventListener("click", renderFilm);

searchText.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchBtn.click();
    }
});
