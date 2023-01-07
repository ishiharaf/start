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

const getWeather = async (latitude, longitude, timezone) => {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=${timezone}`
	return fetchData(url)
}

const getPosition = () => {
	if (!navigator.geolocation) {
		return {coords: {latitude: 35.70, longitude: 139.69}}
	} else {
		return new Promise((res, rej) => {
			navigator.geolocation.getCurrentPosition(res, rej)
		})
	}
}

const updateWeather = async () => {
	const position = await getPosition()
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	const data = await getWeather(position.coords.latitude, position.coords.longitude, timezone)
	// const data = await getWeather(35.70, 139.69, timezone)
	console.log(data)

	document.querySelector("#weather-forecast").innerHTML = `
		<section id="current-forecast">
			<header>
				<h3>${weatherCode[data.current_weather.weathercode]}</h3>
				<img src="assets/img/${weatherIcon[data.current_weather.weathercode]}.svg" alt="Weather Icon">
				<h2>${data.current_weather.temperature}°</h2>
			</header>
			<h3>${data.daily.temperature_2m_max[0]}°</h3>
			<p>${data.daily.temperature_2m_min[0]}°</p>
		</section>
	`
	for (let i = 1; i < 7; i++) {
		document.querySelector("#weather-forecast").innerHTML += `
			<section>
				<header>
					<h3>${data.daily.time[i].replaceAll("-", "/")}</h3>
					<img src="assets/img/${weatherIcon[data.daily.weathercode[i]]}.svg" alt="Weather Icon">
				</header>
				<h3>${data.daily.temperature_2m_max[i]}°</h3>
				<p>${data.daily.temperature_2m_min[i]}°</p>
			</section>
		`
	}
	// ${data.latitude}, ${data.longitude}
	// data.current_weather.time.substring(0, 10).replaceAll("-", "/")}
}

window.addEventListener("load", () => {
	updateWeather()
	updateCurrency("usd", "jpy")
	updateCurrency("usd", "brl")
	updateCurrency("usd", "eur")
	updateCurrency("usd", "gbp")
	updateCurrency("usd", "cny")
})