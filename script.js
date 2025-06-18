var dataUrl = 'https://raw.githubusercontent.com/abisz/heinzelmap/refs/heads/main/data.json';

function initMap(mapId, zoomLevel) {
    console.log("Initializing map with ID:", mapId);
    var mapContainer = document.getElementById(mapId);
    if (!mapContainer) {
        console.log("Map container with ID '" + mapId + "' not found.");
        return;
    }

    var map = L.map(mapId, {
        scrollWheelZoom: false,
    }).setView([52.510885, 13.398937], zoomLevel);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    fetch(dataUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            data['data'].forEach(function(district) {
                if (district.geometry) {
                    L.geoJSON(district.geometry, {
                        style: function(feature) {
                            return {
                                color: district.color,
                                weight: 0,
                                fillColor: district.color,
                                fillOpacity: 0.2
                            };
                        },
                        onEachFeature: function(feature, layer) {
                            layer.bindTooltip(
                                `${district.name}: ${district.objects} Standorte`,
                                {
                                    className: 'custom-tooltip',
                                    sticky: true,
                                    direction: 'top',
                                    offset: [0, -10]
                                }
                            );
                        }
                    }).addTo(map);
                } else {
                    fetch(district.url).then(function(response) {
                        return response.json();
                    })
                        .then(function(json) {
                            var geojsonFeature = json.geometry;
                            L.geoJSON(geojsonFeature, {
                                style: function(feature) {
                                    return {
                                        color: district.color,
                                        weight: 0,
                                        fillColor: district.color,
                                        fillOpacity: 0.2
                                    };
                                },
                                onEachFeature: function(feature, layer) {
                                    layer.bindTooltip(
                                        `${district.name}: ${district.objects} Standorte`,
                                        {
                                            className: 'custom-tooltip',
                                            sticky: true,
                                            direction: 'top',
                                            offset: [0, -10]
                                        });
                                }
                            }).addTo(map);
                        });
                }
            });
        })
        .catch(function(error) {
            console.error("Error loading data:", error);
        });


};

initMap("map", 11);
initMap("map-small", 10);

// Counter animation when section is in view
function animateCounter(el, target, duration = 2000) {
    let start = 0;
    let startTime = null;
    function updateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        // Ease-out animation (slower towards the end)
        const linearProgress = Math.min((timestamp - startTime) / duration, 1);
        const progress = 1 - Math.pow(1 - linearProgress, 2);
        el.textContent = Math.floor(progress * (target - start) + start);
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            el.textContent = target + (target >= 20 ? '+' : '');
        }
    }
    requestAnimationFrame(updateCounter);
}

let hasAnimated = false;
function handleScroll() {
    const section = document.getElementById('metrics');
    const rect = section.getBoundingClientRect();
    if (!hasAnimated && rect.top < window.innerHeight - 100) {
        hasAnimated = true;
        document.querySelectorAll('.count').forEach(el => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            animateCounter(el, target);
        });
        window.removeEventListener('scroll', handleScroll);
    }
}
window.addEventListener('scroll', handleScroll);
// In case already in view
handleScroll();
