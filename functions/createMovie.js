const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri  = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'sample_mflix';
const coll = process.env.MONGODB_COLLECTION_NAME || 'movies';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

let cachedClient = null;
async function getDb() {
  if (cachedClient) return cachedClient.db(dbName);
  cachedClient = await new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).connect();
  return cachedClient.db(dbName);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    const db = await getDb();
    const data = JSON.parse(event.body);
    const movieDoc = {
      title: data.title,
      year:  parseInt(data.year, 10),
      poster: data.poster,
      genres: data.genres || [],
      plot: data.plot || '',
      cast: data.cast || [],
      directors: data.directors || [],
      imdb: { rating: parseFloat(data.rating) || 0 }
    };

    const result = await db.collection(coll).insertOne(movieDoc);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ insertedId: result.insertedId })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
