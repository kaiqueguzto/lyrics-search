const form = document.querySelector("#form");
const inputSearch = document.querySelector("#search");
const songContainer = document.querySelector(".songs-container");
const prevAndNextContainer = document.querySelector(".prev-and-next-container");
const btnSearch = document.querySelector(".btn-search");

const apiURL = 'https://api.lyrics.ovh';

const fetchSong =  async term => {
  const songInfo = await fetch(`${apiURL}/suggest/${term}`);
  
  return await songInfo.json();
}

const validateTerm = async () => {
  btnSearch.innerHTML = '<img class="arrow" src="/images/simbolo-de-seta-girando.svg"></img>'
  const searchTerm = inputSearch.value;

  if (!searchTerm) {
    songContainer.innerHTML = `<li class="warning-message">Digite um termo valido</li>`;
  }

  const song = await fetchSong(searchTerm);

  if (song.total == 0) {
    songContainer.innerHTML = `<li class="warning-message">Musica ou artista nao encontrada</li>`;
    return "error";
  }

  btnSearch.innerHTML = 'Buscar';


  return song;
}

const insertSongIntoPage = songInfo => {
  songContainer.innerHTML = '';
  songInfo.data.map(({artist, title}) => {
    songContainer.innerHTML += `
      <li class="song">
        <span class="song-artist"><strong>${artist.name}</strong> - ${title}</span>
        <button class="btn" onClick="getLyric('${artist.name}', '${title}')">Ver letra</button>
      </li>
    `
  });

  prevAndNextContainer.innerHTML = '';

  { songInfo.next ?
     prevAndNextContainer.innerHTML += `
      <button class="btn" onClick="getMoreSongs('${songInfo.next}')">
        Proximo
      </button>`
    : ""
  }

  { songInfo.prev ?
    prevAndNextContainer.innerHTML = `

     <button class="btn" onClick="getPrevSongs('${songInfo.prev}')">
       Anterior
     </button>
     <button class="btn" onClick="getMoreSongs('${songInfo.next}')">
      Proximo
     </button>
     `
     
   : ""
 }
}

const getLyric = async (artist, title) => {
  songContainer.innerHTML = `<li class="warning-message"><img class="arrow big" src="/images/recarregando-seta-branca.svg"></img></li>`;
  
  const response = await fetch(`${apiURL}/v1/${artist}/${title}`);
  const data = await response.json();
  const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>");

  prevAndNextContainer.innerHTML = '';
  songContainer.innerHTML = `
    <li class="lyrics-container">
      <h2><strong>${title}</strong> - ${artist}</h2>
      <p class="lyrics">${lyrics}</p>
    </li>
  `;

  prevAndNextContainer.innerHTML = 
    `<button class="btn" onClick="back('${artist}')">Voltar</button>`;

}

const getMoreSongs = async url => {
  const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  const song = await response.json();
  
  insertSongIntoPage(song);
}
const getPrevSongs = async url => {
  const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  const song = await response.json();
 
  insertSongIntoPage(song);
}

const back = async song => {
  songContainer.innerHTML = `<li class="warning-message"><img class="arrow big" src="/images/recarregando-seta-branca.svg"></img></li>`;

  const songInfo = await fetchSong(song);
  insertSongIntoPage(songInfo);
  
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  
  const validate = await validateTerm();

  if (validate === "error") return;

  insertSongIntoPage(validate);

});


