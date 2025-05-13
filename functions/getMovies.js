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

    // paginação
    const page  = parseInt(event.queryStringParameters?.page, 10)  || 1;
    const limit = parseInt(event.queryStringParameters?.limit, 10) || 16;
    const skip  = (page - 1) * limit;

    // search livre
    const search = event.queryStringParameters?.search || '';

    // leitura bruta de filtros/ordenação
    const rawMin     = event.queryStringParameters?.yearMin;
    const rawMax     = event.queryStringParameters?.yearMax;
    const sortField  = event.queryStringParameters?.sortField  || 'year';
    const sortOrder  = event.queryStringParameters?.sortOrder === 'asc' ? 1 : -1;

    // parse e clamp (só se vier definido e válido)
    let yearMin = null;
    if (rawMin != null) {
      const ym = parseInt(rawMin, 10);
      if (!isNaN(ym)) yearMin = Math.max(1900, Math.min(2025, ym));
    }

    let yearMax = null;
    if (rawMax != null) {
      const yM = parseInt(rawMax, 10);
      if (!isNaN(yM)) yearMax = Math.max(1900, Math.min(2025, yM));
    }

    // condições de filtro
    const clauses = [];
    if (search) {
      clauses.push({
        $or: [
          { title:     { $regex: search, $options: 'i' } },
          { cast:      { $regex: search, $options: 'i' } },
          { directors: { $regex: search, $options: 'i' } },
          { genres:    { $regex: search, $options: 'i' } }
        ]
      });
    }
    if (yearMin !== null || yearMax !== null) {
      const yrFilter = {};
      if (yearMin !== null) yrFilter.$gte = yearMin;
      if (yearMax !== null) yrFilter.$lte = yearMax;
      clauses.push({ year: yrFilter });
    }
    const finalQuery = clauses.length ? { $and: clauses } : {};

    // total para paginação
    const totalCount = await db
      .collection(collectionName)
      .countDocuments(finalQuery);

    // busca com sort, skip e limit
    const movies = await db
      .collection(collectionName)
      .find(finalQuery)
      .project({ title:1, year:1, poster:1, genres:1, 'imdb.rating':1 })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ movies, totalCount })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
