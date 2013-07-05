var Layers = require('layers'),
    klass = require('vendor/klass'),
    $ = require('util');

module.exports = klass({
  initialize: function(controller, options) {
    this.controller = controller;
    this.options = options;

    // event handlers
    var closeButton = document.getElementById('close-button');
    $.on(closeButton, 'click', this.closeSettings, this);

    // initial state
    this.mapLayer = (options.get('layers') || controller.defaults.layers)[0];
    this.mapType = Layers.get(this.mapLayer).options.mapType;
    this.defaultLayers = options.get('defaultLayers');
    if(! this.defaultLayers) {
      this.defaultLayers = {};
      this.defaultLayers[this.mapType] = this.mapLayer;
    }

    this.createButtons();
    this.updateButtons();
  },

  setMap: function() {
    this.controller.createButton('settings', 'topright',
      this.toggleSettings, this);
  },

  toggleSettings: function() {
    $.toggleClass(document.body, 'settings',
      document.body.className !== 'settings');
  },

  closeSettings: function() {
    $.toggleClass(document.body, 'settings', false);
  },

  setMapType: function(event) {
    var type = event.target.name;
    var layerId = this.defaultLayers[type] || Layers.keys(type)[0].id;
    this.mapType = type;
    this.setLayers([layerId]);
  },

  setMapLayer: function(event) {
    var id = event.target.name;
    this.defaultLayers[Layers.get(id).options.mapType] = id;
    this.setLayers([id]);
  },

  setLayers: function(layerIds) {
    this.mapLayer = layerIds[0];
    this.controller.setLayers(layerIds);
    this.options.set({defaultLayers: this.defaultLayers});
    this.updateButtons();
  },

  createButtons: function() {
    var mapTypes = document.querySelector('.map-types');
    this.mapTypeButtons = mapTypes.querySelectorAll('.map-type button');

    // handle click on map types
    // XXX no event delegation on iOS Safari :(
    $.eachNode(this.mapTypeButtons, function(button) {
      $.on(button, 'click', this.setMapType, this);
    }, this);


    // create layer type selection for map types with multiple
    // layers
    this.mapLayerGroups = ['hiking', 'satellite', 'map']
      .map(function(type) { return Layers.keys(type); })
      .filter(function(layers) { return layers.length > 1; })
      .map(function(layers) {
        var group = {mapType: layers[0].mapType};

        var g = document.createElement('p');
        g.className = 'map-layer btn-group vertical-btn-group';
        mapTypes.appendChild(g);
        group.wrapper = g;

        group.layers = layers.map(function(key) {
          var button = document.createElement('button');
          button.className = 'btn';
          button.name = key.id;
          button.innerHTML = key.title;
          //button.style.width = (100 / layers.length) + '%';
          g.appendChild(button);

          $.on(button, 'click', this.setMapLayer, this);
          return button;
        }, this);

        return group;
      }, this);
  },

  updateButtons: function() {
    // map type buttons
    $.eachNode(this.mapTypeButtons, function(button) {
      var active = button.name === this.mapType;
      $.toggleClass(button, 'active', active);
    }, this);

    // toggle group
    this.mapLayerGroups.forEach(function(group) {
      if(group.mapType === this.mapType) {
        $.show(group.wrapper);
        // toggle buttons state in active group
        group.layers.forEach(function(button) {
          $.toggleClass(button, 'active', button.name === this.mapLayer);
        }, this);
      } else {
        $.hide(group.wrapper);
      }
    }, this);

    // XXX fix a strange Chrome issue that settings doesn't repaint
    document.getElementById('settings')
      .style.opacity = 1;
  }
});