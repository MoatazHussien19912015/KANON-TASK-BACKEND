const mongoose = require('mongoose');
const CountriesListSchema = mongoose.Schema({
    countriesList: {type: Array, required: true}    // a list of each country with its alpha3code
});

const model = mongoose.model('CountriesList', CountriesListSchema);

module.exports = model;