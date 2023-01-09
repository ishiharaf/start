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

const updateIndicator = (previous, current, target) => {
	if (previous > current) {
		document.querySelector(`#${target}-change`).innerHTML = "▼"
		document.querySelector(`#${target}-change`).style.color = "#ff6341"
	}
	if (previous < current) {
		document.querySelector(`#${target}-change`).innerHTML = "▲"
		document.querySelector(`#${target}-change`).style.color = "#3af277"
	}
}

const updateCurrency = async (base, target) => {
	const data = await getCurrency(base, target)
	const dates = [data.date]
	const weeklyData = {}
	for (let i = 0; i < 7; i++) {
		const previousData = await getCurrency(base, target, dates[i])
		weeklyData[dates[i]] = previousData[target]
		dates.push(getPreviousDate(dates[i]))
	}

	const points = []
	const prices = Object.values(weeklyData).reverse()
	const ordered = [...prices].sort((a, b) => a - b)
	for (let i = 0; i < 7; i++) {
		const index = ordered.indexOf(prices[i])
		const width = (i * 50 - 5) < 0 ? 5 : (i * 50 - 5)
		const height = 100 - (index * 15 + 5)
		points.push(`${width},${height}`)
	}

	document.querySelector(`#${target}-price`).innerHTML = data[target].toFixed(3)
	document.querySelector(`#${target}-card`).style.backgroundImage = `url('data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" width="50" height="15" viewBox="0 0 300 100"><polyline fill="none" stroke="%230074d9" stroke-width="10" points="${points.join(" ")}"/></svg>')`
	updateIndicator(weeklyData[dates[1]], data[target], target)
}

window.addEventListener("load", () => {
	updateCurrency("usd", "eur")
	updateCurrency("usd", "gbp")
	updateCurrency("usd", "jpy")
	updateCurrency("usd", "brl")
	updateCurrency("usd", "cny")
})