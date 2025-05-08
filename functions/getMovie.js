const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Connection parameters
const uri                 = process.env.MONGODB_URI;
const dbName              = process.env.MONGODB_DB_NAME || 'sample_mflix';
const moviesCollection    = process.env.MONGODB_COLLECTION_NAME  || 'movies';
const commentsCollection  = process.env.MONGODB_COMMENTS_COLLECTION || 'comments';

// Response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

exports.handler = async (event) => {
  const client = new MongoClient(uri, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    const db = client.db(dbName);

    // Validate & parse ID
    const movieId = event.queryStringParameters?.id;
    if (!movieId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Movie ID required' })
      };
    }
    const objectId = new ObjectId(movieId);

    // Fetch movie details
    const movie = await db
      .collection(moviesCollection)
      .findOne(
        { _id: objectId },
        {
          projection: {
            title:    1,
            year:     1,
            plot:     1,
            poster:   1,
            genres:   1,
            cast:     1,
            directors:1,
            'imdb.rating': 1
          }
        }
      );

    if (!movie) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Movie not found' })
      };
    }

    // Fetch related comments
    const comments = await db
      .collection(commentsCollection)
      .find({ movie_id: objectId })
      .sort({ date: -1 })
      .limit(10)
      .toArray();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ movie, comments })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await client.close();
  }
};
