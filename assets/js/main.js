const fetchData = async (url) => {
	const response = await fetch(url)
	if (response.ok) {
		return await response.json()
	} else {
		return {error: "Unable to fetch API"}
	}
}

const getCurrency = async (base, target, date = "latest") => {
	const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/currencies/${base}/${target}.min.json`
	return fetchData(url)
}

const getPreviousDate = (date, days = 1) => {
	const currentDate = new Date(date)
	return new Date(currentDate - 864e5 * days).toISOString().substring(0, 10)
}

const updateIndicator = (previous, current, target) => {
	if (previous > current) {
		document.querySelector(`#${target}-change`).classList.add("price-down")
	}
	if (previous < current) {
		document.querySelector(`#${target}-change`).classList.add("price-up")
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

const getCurrency2 = async (base, target, date = "latest") => {
	const url = `https://api.frankfurter.app/${date}?from=${base}&to=${target}`
	return fetchData(url)
}

const updateCurrency2 = async (base, target) => {
	const data = await getCurrency2(base, target)
	const weeklyData = await getCurrency2(base, target, `${getPreviousDate(data.date, 7)}..`)
	const dates = Object.keys(weeklyData.rates)
	const prices = Object.values(Object.fromEntries(dates.map(key => [key, weeklyData.rates[key][target.toUpperCase()]])))
	const points = []
	const ordered = [...prices].sort((a, b) => a - b)
	for (let i = 0; i < 7; i++) {
		const index = ordered.indexOf(prices[i])
		const width = (i * 50 - 5) < 0 ? 5 : (i * 50 - 5)
		const height = 100 - (index * 15 + 5)
		points.push(`${width},${height}`)
	}

	const yesterday = getPreviousDate(data.date)
	console.log(weeklyData, yesterday)
	document.querySelector(`#${target}-price`).innerHTML = data.rates[target.toUpperCase()].toFixed(3)
	document.querySelector(`#${target}-card`).style.backgroundImage = `url('data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" width="50" height="15" viewBox="0 0 300 100"><polyline fill="none" stroke="%230074d9" stroke-width="10" points="${points.join(" ")}"/></svg>')`
	updateIndicator(weeklyData.rates[dates[dates.length - 2]][target.toUpperCase()], data.rates[target.toUpperCase()], target)
}

window.addEventListener("load", () => {
	updateCurrency2("usd", "eur")
	updateCurrency2("usd", "gbp")
	updateCurrency2("usd", "jpy")
	updateCurrency2("usd", "brl")
	updateCurrency2("usd", "cny")
})