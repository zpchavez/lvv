'use strict';

var mapsRoot  = 'assets/tilemaps/maps/';
var tilesRoot = 'assets/tilemaps/tiles/';

module.exports = {
    'Desert' : {
        'tileset' : tilesRoot + 'desert.png',
        'tracks' : {
            'Square Loop' : mapsRoot + 'square-loop.json',
            'Figure 8'    : mapsRoot + 'figure8.json'
        }
    }
};