const { builder } = require('@netlify/functions');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = '/var/task/content/movies';

function loadMovie(slug) {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const fileContents = fs.readFileSync(file, 'utf8');
  const { data } = matter(fileContents);
  return { slug, ...data };
}

async function handler(event) {
  try {
    const slug = event.queryStringParameters?.slug;
    if (!slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug' }) };
    }
    const movie = loadMovie(slug);
    if (!movie) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Movie not found' }) };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(movie)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load movie', message: error.message }) };
  }
}

module.exports = { handler: builder(handler) };
