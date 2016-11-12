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
const info = L.control();
var topoLayer;

var zipValues = {};
var minVal = 0;
var maxVal = 100;
var datasetId;
var representativeness;
var currentField;
var legendAdded = false;

clickedStates = {}

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
  return d > 1 ? '#800026' :
    d > 6/7 ? '#BD0026' :
    d > 5/7 ? '#E31A1C' :
    d > 4/7 ? '#FC4E2A' :
    d > 3/7 ? '#FD8D3C' :
    d > 2/7 ? '#FEB24C' :
    d > 1/7 ? '#FED976' :
    '#FFEDA0';
}

function normalize(val) {
    return (val - minVal) / (maxVal - minVal);
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
  geojson.resetStyle(e.target);
  info.updateFromGeo();
  layer.zoomed = true;
  if (!legendAdded) {
      legend.addTo(map);
      legendAdded = true;
  }

  const name = layer.feature.properties.name.replace(" ", "_");
  $.ajax({
      dataType: "json",
      url: "/data/zips",
      data: { field: currentField, state: name, dataset_id: datasetId },
      success: function ( data ) {
          minVal = data["min"];
          maxVal = data["maxVal"];
          $.each( data["zip_codes"], function( zc ) {
              zipValues[zc["zip"]] = zc["value"];
          })
      }
  });

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
    var stateName = Object.keys(topoData.objects)[0]
    if (!clickedStates[stateName]) {
      clickedStates[stateName] = new L.TopoJSON(); 
      clickedStates[stateName].addData(topoData);
      clickedStates[stateName].addTo(map);
      clickedStates[stateName].eachLayer(handleTopoLayer);
    }
}

function handleTopoLayer(layer) {
  var fillColor = getColor(normalize(zipValues[layer.feature.id]));
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

// Reset zipcode layer and resets zoom
function resetZipCodeLayer() {
  for (var state in clickedStates) {
    var layer = clickedStates[state]
    map.removeLayer(layer)
    delete(clickedStates[state])
  }
  map.setView(map.options.center, map.options.zoom);
}

/** LEGEND **/
var legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function(map) {

  var div = L.DomUtil.create('div', 'info legend'),
    labels = [],
    from, to;
  
  delta = (maxVal - minVal) / 7;
  for (var i = 0; i < 7; i++) {

    labels.push(
      '<i style="background:' + getColor(i/7) + '"></i> ' +
     (minVal + i * delta).toFixed(1) + "-" + (minVal + (i+1) * delta).toFixed(1));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};


$('input[type=file]').change(function() { 
    formdata = new FormData();
    formdata.append("file", this.files[0]);
    $.ajax({
        url: "/upload",
        type: "POST",
        data: formdata,
        processData: false,
        contentType: false,
        success: function ( data ) {
            zipValues = {};
            datasetId = data["dataset_id"];
            representativeness = data["metadata"]["representativeness"];
            var $field = $("#field");
            $field.empty(); 
            $.each(data["metadata"]["columns"], function(col) {
                $field.append($("<option></option>")
                   .attr("value", col).text(col)); 
            });
        }
    });
});

$("#field").change(function() {
    currentField = $('#field').val();
    resetZipCodeLayer();
});
