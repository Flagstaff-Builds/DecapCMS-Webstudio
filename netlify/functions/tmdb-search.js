const { builder } = require('@netlify/functions');
const fetch = require('node-fetch');

async function handler(event) {
  const query = event.queryStringParameters?.query;
  const id = event.queryStringParameters?.id;
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'TMDB_API_KEY not set' }) };
  }
  try {
    let url;
    if (id) {
      url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
    } else if (query) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing query or id' }) };
    }
    const res = await fetch(url);
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'TMDB fetch failed', message: error.message }) };
  }
}

module.exports = { handler: builder(handler) };
