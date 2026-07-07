const PROXY_URL = "/api/countries";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Status pill ----------

function setStatus(state, label) {
    const pill = document.querySelector("#status-pill");
    const text = document.querySelector("#status-text");
    pill.classList.remove("state-idle", "state-loading", "state-error");
    pill.classList.add(`state-${state}`);
    text.textContent = label;
}

// ---------- Live clock ----------

function startClock() {
    const clockEl = document.querySelector("#clock");
    const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    function tick() {
        clockEl.textContent = `${formatter.format(new Date())} UTC`;
    }

    tick();
    setInterval(tick, 1000);
}

// ---------- API helpers ----------

// "path" is just the part after /countries/v5/, e.g. "region/europe" or "names.common/France"
async function cargarDatos(path, extraParams = {}) {
    const url = new URL(PROXY_URL, window.location.origin);
    url.searchParams.set("path", path);
    Object.entries(extraParams).forEach(([key, value]) => url.searchParams.set(key, value));

    let response = await fetch(url.toString());
    if (!response.ok) throw new Error("Network response was not ok");
    let json = await response.json();
    return json.data.objects; // v5 wraps results in data.objects
}

async function cargarPaises(continente) {
    try {
        setStatus("loading", "Loading");
        const datos = await cargarDatos(`region/${continente}`, { limit: 100 });
        let selectPaises = document.querySelector("#selectPais");
        selectPaises.innerHTML = "";

        let option = document.createElement("option");
        option.value = "0";
        option.text = "Select a country…";
        selectPaises.appendChild(option);

        datos.sort((a, b) => a.names.common.localeCompare(b.names.common));
        datos.forEach(pais => {
            let option = document.createElement("option");
            option.value = pais.names.common;
            option.text = pais.names.common;
            selectPaises.appendChild(option);
        });
        setStatus("idle", "Ready");
    } catch (error) {
        console.error("Error loading countries:", error);
        setStatus("error", "Route unavailable");
    }
}

function setField(id, value) {
    const el = document.querySelector(`#${id}`);
    el.innerHTML = value;
    if (!prefersReducedMotion) {
        el.classList.remove("flap-in");
        // Force reflow so the animation restarts on repeated selections
        void el.offsetWidth;
        el.classList.add("flap-in");
    }
}

async function cargarPais(paisNombre) {
    try {
        setStatus("loading", "Boarding");
        const data = await cargarDatos(`names.common/${encodeURIComponent(paisNombre)}`);
        const pais = data[0];

        setField("nombrePais", pais.names.common || "N/A");
        setField("capPais", pais.capitals ? pais.capitals.map(c => c.name).join(", ") : "N/A");
        setField("offPais", pais.names.official || "N/A");
        setField("region", pais.region || "N/A");
        setField("subRePais", pais.subregion || "N/A");
        setField("continent", pais.continents ? pais.continents.join(", ") : "N/A");
        setField("population", pais.population ? pais.population.toLocaleString() : "N/A");
        setField("areaPais", pais.area && pais.area.kilometers ? `${pais.area.kilometers.toLocaleString()} km²` : "N/A");
        setField("alt-spell", pais.names.alternates && pais.names.alternates.length ? pais.names.alternates.join(", ") : "N/A");

        const borderText = pais.borders && pais.borders.length > 0
            ? pais.borders.join(", ")
            : `${pais.names.common} has no land borders.`;
        setField("border", borderText);

        let flag = document.querySelector("#flag");
        flag.src = pais.flag && pais.flag.url_svg ? pais.flag.url_svg : "";
        flag.alt = pais.names.common ? `Flag of ${pais.names.common}` : "Country flag";

        // Currencies
        let monedasElement = document.querySelector("#moneda");
        if (pais.currencies) {
            const monedasArray = Object.values(pais.currencies);
            monedasElement.innerHTML = monedasArray.map(m => `${m.name} (${m.symbol})`).join(", ");
        } else {
            monedasElement.innerHTML = "N/A";
        }
        if (!prefersReducedMotion) {
            monedasElement.classList.remove("flap-in");
            void monedasElement.offsetWidth;
            monedasElement.classList.add("flap-in");
        }

        // Codes
        setField("domain", pais.tlds ? pais.tlds.join(", ") : "N/A");
        setField("cca2", pais.codes?.alpha_2 || "N/A");
        setField("ccn3", pais.codes?.ccn3 || "N/A");
        setField("cca3", pais.codes?.alpha_3 || "N/A");
        setField("cioc", pais.codes?.cioc || "N/A");

        // Translations
        let translationsElement = document.querySelector("#translation");
        translationsElement.innerHTML = "";
        if (pais.names.translations) {
            Object.entries(pais.names.translations).forEach(([language, translation]) => {
                let li = document.createElement("li");
                li.innerHTML = `<strong>${language.toUpperCase()}</strong><br>${translation.common} — <em>${translation.official}</em>`;
                translationsElement.appendChild(li);
            });
        } else {
            translationsElement.innerHTML = "<li>N/A</li>";
        }

        setStatus("idle", "On time");
    } catch (error) {
        console.error("Error setting country details:", error);
        setStatus("error", "Route unavailable");
        throw error;
    }
}

// ---------- DOM wiring ----------

document.addEventListener("DOMContentLoaded", () => {
    startClock();

    const results = document.querySelector("#results");
    const selectContinente = document.querySelector("#selectContinente");
    const selectPais = document.querySelector("#selectPais");
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search");
    const warningMessage = document.querySelector("#warningMessage");
    const searchStatus = document.querySelector("#search-status");

    function showResults() {
        results.classList.remove("hidden");
        requestAnimationFrame(() => results.classList.add("is-visible"));
    }

    function setSearchStatus(message, isError) {
        searchStatus.textContent = message || "";
        searchStatus.classList.toggle("is-empty", !message);
        searchStatus.style.color = isError ? "var(--alert-rust)" : "var(--depart-teal)";
    }

    selectContinente.addEventListener("change", () => {
        if (selectContinente.value !== "0") {
            cargarPaises(selectContinente.value);
        } else {
            selectPais.innerHTML = '<option value="0">Select a continent first…</option>';
        }
    });

    selectPais.addEventListener("change", async () => {
        if (selectPais.value !== "0" && selectPais.value !== "") {
            warningMessage.classList.remove("is-visible");
            await cargarPais(selectPais.value);
            showResults();
        }
    });

    async function doSearch() {
        const input = searchInput.value.trim();
        if (!input) return;

        try {
            setSearchStatus("Searching…", false);
            const data = await cargarDatos(`names.common/${encodeURIComponent(input)}`);
            await cargarPais(data[0].names.common);
            warningMessage.classList.remove("is-visible");
            setSearchStatus(`Found ${data[0].names.common}.`, false);
            showResults();
        } catch (error) {
            console.error(error);
            setSearchStatus("Destination not found — check the spelling and try again.", true);
            setStatus("error", "Not found");
        }
    }

    searchBtn.addEventListener("click", doSearch);
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") doSearch();
    });

    // Quick nav: general-btn loads/validates, the rest scroll to their section
    document.querySelectorAll(".quick-nav button").forEach(btn => {
        btn.addEventListener("click", async () => {
            const selectedCountry = selectPais.value;
            const currentSearch = searchInput.value.trim();
            const hasCountry = !results.classList.contains("hidden");

            if (!hasCountry && (selectedCountry === "0" || !selectedCountry) && !currentSearch) {
                warningMessage.classList.add("is-visible");
                return;
            }

            warningMessage.classList.remove("is-visible");

            if (!hasCountry) {
                const countryToLoad = currentSearch || selectedCountry;
                await cargarPais(countryToLoad);
                showResults();
            }

            const target = document.querySelector(`#${btn.dataset.target}`);
            if (target) {
                target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
            }
        });
    });
});