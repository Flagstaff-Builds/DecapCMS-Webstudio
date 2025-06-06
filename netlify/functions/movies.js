const { builder } = require('@netlify/functions');
const { getMovies } = require('../../build-movies');

async function handler() {
  try {
    const movies = getMovies();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ movies })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load movies', message: error.message }) };
  }
}

module.exports = { handler: builder(handler) };
