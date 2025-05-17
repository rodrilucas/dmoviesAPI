export function checkApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== process.env.API_KEY) {
    res.status(401).json({ message: "Acesso não autorizado." });
  } else {
    next();
  }
}

