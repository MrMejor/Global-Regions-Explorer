async function cargarDatos(url) {
    let response = await fetch(url);
    let datos = await response.json();
    return datos;
}

async function cargarPaises(continente) {
    const datos = await cargarDatos(`https://restcountries.com/v3.1/region/${continente}`);
    let selectPaises = document.querySelector("#selectPais");
    selectPaises.innerHTML = "";
    let option = document.createElement("option");
    option.value = "0";
    option.text = "Selecciona un pais...";
    selectPaises.appendChild(option);
    datos.sort((a, b) => a.name.common.localeCompare(b.name.common))
    datos.forEach(pais => {
        let option = document.createElement("option");
        option.value = pais.name.common;
        option.text = pais.name.common;
        selectPaises.appendChild(option);
    })
}

// This function will display all the data
async function cargarPais(pais) {
    pais = await cargarDatos(`https://restcountries.com/v3.1/name/${pais}`);
    let h1NombrePais = document.querySelector("#nombrePais");
    h1NombrePais.innerHTML = pais[0].name.common;
    let capPais = document.querySelector("#capPais");
    capPais.innerHTML = pais[0].capital;
    let offPais = document.querySelector("#offPais");
    offPais.innerHTML = pais[0].name.official;
    let RegionPais = document.querySelector("#region");
    RegionPais.innerHTML = pais[0].region;
    let subRePais = document.querySelector("#subRePais");
    subRePais.innerHTML = pais[0].subregion;
    let continent = document.querySelector("#continent");
    continent.innerHTML = pais[0].continents;
    let population = document.querySelector("#population");
    population.innerHTML = pais[0].population;
    let areaPais = document.querySelector("#areaPais");
    areaPais.innerHTML = pais[0].area ? `${pais[0].area} km²` : "N/A";
    let altSpell = document.querySelector("#alt-spell");
    altSpell.innerHTML = pais[0].altSpellings;
    let border = document.querySelector("#border");
    border.innerHTML = pais[0].borders && pais[0].borders.length > 0
        ? pais[0].borders.join(", ")
        : `${pais[0].name.common} doesn't have any borders.`;
    let trans = document.querySelector("#translation");
    trans.innerHTML = pais[0].translations;
    let flag = document.querySelector("#flag");
    flag.src = pais[0].flags.svg;
    let arms = document.querySelector("#arms");
    arms.src = pais[0].coatOfArms.svg;

    let monedasElement = document.querySelector("#moneda"); // Correct ID selector
    monedasElement.innerHTML = ""; // Clear any existing content if needed

    let monedasArray = Object.values(pais[0].currencies); // Get array of currencies

    monedasArray.forEach((moneda) => {
        let li = document.createElement("li");
        li.innerHTML = `${moneda.name} - ${moneda.symbol}`;
        monedasElement.appendChild(li); // Append to the original element
    });
    
    let domain = document.querySelector("#domain");
    domain.innerHTML = pais[0].tld;
    let cca2 = document.querySelector("#cca2");
    cca2.innerHTML = pais[0].cca2;
    let ccn3 = document.querySelector("#ccn3");
    ccn3.innerHTML = pais[0].ccn3;
    let cca3 = document.querySelector("#cca3");
    cca3.innerHTML = pais[0].cca3;
    let cioc = document.querySelector("#cioc");
    cioc.innerHTML = pais[0].cioc;
    
    let translationsArray = Object.entries(pais[0].translations); // Get array of translations (key-value pairs)
    let translationsElement = document.querySelector("#translation");
    translationsElement.innerHTML = ""; // Clear any existing content if needed

    translationsArray.forEach(([language, translation]) => {
        let li = document.createElement("li");
        li.innerHTML = `${language} Common: ${translation.common},<br> ${language} Official - ${translation.official}`;
        translationsElement.appendChild(li); // Append to the original element
    });
}
// window.flagURL = pais[0].flags.svg; // this is for flag button

document.querySelector("#selectPais").addEventListener("change", function () {
    cargarPais(document.querySelector("#selectPais").value)
})

let selectContinente = document.querySelector("#selectContinente");
selectContinente.addEventListener("change", () => {
    cargarPaises(selectContinente.value);
    if (selectedCountry !== "0") {
        cargarPais(selectedCountry);
    }
})

// function for search bar
let searchBtn = document.getElementById("search-btn");
let search = document.getElementById("search");
async function doSearch() {
    const input = search.value.trim();
    if (input) {
        const finalURL = `https://restcountries.com/v3.1/name/${input}?fullText=true`;
        try {
            const data = await cargarDatos(finalURL);
            // Call cargarPais with the first result from the search
            cargarPais(data[0].name.common);
        } catch (error) {
            alert("Country not found. Please try again.");
            console.error(error);
        }
    }
}

searchBtn.addEventListener("click", doSearch);
search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        doSearch();
    }
});


document.addEventListener("DOMContentLoaded", () => {
    // Hide all sections initially
    // const infoSections = document.querySelectorAll("#infoDisplay");
    const infoSections = document.querySelectorAll("#infoDisplay .table");
    infoSections.forEach(section => section.style.display = "none");

    // Show only the continent and country select
    document.querySelector("#selectContinente").addEventListener("change", () => {
        // Clear the country select when continent changes
        document.querySelector("#selectPais").innerHTML = '';
        // Show the country select dropdown
        document.querySelector("#selectPais").style.display = "block";
    });

    // Event listener for the General button
    document.querySelector("#general-btn").addEventListener("click", async () => {
        const selectedCountry = document.querySelector("#selectPais").value;
        const searchInput = document.querySelector("#search").value.trim(); // Check if search input is used

        // Show a warning only if no country is selected and no search has been performed
        let warningMessage = document.querySelector("#warningMessage");
        if ((selectedCountry === "0" || !selectedCountry) && !searchInput) {
            warningMessage.style.display = "block"; // Show the warning in red
        } else {
            warningMessage.style.display = "none"; // Hide the warning

            // Determine if a search result was used or a selection was made
            const countryToLoad = searchInput ? searchInput : selectedCountry;

            // Call cargarPais with the selected or searched country if it exists
            await cargarPais(countryToLoad);

            // Show all sections after loading data
            const infoSections = document.querySelectorAll(".table");
            infoSections.forEach(section => section.style.display = "table");
        }
    });
});
