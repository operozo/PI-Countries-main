const axios = require('axios');
const { where } = require('sequelize');
//const {API_KEY} = process.env;

//const { Videogame, Genre, Platform} = require('../db');

//load data in postgtres db
//https://www.youtube.com/watch?v=7UQW0dQ8XoM


const getAPIinfo = async () => {
    var gets = [1,2,3,4].map (async (e) => await axios.get(`https://restcountries.com/v3/all`))
    let allGets = await Promise.all(gets)
    let apiURL = allGets.reduce( (prev,curr) => {
            return prev.concat(curr.data.results);
        },[ ]
    );

    const apiDATA = apiURL.map(el =>{
            return {
                id: el.cc3,
                name: el.name.common,
                flag: el.flags.svg,
                continente: el.continente,
                capital: el.capital,
                subregion: el.subregion,
                area: el.area,
                population: el.population, 
                }
        })
    return apiDATA
}

const getDBinfo = async () => {
    return await Country.findAll({
        include: [{
            model: Genre,
            attributes: ['name'],
            through : {
                attributes: [],
            },
            
        }, {
            model: Platform,
            attributes: ['name'],
            through : {
                attributes: [],
            }
        }]
    })
}

const getAllCountries = async () => {
    const APIinfo = await getAPIinfo();
    //const DBinfo = await getDBinfo();
    //const infoTotal = APIinfo.concat(DBinfo)
    return APIinfo
}

const getCountryByName = async (name) => {
    const apiURL = await axios.get(`https://restcountries.com/v3/name/{name}`)
    const apiDATA = await apiURL.data.results.map(el =>{
        return {
            id: el.cc3,
            name: el.name.common,
            flag: el.flags.svg,
            continente: el.continente,
            capital: el.capital,
            subregion: el.subregion,
            area: el.area,
            population: el.population, 
        }
    })
    return apiDATA

}

const getCountryById = async (code) => {
    const apiURL = await axios.get(`https://restcountries.com/v3/alpha/{code}`)
    const apiDATA = await apiURL.data.results.map(el =>{
        return {
            id: el.cc3,
            name: el.name.common,
            flag: el.flags.svg,
            continente: el.continente,
            capital: el.capital,
            subregion: el.subregion,
            area: el.area,
            population: el.population, 
        }
    })
    return apiDATA

}
// Obtener todos los tipos de géneros de videojuegos posibles
const getAllActivities = async () => {

try {  
let genres = await axios.get(`https://restcountries.com/all`)

genres.data.results.map(el => Genre.findOrCreate( {where: {name: el.name} }))

const genresDb = await Genre.findAll();
return (genresDb);
 
}
catch (error){
    console.log (error)
}
}

module.exports = { getAPIinfo,
    getDBinfo,
    getAllCountries,
    getCountryByName,
    getCountryById,
    getAllActivities
}