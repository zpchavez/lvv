'use strict';

var React     = require('react');
var trackList = require('../../assets/tilemaps/maps/list');
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
        this.props.onSelectTrack(
            this.state.selectedTheme,
            event.currentTarget.value
        );
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

        tracks = _(trackList[this.state.selectedTheme].tracks).keys();

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