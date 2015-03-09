'use strict';

var React     = require('react');
var trackList = require('../../assets/tilemaps/maps/list');
var tmxParser = require('tmx-parser');
var _         = require('underscore');

module.exports = React.createClass({

    propTypes : {
        onSelectTrack     : React.PropTypes.func.isRequired,
        onChangeDebugMode : React.PropTypes.func.isRequired
    },

    getInitialState : function()
    {
        return {
            selectedTheme : _(trackList).keys()[0]
        };
    },

    selectTrack : function(event)
    {
        var tmxData, component = this;

        tmxData = trackList[this.state.selectedTheme][event.currentTarget.value];

        tmxParser.parse(tmxData, null, function(err, map) {
            var fixedMap = component.fixParsedMap(map)

            component.props.onSelectTrack(map);
        });
    },

    // The object created by tmx-parser is not quite valid, so it needs to be fixed
    fixParsedMap : function(map)
    {
        map.tilesets   = map.tileSets;
        delete map.tileSets;

        map.tileheight = map.tileHeight;
        map.tilewidth  = map.tileWidth;

        map.tilesets = map.tilesets.map(function (tileset) {
            tileset.tileheight  = tileset.tileHeight;
            delete tileset.tileHeight;

            tileset.tilewidth   = tileset.tileWidth;
            delete tileset.tileWidth;

            tileset.imagewidth  = tileset.image.width;
            tileset.imageheight = tileset.image.height;
            tileset.imagePath   = 'assets/tilemaps/' + tileset.image.source.replace(/[.\/]*/, '', 'g')
            return tileset;
        });

        map.layers = map.layers.map(function (layer) {
            var newLayer = {
                data    : [],
                objects : layer.objects || [],
                height  : map.height,
                width   : map.width,
                opacity : layer.opacity,
                type    : layer.type + 'layer',
                name    : layer.name,
                x       : 0,
                y       : 0
            }

            if (layer.tiles) {
                newLayer.data = layer.tiles.map(function (tile) {
                    return tile.id;
                })
            }
            return newLayer;
        });

        return map;
    },

    selectDebugMode : function(event)
    {
        this.props.onChangeDebugMode(
            !! parseInt(event.currentTarget.value, 10)
        );
    },

    renderThemeSelector : function()
    {
        var themes, options = [];

        themes = _(trackList).keys();

        _(themes).each(function (theme) {
            options.push(
                <option value={theme} key={theme}>{theme}</option>
            );
        });

        return (
            <select id="theme" onChange={this.selectTheme}>
                {options}
            </select>
        );
    },

    renderTrackSelector : function()
    {
        var tracks, options = [];

        tracks = _(trackList[this.state.selectedTheme]).keys();

        _(tracks).each(function (track) {
            options.push(
                <option value={track} key={track}>{track}</option>
            );
        });

        return (
            <select id="track" onChange={this.selectTrack}>
                {options}
            </select>
        );
    },

    render : function()
    {
        return (
            <div>
                <div>
                    <label htmlFor="theme">Theme</label>
                    {this.renderThemeSelector()}
                </div>
                <div>
                    <label htmlFor="track">Track</label>
                    {this.renderTrackSelector()}
                </div>
                <div>
                    <label htmlFor="debug">Debug</label>
                    <select id="debug" onChange={this.selectDebugMode}>
                        <option value={0}>off</option>
                        <option value={1}>on</option>
                    </select>
                </div>
            </div>
        );
    }

});