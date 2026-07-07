export default async function handler(req, res) {
  const API_KEY = process.env.RESTCOUNTRIES_API_KEY; // server-only, never exposed
  const { path } = req.query;

  try {
    const response = await fetch(`https://api.restcountries.com/countries/v5/${path}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch country data' });
  }
}