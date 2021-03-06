// Imports
const axios = require('axios').default;
const express = require('express');
const mongo = require('mongodb');
const cors = require('cors');

// Library inits
const app = express();
app.use(express.json());
app.use(cors());

// mongodb client init
async function initMongoDB() {
  const client = await mongo.connect('mongodb://localhost:27017/mensa')
    // eslint-disable-next-line no-console
    .catch((err) => { console.log(err); });
  const db = await client.db();
  return db;
}

async function addToDatabase(data) {
  const db = await initMongoDB();
  const insertresult = await db.collection('essen').insertOne(data, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log('Added one document');
  });
  return insertresult;
}

async function getFromDatabase(keyword) {
  const db = await initMongoDB();
  const getResult = await db.collection('essen').find(keyword).toArray();
  return getResult;
}

// variable inits
const uri = 'https://gist.githubusercontent.com/fg-uulm/666847dd7f11607fc2b6234c6d84d188/raw/2ca994ada633143903b10b2bf7ada3fd039cae35/mensa.json';

// download data
async function getData() {
  await axios.get(uri)
    .then((req) => {
      if (Array.isArray(req.data)) {
        // eslint-disable-next-line no-console
        console.log('###############################################################################');
        // eslint-disable-next-line no-console
        console.log('#                                                                             #');
        // eslint-disable-next-line no-console
        console.log('#   [WARNING]: Downloaded data is currently not saved in database!            #');
        // eslint-disable-next-line no-console
        console.log('#   [WARNING]: Reason: Feature WIP - saving storage until feature complete.   #');
        // eslint-disable-next-line no-console
        console.log('#                                                                             #');
        // eslint-disable-next-line no-console
        console.log('###############################################################################');
        /*
        // TODO: Database search by keywords / identifiying key before adding data (independence)
        req.data.forEach(async (essen) => {
          await addToDatabase(essen);
        });
        */
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log('[ERROR]: Error with downloading data:');
      // eslint-disable-next-line no-console
      console.log(`[ERROR]: ${err}`);
    });
}
getData();

// webserver endpoints
app.get('/mensa/:day', async (req, res) => {
  const searchResults = await getFromDatabase({ day: req.params.day });
  if (searchResults.length > 0) {
    res.send(searchResults);
  } else {
    res.status(404).send('Error: 404');
  }
});

app.post('/mensa/:day', async (req, res) => {
  // TODO: Database search by keywords / identifiying key instead
  // of comparing the complete object (independence)
  if (typeof req.body === 'object' && !Array.isArray(req.body)) {
    const searchResults = await getFromDatabase(req.body);
    if (searchResults.length === 0) {
      await addToDatabase(req.body);
      res.status(200).send();
    } else {
      res.status(409).send('Conflict: Double Entry');
    }
  } else {
    res.status(409).send('Conflict: Illegal format (only json object allowed)');
  }
});

app.post('/api/vote/', async (req, res) => {
  console.log(req.body);
  res.status(200).send();
});

app.post('/api/addData/', async (req, res) => {
  // TODO: reimplement database-force-push endpoint
  res.status(501).send();
  /*
  const searchResults = await getFromDatabase(req.body);
  console.log(req.body);
  if (searchResults.length > 0) {
    addToDatabase(req.body.toArray());
  } else {
    res.status(404).send('Error: 404');
  }
  */
});

app.get('/api/getData/', async (req, res) => {
  // TODO: reimplement complete database lookup
  // res.status(501).send();
  res.status(200).send(await getFromDatabase({}));
});

// Server starten
app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('\n[INFO]: Example app listening on port 3000!\n');
});


// eslint-disable-next-line no-console
console.log('###############################################################################');
// eslint-disable-next-line no-console
console.log('#                                                                             #');
// eslint-disable-next-line no-console
console.log('# [WARNING]: There is no independence check implemented yet!                  #');
// eslint-disable-next-line no-console
console.log('# [WARNING]: Reason: rewrite of the database storage system now with mongo.   #');
// eslint-disable-next-line no-console
console.log('#                                                                             #');
// eslint-disable-next-line no-console
console.log('###############################################################################');
