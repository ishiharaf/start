function Chart() {
	this.days = 7
	this.strokeColor = "0074d9"
	this.strokeWidth = 10
	this.paddingX = 5
	this.paddingY = 5
	this.vWidth = 300
	this.vHeight = 100
	this.width = this.vWidth / (this.days - 1)
	this.height = (this.vHeight - this.paddingY * 2) / (this.days - 1)
}

const fetchData = async (url) => {
	const response = await fetch(url, {cache: "no-cache"})
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

const updateCurrency = async (base, target, chart = new Chart()) => {
	const data = await getCurrency(base, target)
	const dates = [data.date], weeklyData = {}
	for (let i = 0; i < chart.days; i++) {
		const previousData = await getCurrency(base, target, dates[i])
		weeklyData[dates[i]] = previousData[target]
		if (i < chart.days - 1) dates.push(getPreviousDate(dates[i]))
	}

	const points = []
	const prices = Object.values(weeklyData).reverse()
	const ordered = [...prices].sort((a, b) => a - b)
	for (let i = 0; i < chart.days; i++) {
		const index = ordered.indexOf(prices[i])
		const width = (i * chart.width - chart.paddingX) < 0 ? chart.paddingX : (i * chart.width - chart.paddingX)
		const height = chart.vHeight - (index * chart.height + chart.paddingY)
		points.push(`${width},${height}`)
	}

	document.querySelector(`#${target}-price`).innerHTML = data[target].toFixed(3)
	document.querySelector(`#${target}-card`).style.backgroundImage = `url('data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" width="${chart.width}" height="${chart.height}" viewBox="0 0 ${chart.vWidth} ${chart.vHeight}"><polyline fill="none" stroke="%23${chart.strokeColor}" stroke-width="${chart.strokeWidth}" points="${points.join(" ")}"/></svg>')`
	updateIndicator(weeklyData[dates[1]], data[target], target)
}

window.addEventListener("load", () => {
	updateCurrency("usd", "eur")
	updateCurrency("usd", "gbp")
	updateCurrency("usd", "jpy")
	updateCurrency("usd", "brl")
	updateCurrency("usd", "cny")
})