// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from "express";

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from "liquidjs";

// Doe een fetch naar de data die je nodig hebt
// const apiResponse = await fetch('...')

// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
// const apiResponseJSON = await apiResponse.json()

// Controleer eventueel de data in je console
// (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
// console.log(apiResponseJSON)

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express();

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({extended: true}))


// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static("public"));

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine("liquid", engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set("views", "./views");

// ophalen van stories, playlist data
const storyResponse = await fetch(
  `https://fdnd-agency.directus.app/items/tm_story?fields=*.*`
);
const storyResponseJSON = await storyResponse.json();

// const audioResponse = await fetch(
//   `https://fdnd-agency.directus.app/items/tm_audio`
// );
// const audioResponseJSON = await audioResponse.json();

// const buddyResponse = await fetch(
//   `https://fdnd-agency.directus.app/items/tm_buddy`
// );
// const buddyResponseJSON = await buddyResponse.json();

const playlistResponse = await fetch(
  "https://fdnd-agency.directus.app/items/tm_playlist"
);
const playlistResponseJSON = await playlistResponse.json();

// inladen van de index pagina met de story en audio data
app.get("/", async function (request, response) {

  response.render("index.liquid", {
    story: storyResponseJSON.data,
    // audio: audioResponseJSON.data,
  });
});

// story detail pagina op basis van ID
app.get("/story/:id", async function (request, response) {
  // Render index.liquid uit de Views map
  // Geef hier eventueel data aan mee
  const storydetailResponse = await fetch(`https://fdnd-agency.directus.app/items/tm_story/` + request.params.id);
  const storydetailResponseJSON = await storydetailResponse.json();

  // inladen van de detail data
  response.render("storydetail.liquid", {
    storydetail: storydetailResponseJSON.data,
  });
});

// POST voor het aanmaken van een playlist
app.post('/playlist', async function (request, response) {
  // console.log(request.body)
  // eerst fetch ik naar de juiste informatie
  const results = await fetch('https://fdnd-agency.directus.app/items/tm_playlist',{
    method: 'POST',
    body: JSON.stringify({
      title: request.body.title,
      description: request.body.description,
    }),
    headers: {
      'Content-type':'application/json;charset=UTF-8'
    }
  });
  console.log(results)
  response.redirect(303, '/playlist/?succes=De playlist is toegevoegd')
})

// playlist pagina data inladen
app.get("/playlist", async function (request, response) {
  // Render index.liquid uit de Views map
  // Geef hier eventueel data aan mee
  const playlistResponse = await fetch(
    "https://fdnd-agency.directus.app/items/tm_playlist"
  );
  const playlistResponseJSON = await playlistResponse.json();
  
  response.render("playlist.liquid", {
    playlist: playlistResponseJSON.data,
  });
});


app.use((req, res, next) => {
  res.status(404).render("error.liquid");
});
// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set("port", process.env.PORT || 8000);

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get("port")}`);
});