import getData from "./functions/getData.js"

let base = "https://geo.api.gouv.fr/"
let regionEP = "regions"
let departementEP = "departements"
let cityEP = "communes"
let selectRegions = document.querySelector("select#region")
let selectDeps = document.querySelector("select#departement")
let form = document.querySelector("#form")
let list = document.querySelector("#city-list")
let geoButton = document.querySelector("#geo-button")
let cityInfo = document.querySelector("#city-info")
let infoSection = document.querySelector("#info-section")

async function regions() {
    let json = await getData(base + regionEP)

    let html = json
        .map(function (region) {
            return `
            <option value="${region.code}">${region.nom}</option>
        `
        })
        .join("")

    selectRegions.innerHTML += html
}

regions()

function changeHandler(e) {
    departements(e.target.value)
}

selectRegions.addEventListener("change", (e) => changeHandler(e))

async function departements(codeReg) {
    if (codeReg == "0") {
        selectDeps.innerHTML = "<option value='0'> -- Choisir -- </option>"
        return
    }

    let json = await getData(`${base}${regionEP}/${codeReg}/${departementEP}`)

    let html = "<option value='0'> -- Choisir -- </option>"

    html += json
        .map(function (dep) {
            return `
            <option value="${dep.code}">${dep.nom}</option>
        `
        })
        .join("")

    selectDeps.innerHTML = html
}

async function submitHandler(e) {
    e.preventDefault()
    let data = new FormData(e.target)
    let departement = data.get("departement")

    if (departement == "0") {
        list.innerHTML = "Rechercher par département"
        return
    }

    let json = await getData(`${base}${departementEP}/${departement}/${cityEP}`)

    json = json.sort(function (a, b) {
        return b.population >= a.population ? 1 : -1
    })

    let html = json
        .map(function (city) {
            return `
            <li>${city.nom}</li>
        `
        })
        .join("")

    list.innerHTML = html
}

form.addEventListener("submit", (e) => submitHandler(e))

// Geolocation

async function clickHandler() {
    cityInfo.innerHTML = '<iconify-icon icon="line-md:loading-alt-loop"  style="color: #1c71d8; font-size:4em;"></iconify-icon>'

    navigator.geolocation.getCurrentPosition(async (position) => {
        let { latitude: lat, longitude: lon } = position.coords

        let json = await getData(`${base}${cityEP}?lat=${lat}&lon=${lon}&fields=nom,surface,population,contour`)

        let { nom: name, population: pop, surface: sup, contour:border} = json[0]

        border = border.coordinates[0]

        // latitude and longitude are reversed for some reason
        border = border.map(coords => coords.reverse())

        cityInfo.innerHTML = `
            <p>
                Bonjour, vous vous situez à <strong>${name}</strong>
            </p>
            <p> 
                Cette commune a une population de <strong>${pop} habitants</strong>, pour une superficie de <strong>${sup} m²</strong> !
            </p>
        `

        let mapContainer = document.createElement("div")
        mapContainer.id = "map"
        infoSection.appendChild(mapContainer)

        let map = L.map("map").setView([lat, lon], 13)
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        var polygon = L.polygon(border, {color: 'red'}).addTo(map)
        map.fitBounds(polygon.getBounds())
    })
}

geoButton.addEventListener("click", clickHandler)

// 'https://geo.api.gouv.fr/communes?lat=48.5771022&lon=7.7662813&fields=code,nom,codesPostaux,surface,population,centre,contour'
