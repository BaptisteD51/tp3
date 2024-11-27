async function getData(url){
    let resp = await fetch(url)
    let json = await resp.json()
    return json
}

export default getData