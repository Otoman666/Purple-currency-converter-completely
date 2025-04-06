let calculationCount = 0

document.getElementById('converter-form').addEventListener('submit', function (event) {
	event.preventDefault()

	const amount = parseFloat(document.getElementById('amount').value)
	const from = document.getElementById('from').value
	const to = document.getElementById('to').value

	if (from === to) {
		showResult(amount.toFixed(2), to)
		return
	}

	convertCurrency(amount, from, to)
})

function showResult(result, currency) {
	document.getElementById('result').textContent = `${result} ${currency}`
	calculationCount++
	document.getElementById('calc-count').textContent = calculationCount
}

async function convertCurrency(amount, from, to) {
	const apiKey = '999e8ce2a27aeda86c8b9b3b3185ad94'
	const apiUrl = `https://data.fixer.io/api/latest?access_key=${apiKey}&symbols=${from},${to}`

	try {
		const response = await fetch(apiUrl)
		const data = await response.json()

		if (!data.success) {
			document.getElementById('result').textContent = 'Chyba z API: ' + data.error?.info
			return
		}

		const rateFrom = data.rates[from]
		const rateTo = data.rates[to]
		const result = (amount / rateFrom) * rateTo

		showResult(
			result.toLocaleString('cs-CZ', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			to
		)
	} catch (error) {
		console.error(error)
		document.getElementById('result').textContent = 'Chyba při komunikaci se serverem.'
	}
}
