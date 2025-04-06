let calculationCount = 0
let to = ''

document.getElementById('converter-form').addEventListener('submit', function (event) {
	event.preventDefault()

	const amount = parseFloat(document.getElementById('amount').value)
	const from = document.getElementById('from').value
	to = document.getElementById('to').value

	if (from === to) {
		showResult(amount.toFixed(2), to)
		return
	}

	convertCurrencyFromBackend(amount, from, to)
})

function showResult(result, currency) {
	document.getElementById('result').textContent = `${result} ${currency}`
	calculationCount++
	document.getElementById('calc-count').textContent = calculationCount
	loadStats()
}

async function convertCurrencyFromBackend(amount, from, to) {
	const url = `http://localhost:3000/api/convert?from=${from}&to=${to}&amount=${amount}`
	try {
		const res = await fetch(url)
		const data = await res.json()

		if (data.error) {
			document.getElementById('result').textContent = 'Chyba z backendu: ' + data.error
			return
		}

		if (!data.result || typeof data.result !== 'number') {
			document.getElementById('result').textContent = 'Neplatný výsledek z backendu.'
			return
		}

		showResult(
			data.result.toLocaleString('cs-CZ', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			to
		)
	} catch (err) {
		console.error('Chyba při spojení s backendem:', err)
		document.getElementById('result').textContent = 'Chyba při spojení s backendem.'
	}
}

async function loadStats() {
	try {
		const res = await fetch('http://localhost:3000/api/stats')
		const data = await res.json()

		if (data.error) {
			console.error('Chyba při načítání statistik:', data.error)
			return
		}

		document.getElementById('total-conversions').textContent = data.totalConversions
		document.getElementById('most-used-target').textContent = data.mostUsedTarget || '-'
		document.getElementById('total-in-czk').textContent = data.totalInCZK.toLocaleString('cs-CZ', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	} catch (err) {
		console.error('Chyba při získávání statistik:', err)
	}
}

window.addEventListener('DOMContentLoaded', loadStats)
