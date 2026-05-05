document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('countryForm');
    const input = document.getElementById('countryInput');
    const list = document.getElementById('countryList');

    // Common country name aliases
    const countryAliases = {
        "usa": "United States of America",
        "us": "United States of America",
        "united states": "United States of America",
        "uk": "United Kingdom",
        "united kingdom": "United Kingdom",
        "uae": "United Arab Emirates",
        "united arab emirates": "United Arab Emirates",
        "russia": "Russian Federation",
        "russian federation": "Russian Federation",
        "south korea": "Korea",
        "korea": "Korea",
        "north korea": "Korea, Democratic People's Republic of",
        "vietnam": "Viet Nam",
        "viet nam": "Viet Nam",
        "iran": "Iran, Islamic Republic of",
        "iran, islamic republic of": "Iran, Islamic Republic of",
        "syria": "Syrian Arab Republic",
        "syrian arab republic": "Syrian Arab Republic",
        "venezuela": "Venezuela, Bolivarian Republic of",
        "venezuela, bolivarian republic of": "Venezuela, Bolivarian Republic of",
        "bolivia": "Bolivia, Plurinational State of",
        "bolivia, plurinational state of": "Bolivia, Plurinational State of",
        "moldova": "Moldova, Republic of",
        "moldova, republic of": "Moldova, Republic of",
        "tanzania": "Tanzania, United Republic of",
        "tanzania, united republic of": "Tanzania, United Republic of",
        "palestine": "Palestine, State of",
        "palestine, state of": "Palestine, State of"
    };

    // Load visited countries from localStorage
    let visitedCountries = JSON.parse(localStorage.getItem('visitedCountries')) || [];

    // Initialize map
    var map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let geoJsonLayer;

    // Fetch world countries GeoJSON
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .then(response => response.json())
        .then(data => {
            geoJsonLayer = L.geoJSON(data, {
                style: function(feature) {
                    const countryName = feature.properties.name;
                    const isVisited = visitedCountries.some(c => c.toLowerCase() === countryName.toLowerCase());
                    return {
                        color: isVisited ? '#4CAF50' : '#cccccc',
                        weight: 1,
                        fillOpacity: isVisited ? 0.7 : 0.2
                    };
                },
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(feature.properties.name);
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

    function updateMap() {
        if (geoJsonLayer) {
            geoJsonLayer.setStyle(function(feature) {
                const countryName = feature.properties.name;
                const isVisited = visitedCountries.some(c => c.toLowerCase() === countryName.toLowerCase());
                return {
                    color: isVisited ? '#4CAF50' : '#cccccc',
                    weight: 1,
                    fillOpacity: isVisited ? '#4CAF50' : 0.2
                };
            });
        }
    }

    function displayCountries() {
        list.innerHTML = '';
        visitedCountries.forEach((country, index) => {
            const li = document.createElement('li');
            li.textContent = country;
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = function() {
                visitedCountries.splice(index, 1);
                localStorage.setItem('visitedCountries', JSON.stringify(visitedCountries));
                displayCountries();
                updateMap();
            };
            
            li.appendChild(removeBtn);
            list.appendChild(li);
        });
    }

    displayCountries();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let country = input.value.trim();
        country = country.toLowerCase();
        // Normalize to official name if alias exists
        if (countryAliases[country]) {
            country = countryAliases[country];
        }
        // Check if already exists (case-insensitive)
        const exists = visitedCountries.some(c => c.toLowerCase() === country.toLowerCase());
        if (country && !exists) {
            visitedCountries.push(country);
            localStorage.setItem('visitedCountries', JSON.stringify(visitedCountries));
            displayCountries();
            updateMap();
            input.value = '';
        } else if (exists) {
            alert('Country already added!');
        }
    });
});