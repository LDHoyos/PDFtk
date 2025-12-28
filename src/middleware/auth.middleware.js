function authenticateRequest(req, res, next) {
    const authHeader = req.headers.authorization
    const apiKey = process.env.API_SECRET_KEY

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    next()
}

module.exports = { authenticateRequest }
