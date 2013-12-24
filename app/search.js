var klass = require('vendor/klass'),
    SearchControl = require('search-control'),
    SearchService = require('search-service');

module.exports = klass({
  initialize: function(controller, options) {
    this.controller = controller;
    this.options = options;
    this.debouncedSearch = debounce(this.search.bind(this));
  },

  setMap: function(map) {
    this.map = map;
    this.control = new SearchControl({
      position: 'topright',
      onInput: this.onInput.bind(this),
      onSubmit: this.onSubmit.bind(this),
      onSelect: this.onSelect.bind(this)
    });
    map.addControl(this.control);
  },

  search: function(query) {
    SearchService.search(query, this.map.getBounds(),
                         this.onSuccess, this.onError, this);
  },

  reset: function() {
    this.results = [];
    this.control.setResults(null);
  },

  showResult: function(result) {
    this.setMarker({
      lat: result.lat,
      lon: result.lon
    });
    this.map.fitBounds([
     [result.boundingbox[0], result.boundingbox[2]],
     [result.boundingbox[1], result.boundingbox[3]]
    ]);
  },

  setMarker: function(position) {
    if(this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = this.controller.addMarker(position);
    }
  },

  onInput: function(val) {
    if (val.length) {
      this.debouncedSearch(val);
    } else {
      this.reset();
    }
  },

  onSubmit: function(val) {
    if (val.length) {
      this.search(val);
    } else {
      this.reset();
    }
  },

  onSelect: function(i) {
    var result = this.results[i];
    this.showResult(result);
    this.control.hideResults();
  },

  onSuccess: function(results) {
    this.results = results;
    this.control.setResults(
      results.length ? results.map(formatResult) : 'No results');
  },

  onError: function() {
    this.results = [];
    this.control.setResults('Search failed :(');
  }
});

function formatResult(result) {
  return result.display_name;
}

function debounce(fn) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, 100);
  };
}