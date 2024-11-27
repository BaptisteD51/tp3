let base = "https://geo.api.gouv.fr/"
let regionEP = "regions"
let departementEP = "departements"
let cityEP = "communes"
let selectRegions = document.querySelector("select#region")
let selectDeps = document.querySelector("select#departement")
let form = document.querySelector("#form")
let list = document.querySelector("#city-list")


async function regions(){
    let resp = await fetch(base + regionEP)
    let json = await resp.json()

    let html = json.map(function(region){
        return `
            <option value="${region.code}">${region.nom}</option>
        `
    }).join("")

    selectRegions.innerHTML += html
}

regions()

function changeHandler(e){
    departements(e.target.value)
}

selectRegions.addEventListener("change", (e) => changeHandler(e))

async function departements(codeReg){
    if(codeReg == "0"){
        selectDeps.innerHTML = "<option value='0'> -- Choisir -- </option>"
        return
    }

    let resp = await fetch(`${base}${regionEP}/${codeReg}/${departementEP}`)
    let json = await resp.json()

    let html = "<option value='0'> -- Choisir -- </option>"

    html += json.map(function(dep){
        return `
            <option value="${dep.code}">${dep.nom}</option>
        `
    }).join("")

    selectDeps.innerHTML = html
}

async function submitHandler(e){
    e.preventDefault()
    let data = new FormData(e.target)
    let departement = data.get("departement")
    
    if( ( departement == "0" )  ){
        list.innerHTML = "Rechercher par département"
        return
    }

    let resp = await fetch(`${base}${departementEP}/${departement}/${cityEP}`)
    let json = await resp.json()

    json = json.sort(function(a,b){
        return b.population >= a.population ? 1 : -1
    })

    let html = json.map(function(city){
        return `
            <li>${city.nom}</li>
        `
    }).join('')

    list.innerHTML = html
}

form.addEventListener("submit", (e) => submitHandler(e))