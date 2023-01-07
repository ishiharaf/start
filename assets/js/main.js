const fetchData = async (url) => {
	const response = await fetch(url)
	if (response.ok) {
		return await response.json()
	} else {
		return {error: "Unable to fetch API"}
	}
}

const getCurrency = async (base, target, date = "latest") => {
	const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/currencies/${base}/${target}.json`
	return fetchData(url)
}

const getPreviousDate = (date) => {
	const currentDate = new Date(date)
	return new Date(currentDate - 864e5).toISOString().substring(0, 10)
}

const updateCurrency = async (base, target) => {
	const data = await getCurrency(base, target)
	if (!data.error) {
		document.querySelector(`#${target}-price`).innerHTML = data[target]
		const previousData = await getCurrency(base, target, getPreviousDate(data.date))

		if (previousData[target] > data[target]) {
			document.querySelector(`#${target}-change`).innerHTML = "▼"
			document.querySelector(`#${target}-change`).style.color = "#ff6341"
		}
		if (previousData[target] < data[target]) {
			document.querySelector(`#${target}-change`).innerHTML = "▲"
			document.querySelector(`#${target}-change`).style.color = "#3af277"
		}
	}
}

window.addEventListener("load", () => {
	updateCurrency("usd", "jpy")
	updateCurrency("usd", "brl")
	updateCurrency("usd", "eur")
	updateCurrency("usd", "gbp")
	updateCurrency("usd", "cny")
})