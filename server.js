const express = require('express')
const fetch = require('node-fetch')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())

const PORT = 3000
const API_KEY = '51c7be71b560565aec188022'
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`

app.get('/api/convert', async (req, res) => {
	const { from, to, amount } = req.query

	if (!from || !to || !amount) {
		return res.status(400).json({ error: 'Missing query parameters.' })
	}

	try {
		const url = `${BASE_URL}/pair/${from}/${to}/${amount}`
		const response = await fetch(url)
		const data = await response.json()

		if (!data || typeof data.conversion_result !== 'number') {
			return res.status(500).json({ error: 'Invalid response from API.' })
		}

		res.json({ result: data.conversion_result })

		const logEntry = {
			timestamp: new Date().toISOString(),
			from,
			to,
			amount: parseFloat(amount),
			result: data.conversion_result,
		}

		const logPath = path.join(__dirname, 'history.json')
		fs.readFile(logPath, 'utf8', (err, fileData) => {
			const history = !err && fileData ? JSON.parse(fileData) : []
			history.push(logEntry)
			fs.writeFile(logPath, JSON.stringify(history, null, 2), () => {})
		})
	} catch (error) {
		console.error('Backend error:', error)
		res.status(500).json({ error: 'Server error' })
	}
})

app.get('/api/stats', (req, res) => {
	const logPath = path.join(__dirname, 'history.json')

	fs.readFile(logPath, 'utf8', (err, data) => {
		if (err) {
			return res.status(500).json({ error: 'Chyba při čtení historie' })
		}

		let history = []
		try {
			history = JSON.parse(data)
		} catch {
			return res.status(500).json({ error: 'Neplatný formát historie' })
		}

		const totalConversions = history.length

		const targetCounts = {}
		for (const entry of history) {
			const to = entry.to
			targetCounts[to] = (targetCounts[to] || 0) + 1
		}

		let mostUsedTarget = null
		let maxCount = 0
		for (const currency in targetCounts) {
			if (targetCounts[currency] > maxCount) {
				mostUsedTarget = currency
				maxCount = targetCounts[currency]
			}
		}

		const totalInCZK = history.filter((entry) => entry.to === 'CZK').reduce((sum, entry) => sum + entry.result, 0)

		res.json({
			totalConversions,
			mostUsedTarget,
			totalInCZK: Number(totalInCZK.toFixed(2)),
		})
	})
})

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
