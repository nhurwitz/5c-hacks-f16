const MIN_ZOOM = 4;
const INITIAL_ZOOM = 4;
const MAX_ZOOM = 8;
const $countryName = $('.country-name');
const map = L.map('map', {
  center: [37.8, -96],
  zoom: INITIAL_ZOOM,
  maxZoom: MAX_ZOOM,
  id: 'mapbox.satellite'
});
const colorScale = chroma
        .scale(['#D5E3FF', '#003171'])
        .domain([0,1]);
const info = L.control();

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYW50b255YmVsbG8iLCJhIjoiY2l2ZXUzanN6MDEwZDJubG13MTlmZjF4MyJ9.7h5pZPUAsDKiz5Um8IF15A', {
  id: 'mapbox.streets',
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM
}).addTo(map);

L.TopoJSON = L.GeoJSON.extend({
  addData: function(jsonData) {
    if (jsonData.type === "Topology") {
      for (key in jsonData.objects) {
        const geojson = topojson.feature(jsonData, jsonData.objects[key]);
        L.GeoJSON.prototype.addData.call(this, geojson);
      }
    } else {
      L.GeoJSON.prototype.addData.call(this, jsonData);
    }
  }
});

geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

/** INFO **/

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info');
  this.updateFromGeo();
  return this._div;
};

info.updateFromGeo = function(props) {
  this._div.innerHTML = '<h4>Click on a state to explore </h4>' + (props ?
    '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>' : '');
};

info.updateFromTopo = function(props) {
  this._div.innerHTML = '<h4>Zip Code</h4>' + (props ?
    '<b>' + props.id + '</b><br />' :
    'Hover over a state');
}

info.addTo(map);

/** INFO **/

function getColor(d) {
  return d > 1000 ? '#800026' :
    d > 500 ? '#BD0026' :
    d > 200 ? '#E31A1C' :
    d > 100 ? '#FC4E2A' :
    d > 50 ? '#FD8D3C' :
    d > 20 ? '#FEB24C' :
    d > 10 ? '#FED976' :
    '#FFEDA0';
}

function style(feature) {
  return {
    weight: 1,
    opacity: .5,
    color: 'white',
    fillOpacity: 0
  };
}

function highlightGeoFeature(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#eeeeee',
    dashArray: '',
    fillOpacity: 0.7,
    fillColor: 'white'
  });
}

function resetGeoFeature(e) {
  const layer = e.target;
  if (!layer.zoomed) {
    geojson.resetStyle(e.target);
    info.updateFromGeo();
  }
}

function zoomToFeature(e) {
  const layer = e.target;
  layer.zoomed = true;

  const name = layer.feature.properties.name.replace(" ", "_");
  $.getJSON('resources/zipcode_json/zcta/' + name + ".topo.json").done(addTopoData);
  map.fitBounds(layer.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightGeoFeature,
    mouseout: resetGeoFeature,
    click: zoomToFeature
  });
}

/** TOPO DATA **/
function addTopoData(topoData) {
  const topoLayer = new L.TopoJSON();
  topoLayer.addData(topoData);
  topoLayer.addTo(map);
  topoLayer.eachLayer(handleTopoLayer);
}

function handleTopoLayer(layer) {
  var randomValue = Math.random(),
    fillColor = colorScale(randomValue).hex();
  layer.setStyle({
    fillColor: fillColor,
    fillOpacity: 1,
    color: '#555',
    weight: 1,
  });
  layer.on({
    mouseover: enterTopoLayer,
    mouseout: leaveTopoLayer
  });
}

function enterTopoLayer() {
  this.setStyle({
    weight: 2,
    opacity: 1
  });
  info.updateFromTopo(this.feature);
}

function leaveTopoLayer() {
  $countryName.hide();
  this.setStyle({
    weight: 0,
    opacity: 1,
    color: 'white'
  })
}

/** LEGEND **/
var legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function(map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
    labels = [],
    from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(map);
