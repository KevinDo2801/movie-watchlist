const mainEl = document.querySelector("main");
const myFilmId = JSON.parse(localStorage.getItem('watchlist')) || [];

async function fetchFilm(id) {
    const url = `https://www.omdbapi.com/?i=${id}&apikey=e57bb5f2`;
    const response = await fetch(url);
    const data = await response.json();

    return data;
}

async function fetchMultipleFilm() {
    const filmPromises = myFilmId.map((id) => fetchFilm(id));
    const filmArr = await Promise.all(filmPromises);

    return filmArr;
}

function createFilmHtml(film) {
    let plot = film.Plot;
    if (film.Plot.length > 140) {
        plot = film.Plot.substring(0, 140) + `<span>...Read more</span>`;
    }

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
          <p class="watchlist-add" data-imdbID="${film.imdbID}"><i class="fa fa-minus-circle"></i> Remove</p>
        </div>
        <div class="descriptive">
          ${plot}
        </div>
      </div>
    </div>
  `;
}

async function getFilmHtml() {
    const filmArr = await fetchMultipleFilm();

    let html = "";
    filmArr.forEach((film) => {
        html += createFilmHtml(film);
    });

    return html;
}

async function renderFilm() {
    mainEl.innerHTML = await getFilmHtml();

    if (myFilmId.length === 0) {
        mainEl.classList.add('default', 'my-watch-list');
        mainEl.innerHTML = `
      <p>Your watchlist is looking a little empty...</p>
      <a href="./index.html">
          <p><i class="fa fa-plus-circle"></i> Let’s add some movies!</p>
      </a>
    `;
    } else {
        mainEl.classList.remove('default', 'my-watch-list');
        const watchlistAddElements = document.querySelectorAll(".watchlist-add");
        watchlistAddElements.forEach((element) => {
            element.addEventListener("click", handleRemoveFilm);
        });
    }
}

function handleRemoveFilm() {
    const index = myFilmId.indexOf(this.getAttribute('data-imdbid'))
    if (index !== -1) {
        myFilmId.splice(index, 1);
    }

    localStorage.setItem("watchlist", JSON.stringify(myFilmId));
    renderFilm();
}

renderFilm();
