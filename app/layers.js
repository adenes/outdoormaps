var L = require('vendor/leaflet'),
    $ = require('util'),
    flags = require('flags');
    require('vendor/bing-layer');

var layers = {}, instances = {},
    customOptions = ['detectRetina', 'title', 'klazz', 'mapType'];

layers.map = {
  url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: 'Map data © OpenStreetMap contributors',
  detectRetina: flags.isEnabled('detectRetina'),
  mapType: 'map'
};

layers.turistautak = {
  url: 'http://{s}.map.turistautak.hu/tiles/turistautak/{z}/{x}/{y}.png',
  minZoom: 8,
  maxZoom: 21,
  subdomains: 'abcd',
  attribution: '© <a href="http://turistautak.hu">Turistautak.hu</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'Turistautak.hu',
  mapType: 'hiking',
  // approximate bounding box of hungary
  bounds: new L.LatLngBounds(
    new L.LatLng(48.6, 16), // sw
    new L.LatLng(45.6, 23.2)) // ne
};

layers.lines = {
  url: 'http://{s}.map.turistautak.hu/tiles/lines/{z}/{x}/{y}.png',
  minZoom: 8,
  maxZoom: 21,
  subdomains: 'abcd',
  attribution: '© <a href="http://turistautak.hu">Turistautak.hu</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'Turistautak.hu',
  mapType: 'overlay'
};

layers.wanderkarte = {
  url: 'http://{s}.wanderreitkarte.de/topo/{z}/{x}/{y}.png',
  subdomains: ['topo', 'topo2', 'topo3', 'topo4'],
  minZoom: 5,
  maxZoom: 18,
  attribution: '<a href="http://wanderreitkarte.de">Wanderkarte (Nop)</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'Wanderkarte',
  mapType: 'hiking'
};

layers.satellite = {
  klazz: L.BingLayer,
  url: 'AugCQhyydetxyavzoAQjcWuElUpYz2r49p15Kol7MUZEHnAW9umPiQWiki5CsUuz',
  detectRetina: flags.isEnabled('detectRetina'),
  mapType: 'satellite'
};

layers.bergfex = {
  url: 'http://static1.bergfex.at/images/amap/{z}/{folder}{z}_{x}_{y}.png',
  minZoom: 8,
  maxZoom: 15,
  attribution: '© <a href="http://bergfex.com">bergfex.com</a>',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'bergfex',
  mapType: 'hiking',
  folder: function(data) {
    // credits:
    // http://svn.openlayers.org/sandbox/ahocevar/bergfex/index.html
    return data.z >= 14
      ? String(data.x).slice(0, -2) + '/'
      : '';
  }
};

layers.opencyclemap = {
  url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
  subdomains: 'abc',
  attribution: 'Map data © OpenStreetMap contributors',
  detectRetina: flags.isEnabled('detectRetina'),
  title: 'OpenCycleMap',
  mapType: 'hiking'
};

layers.bgtopovj = {
  klazz: L.TileLayer.WMS,
  detectRetina: flags.isEnabled('detectRetina'),
  attribution: '<a href="http://web.uni-plovdiv.bg/vedrin/index_en.html">Map data: Uni-Plovdiv</a>',
  url: 'http://www.kade.si/cgi-bin/mapserv',
  layers: 'BGtopoVJ-raster-v3.00',
  title: 'BGtopoVJ (Bulgaria)',
  mapType: 'hiking'
};

Object.keys(layers).forEach(function(id) {
  layers[id].id = id;
});

exports.get = function(id) {
  // lazy-load this to avoid initial metadata request if not used
  // (eg. L.BingLayer)
  if(! instances[id]) {
    var Layer = layers[id].klazz || L.TileLayer;
    instances[id] = new Layer(layers[id].url, getLeafletOptions(layers[id]));
    // set custop properties after instantiating layers
    // so that they don't interfere with constructors
    // (eg. are not included in wms options)
    $.extend(instances[id], getCustomOptions(layers[id]));
  }
  return instances[id];
};

exports.keys = function(mapType) {
  return Object.keys(layers)
    .map(function(key) {
      return layers[key];
    })
    .filter(function(layer) {
      return ! mapType || layer.mapType == mapType;
    });
};

var getLeafletOptions = filterOptions.bind(null, false);
var getCustomOptions = filterOptions.bind(null, true);

function filterOptions(isCustom, options) {
  return Object.keys(options)
    .reduce(function(filtered, key) {
      if ((customOptions.indexOf(key) != -1) == isCustom) {
        filtered[key] = options[key];
      }
      return filtered;
    }, {});
}
