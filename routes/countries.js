const router = require('express').Router();
const axios = require('axios');



const country_model = (objects) => {
    return objects.map(obj => {
        const country = {
            name: obj.name, capital: obj.capital, region: obj.region, area: obj.area,
            currency: obj.currencies[0].name, languages: obj.languages.map(lang => lang.name), flag: obj.flag
        };

        return {
            country, neighbours: global.COUNTRIES_LIST.filter(country => {  // returning the country with it's neighbour countries
                return obj.borders.find(border => border === country.alpha3Code);   // by matching the borders alpha3code with the countries list
            }).map(country => country.name)
        };
    });

};


router.get('/get-country/:countryName', (req, res) => {
    axios.get(`https://restcountries.eu/rest/v2/name/${req.params.countryName}?fullText=true&fields=name;capital;currencies;languages;region;area;borders;flag`).then(result => {
        const country = country_model(result.data);

        return res.status(200).json({ result: [...country] });
    }).catch(err => { console.log(err); return res.status(500).json({ message: err }); });
});

router.get('/search-countries/:countryNames', (req, res) => {
    axios.get(`https://restcountries.eu/rest/v2/name/${req.params.countryNames}?fields=name;capital;currencies;languages;region;area;borders;flag`).then(result => {
        const country = country_model(result.data);

        return res.status(200).json({ countries: [...country] });
    }).catch(err => { console.log(err); return res.status(500).json({ message: err }); });
});

router.get('/get-all-countries', (req, res) => {
    axios.get('https://restcountries.eu/rest/v2/all?fields=name;flag').then(result => {


        return res.status(200).json({ countries: [...result.data] });
    }).catch(err => { console.log(err); return res.status(500).json({ message: err }); });
});


module.exports = router;
