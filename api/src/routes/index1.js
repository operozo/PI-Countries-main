const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const { Sequelize, Op } = require('sequelize')
const router = Router();
const axios = require('axios');
// Traigo los modelos de db
// const { Activity } = require('')
const { Activity, Country } = require('../db')

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

// Primero vamos a llenar la DB con info de la api externa restcountries 

const infoCountries = async () => {
    // console.log('Se solicita Info a restcountries')
    const CountriesApi = await axios.get('https://restcountries.com/v3/all');
    const arrCountriesDB = await CountriesApi.data.map(c => {
        let languages = "";
        if (c.languages) { languages = Object.values(c.languages).join(", ") }
        // console.log(languages);
        
        let currency = "";
        let currency_name = "";
        let currency_symbol = "";
        if (c.currencies) {
            // currencies = Object.keys(c.currencies).join(", ");
            currency = Object.keys(c.currencies)[0];
            //console.log('moneda',currency)
            c.currencies[currency].name && (currency_name = Object.values(c.currencies[currency].name).join(""));
            c.currencies[currency].symbol && (currency_symbol = Object.values(c.currencies[currency].symbol).join(""));
        }
        //console.log('moneda',currency);

        let country = {
            id: c.cca3,
            name: c.name.common, // en ingles, c.translations.spa.common nombres en español, 
            flag: c.flags[1],
            continent: c.continents[0],
            capital: !c.capital ? '' : c.capital.join(),
            subregion: c.subregion,
            area: c.area,
            population: c.population,
            googleMaps: c.maps.googleMaps,
            languages,
            currency,
            currency_name,
            currency_symbol,
        }
        //console.log(c.cca3,c.name.common,'moneda',currency,currency_name,currency_symbol);
        return country
    });
    // console.log('Fin de info rescountries');
    // console.log('Ejemplo: ', arrCountriesDB[57]);
    return arrCountriesDB
}

// Chequeo si esta completa la DB y sino la comleto:
const dbComplete = async () => {
    //consulta a la DB
    // console.log('Inicia consulta a DB')
    let countries = await Country.findAll();
    // console.log('Fin consulta a DB')

    //si la DB esta vacia cargo los datos
    if (countries.length === 0) {
        // solicitud a restcountries
        const arrCountries = await infoCountries();
        // console.log(' en /countries InfoCountries ejemplo 1: ', arrCountries[0])

        // Creating in bulk, creo los datos en masa.
        //https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#creating-in-bulk
        // console.log(' Inicia carga de DB con bulkCreate')
        await Country.bulkCreate(arrCountries);
        // console.log('Fin carga de DB con bulkCreate')
    }
};

// --------------- GET /countries AND /contries?name="..." ---------------------
// GET / countries:
// En una primera instancia deberán traer todos los países desde restcountries y guardarlos en su propia base de datos y luego ya utilizarlos desde allí(Debe retonar sólo los datos necesarios para la ruta principal)
// Obtener un listado de los paises.
//
// GET / countries ? name = "..." :
// Obtener los países que coincidan con el nombre pasado como query parameter(No necesariamente tiene que ser una matcheo exacto)
// Si no existe ningún país mostrar un mensaje adecuado

router.get('/', (req, res) => {
    res.status(200).send('Estoy en el Backend')
})

router.get('/countries', async (req, res) => {
    //http://localhost:3001/countries/?name=Argentina
    const name = req.query;
    console.log('name', name.name);
    try {
        await dbComplete();
        // si viene un "name" por query
        console.log('viene el nombre', req.query, name.name);
        if (name.name) {
            console.log('Respuesta query con name', name);
            let result = await Country.findAll(
                {
                    where: {
                        name: {
                            [Op.iLike]: `%${name.name}%`,
                            //ver https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#operators
                        }
                    }
                }
            );
            if (!result.length) {
                return res
                    .status(200)
                    .send("No se encuentran paises para la busqueda")
            }
            return res.status(200).json(result)
        }

        //  actualizo el array con la consulta a la DB ya completa
        // console.log('Inicia consulta a DB completa')
        countries = await Country.findAll({
            include: {
                model: Activity
            }
        });
        // console.log('Fin consulta a DB completa')
        res.status(200).send(countries)

    } catch (error) {
        console.log(error);
    }
})

// ---------------------- GET /countries/id ---------------------------
// GET / countries / { idPais }:
// Obtener el detalle de un país en particular
// Debe traer solo los datos pedidos en la ruta de detalle de país
// Incluir los datos de las actividades turísticas correspondientes

router.get('/countries/id/:id', async (req, res) => {
    //http://localhost:3001/countries/id/ARG
    const idPais = req.params.id.toUpperCase();

    //const idPais = req.params.id;
    console.log('Pais :',idPais)
    // const { name, flag, continent, capital, subregion, area, population } = req.query;
    try {
        await dbComplete();
        // si viene un idPais por params
        if (idPais) {
            // console.log('Respuesta params con idPais');
            let result = await Country.findByPk(idPais, {
                include: {
                    model: Activity
                }
            });
            if (!result) {
                return res
                    .status(404)
                    .send("No country for this code")
            }
            return res.status(200).json(result)
        }
    } catch (error) {
        console.log(error)
    }
});
// ---------------------- GET /activites ---------------------------
router.get('/activities', async (req, res) => {
    try {
        let result = await Activity.findAll();
        if (!result.length) {
            return res
                .status(200)
                .send("No se encuentran actividades")
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
    }
});

// ---------------------- POST /activites ---------------------------
router.post('/activities', async (req, res) => {
    try {
        // console.log('-------POST /activities -------------- ')
        const { name, difficulty, duration, season, countries } = req.body;
        console.log("🚀 ~ file: index1.js:189 ~ router.post ~ name, difficulty, duration, season, countries", name, difficulty, duration, season, countries)
                await dbComplete();
        // console.log('Posteo activities');
        if (!name) {
            return res
                .status(400)
                .send("La actividad debe tener nombre")
        }
        let newActivity = {         // creo nuevo objetos con datos de la actividad pasada x body
            name,
            difficulty,
            duration,
            season
        }
        // https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findorcreate
        const [activity, created] = await Activity.findOrCreate({       // busco si existe, sino la creo 
            where: newActivity
        });
        // console.log(created ? 'Se creo la actividad' : 'La actividad ya existe');

        //https://sequelize.org/docs/v6/core-concepts/assocs/#foobelongstomanybar--through-baz-
        countries.forEach(async (c) => {
            const country = await Country.findOne({ where: { name: c } }); // para cada pais pasado lo busco
            if (country) { await activity.addCountry(country) };            // y le agrego la actividad pasada
        });
        let msg = `Se creo la actividad ${activity.name}.`
        return res
            .status(201)
            .send(msg)
    } catch (error) {
        console.log(error)
    }
});
router.get("/api", function (req, res) {
    var obj = {
      nombre: "prueba",
      framework: "express",
      ventaja: "serializó por nosotros",
    };
    res.json(obj);
  });

router.get("/api/:id", function (req, res) {
    res.json({ parametro: req.params.id });
  });

  module.exports = router;

/// send request to API by query

// const express = require('express')
// const app = express()

// // respond with "hello world" when a GET request is made to the homepage
// app.get('/', (req, res) => {
//   res.send('hello world')
// })
