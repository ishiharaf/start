const weatherCode = {
	0: "Clear",
	1: "Overcast", 2: "Overcast", 3: "Overcast",
	45: "Fog", 48: "Fog",
	51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
	56: "Freezing Drizzle", 57:	"Freezing Drizzle",
	61: "Rain", 63: "Rain", 65:	"Rain",
	66: "Freezing Rain", 67: "Freezing Rain",
	71: "Snow fall", 73: "Snow fall", 75: "Snow fall",
	77: "Snow grains",
	80: "Rain showers", 81: "Rain showers", 82: "Rain showers",
	85: "Snow showers", 86: "Snow showers",
	95: "Thunderstorm:",
	96: "Thunderstorm with Hail", 99: "Thunderstorm with Hail"
}

const weatherIcon = {
	0: "day",
	...Object.fromEntries([1, 2, 3, 45, 48].map(key => [key, "cloudy"])),
	...Object.fromEntries([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].map(key => [key, "rainy"])),
	...Object.fromEntries([56, 57, 71, 73, 75, 77, 85, 86].map(key => [key, "snowy"])),
	...Object.fromEntries([95, 96, 99].map(key => [key, "thunder"])),
}

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
		document.querySelector(`#${target}-price`).innerHTML = data[target].toFixed(3)
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