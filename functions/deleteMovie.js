const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri   = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'sample_mflix';
const coll   = process.env.MONGODB_COLLECTION_NAME || 'movies';

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
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    const id = event.queryStringParameters?.id;
    if (!id) throw new Error('ID do filme é obrigatório');

    const db = await getDb();
    await db.collection(coll).deleteOne({ _id: new ObjectId(id) });

    return { statusCode: 200, headers, body: JSON.stringify({ deleted: true }) };
  } catch (err) {
    return {
      statusCode: err.message.includes('ID') ? 400 : 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
