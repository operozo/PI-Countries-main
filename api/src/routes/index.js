//const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
// how to get data for api restcountries and put on a local db
// https://restcountries.eu/rest/v2/all
// push data on posgres db
// https://www.youtube.com/watch?v=7UQW0dQ8XoM
require("dotenv").config();
const { Router } = require('express');
const axios = require('axios');
//const {API_KEY} = process.env;
//const { Videogame, Genre, Platform} = require('../db');
const { getAllCountries, getCountryByName, getCountryByCode } = require('./controllers')
//const router = Router();

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
router.get('/countries', async (req, res)=>{ // get all countries

    //const {name} = req.query // get name from query
    let allCountries = await getAllCountries();// get all games from db
    // if(name){ // if there is a name query
    //     const foundGamesAPI = await getGamesByName(name) // get games from API
    //     const gamesByNameDB = await getDBinfo() // get games from DB

    //     // FILTRAME EL ARRAY DE TODOS LOS JUEGOS CON EL ID QUE ME PASARON POR PARAMETRO
    //     let foundGamesDB = gamesByNameDB.filter(el => el.name.toLowerCase().includes(name.toLowerCase()))
    //     // filter games from DB by name
    //     let allResults = foundGamesAPI.concat(foundGamesDB)
    //     // concat games from API and DB
    //     if(allResults.length){ // if there are results
    //         res.status(200).send(allResults) // send all results
    //     } else {
    //         res.status(404).json(['Sorry, Videogame not found']) // if there are no results
    //     }
    // } else {
    //     res.status(200).send(allGames) // if there is no name query
    // }
});

module.exports = router;
