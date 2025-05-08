// functions/getMovies.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri            = process.env.MONGODB_URI;
const dbName         = process.env.MONGODB_DB_NAME      || 'sample_mflix';
const collectionName = process.env.MONGODB_COLLECTION_NAME || 'movies';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60'
};

// Cache de conexão para acelerar cold-start
let cachedClient = null;
let cachedDb     = null;
async function getDb() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

exports.handler = async (event) => {
  try {
    const db = await getDb();

    // Leitura de paginação
    const page  = parseInt(event.queryStringParameters?.page)  || 1;
    const limit = parseInt(event.queryStringParameters?.limit) || 16;
    const skip  = (page - 1) * limit;

    // Leitura de busca (se houver)
    const search = event.queryStringParameters?.search || '';
    let query = {};
    if (search) {
      query = {
        $or: [
          { title:     { $regex: search, $options: 'i' } },
          { cast:      { $regex: search, $options: 'i' } },
          { directors: { $regex: search, $options: 'i' } },
          { genres:    { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Conta total para paginação
    const totalCount = await db.collection(collectionName)
                               .countDocuments(query);

    // Busca atual com skip & limit
    const movies = await db.collection(collectionName)
      .find(query)
      .skip(skip)
      .limit(limit)
      .project({ title:1, year:1, poster:1, genres:1, 'imdb.rating':1 })
      .sort({ year:-1 })
      .toArray();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ movies, totalCount })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
