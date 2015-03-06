'use strict';

var React     = require('react');
var trackList = require('../../assets/tilemaps/maps/list');
var _         = require('underscore');

module.exports = React.createClass({

    propTypes : {
        onSelectTrack : React.PropTypes.func.isRequired
    },

    getInitialState : function()
    {
        return {
            selectedTheme : _(trackList).keys()[0]
        };
    },

    selectTrack : function(event)
    {
        this.props.onSelectTrack(
            this.state.selectedTheme,
            event.currentTarget.value
        );
    },

    renderThemeSelector : function()
    {
        var themes, options = [];

        themes = _(trackList).keys();

        _(themes).each(function (theme) {
            options.push(
                <option value={theme}>{theme}</option>
            );
        });

        return (
            <select onChange={this.selectTheme}>
                {options}
            </select>
        );
    },

    renderTrackSelector : function()
    {
        var tracks, options = [];

        tracks = _(trackList[this.state.selectedTheme].tracks).keys();

        _(tracks).each(function (track) {
            options.push(
                <option value={track}>{track}</option>
            );
        });

        return (
            <select onChange={this.selectTrack}>
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
            </div>
        );
    }

});