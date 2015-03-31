'use strict';

var React     = require('react');
var trackList = require('../track-list');
var _         = require('underscore');

module.exports = React.createClass({

    propTypes : {
        phaserLoader            : React.PropTypes.object.isRequired,
        onSelectTrack           : React.PropTypes.func.isRequired,
        onChangeDebugMode       : React.PropTypes.func.isRequired,
        onChangeNumberOfPlayers : React.PropTypes.func.isRequired,
        onSelectLaps            : React.PropTypes.func.isRequired
    },

    getInitialState : function()
    {
        var initialTheme = _(trackList).keys()[0];

        return {
            selectedTheme : initialTheme,
            selectedTrack : _(trackList[initialTheme]).keys()[0],
            playerCount   : 1,
            laps          : 5
        };
    },

    selectTheme : function(event)
    {
        var selectedTheme, selectedTrack;

        selectedTheme = event.currentTarget.value;
        selectedTrack = _(trackList[selectedTheme]).keys()[0];

        this.props.onSelectTrack(
            selectedTheme,
            selectedTrack
        );

        this.setState({
            selectedTheme : selectedTheme,
            selectedTrack : selectedTrack
        });
    },

    selectTrack : function(event)
    {
        var selectedTrack = event.currentTarget.value;

        this.props.onSelectTrack(
            this.state.selectedTheme,
            selectedTrack
        );

        this.setState({selectedTrack : selectedTrack});
    },

    restart : function(event)
    {
        this.props.onSelectTrack(
            this.state.selectedTheme,
            this.state.selectedTrack
        );
    },

    selectDebugMode : function(event)
    {
        this.props.onChangeDebugMode(
            !! parseInt(event.currentTarget.value, 10)
        );
    },

    selectNumberOfPlayers : function(event)
    {
        var playerCount, value, teams;

        value = event.currentTarget.value;

        if (value === 'teams') {
            playerCount = 4;
            teams       = true;
        } else {
            playerCount = parseInt(value, 10);
            teams       = false;
        }

        this.props.onChangeNumberOfPlayers(playerCount, teams);

        this.setState({playerCount : playerCount});
    },

    selectLaps : function(event)
    {
        var stringValue, value;

        stringValue = event.currentTarget.value;

        if (stringValue === 'Infinity') {
            value = Infinity;
        } else {
            value = parseInt(stringValue, 10);
        }

        this.props.onSelectLaps(value);

        this.setState({laps : value});
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
                <div>
                    <label htmlFor="playerCount">Number of Players</label>
                    <select id="playerCount" onChange={this.selectNumberOfPlayers}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value='teams'>4 Teams</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="laps">Laps</label>
                    <select id="laps" onChange={this.selectLaps} value={this.state.laps}>
                        <option value={1}>1</option>
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={Infinity}>Unlimited</option>
                    </select>
                </div>
                <div>
                    <button onClick={this.restart}>Restart</button>
                </div>
            </div>
        );
    }

});
