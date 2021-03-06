var L = require('vendor/leaflet'),
    xhr = require('xhr');

// TODO: share code with panoramio.js

module.exports = L.FeatureGroup.extend({
  onAdd: function(map) {
    map.on('moveend', this._update, this);
    this._map = map;
    // TODO: fix double-updating on map init
    this._update();
  },

  onRemove: function(map) {
    map.off('moveend', this._update, this);
    this.clearLayers();
  },

  _removeMarkers: function() {
    this.getLayers()
      .filter(function(layer) {
        // keep markers with open popup
        return !this._map.hasLayer(layer.getPopup());
      }, this)
      .forEach(this.removeLayer, this);
  },

  _load: function(data) {
    this._removeMarkers();

    data
      .photos
      .photo
      .map(function(photo) {
        var icon = L.divIcon({
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          popupAnchor: [0, -10],
          className: 'flickr-icon'
        });

        var marker = L.marker([photo.latitude, photo.longitude], {icon: icon})
          .bindPopup(this._template(photo), {
            maxWidth: photo.width_s,
            // avoid popup under top controls:
            autoPanPaddingTopLeft: [0, 60],
            className: 'photo-popup'
          });

        return marker;
      }, this)
      .forEach(this.addLayer, this);
  },

  _template: function(data) {
    var template =
      '<b class="title">{title}</b>' +
      '<a href="https://www.flickr.com/photos/{owner}/{id}" target="_blank">' +
        '<img class="photo" src="{url_s}" alt="{title}" width="{width_s}" height="{height_s}">' +
      '</a>' +
      '<a href="http://flickr.com" target="_blank" class="flickr-logo">' +
        'Flickr' +
      '</a>' +
      '<a class="owner" href="https://www.flickr.com/photos/{owner}" target="_blank">{ownername}</a>';
    return L.Util.template(template, data);
  },

  _update: function() {
    var bounds = this._map.getBounds();
    var size = this._map.getSize();
    var magic = 7500;

    // Limit is proportional to map size on the screen:
    // ~15 on mobile screens, ~100 on large desktop screens
    var limit = Math.max(10, Math.min(100, Math.round(size.x * size.y / magic)));

    // https://www.flickr.com/services/api/flickr.photos.search.html
    xhr
      .get('https://api.flickr.com/services/rest/', {
        data: {
          api_key: '779cc4e1c13263c15115435e538212d5',
          format: 'json',
          nojsoncallback: 1,
          method: 'flickr.photos.search',
          bbox: bounds.toBBoxString(),
          //lat: center.lat,
          //lon: center.lng,
          //sort: 'interestingness-asc',
          per_page: limit,
          extras: 'geo,owner_name,url_s'
        }
      })
      .then(this._load.bind(this));
  }
});
