const express = require('express');
const app = express();
const path = require('path');
const db = require('./config/keys').mongodb;
const mongoose = require('mongoose');
const axios = require('axios');
const morgan = require('morgan');
const List = require('./models/country-model');
app.use(express.json());
app.use(express.static('public'));
const cors = require('cors');
const countries_router = require('./routes/countries');
const authentication_router = require('./routes/authentication');
const gaming_router = require('./routes/gaming');

app.use(morgan('combined'));
app.use(cors());
app.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
  });
  mongoose.connect(db.DBURL,{useNewUrlParser: true, useUnifiedTopology: true}).
  then().catch(err=>console.log(err));
  mongoose.connection.once('open', ()=> {console.log('it works fine');
  List.findOne({}).then(list => {
      if (!list) {      // checking if the list of countries with it's alpha3code stored in the database or not
                        // if it is not stored, the server make a request to store it in the database
          axios.get('https://restcountries.eu/rest/v2/all?fields=alpha3Code;name').then(result => {
              if(result.data.length){ 
                  const list = new List({countriesList: [...result.data]});
                  list.save().then(saved_list => {console.log('list of countries has been saved');
                                                    global.COUNTRIES_LIST = [...saved_list.countriesList];  // storing the list in global variable after getting it from the server
                                                }).catch(err=>console.log(err));
              }
          }).catch(err=>console.log(err.response.data));
      } else {
          global.COUNTRIES_LIST = [...list.countriesList]; // storing the list in global variable after retrieving it from the database
      }
  }).catch(err=>console.log(err));
});


app.use(express.static(path.join(__dirname, 'public',  'build')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'build', 'index.html'));
});

app.use('/countries', countries_router);
app.use('/auth', authentication_router);
app.use('/gaming', gaming_router);

app.listen(process.env.PORT || 4000, ()=>{
    console.log('server is on');
});
