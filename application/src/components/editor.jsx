'use strict';

var React = require('react');

module.exports = React.createClass({

    propTypes : {
        saveButtonCallback : React.PropTypes.func.isRequired,
        downloadUri        : React.PropTypes.string
    },

    renderDownloadLink : function()
    {
        if (! this.props.downloadUri) {
            return null;
        }

        return (
            <div>
                <a href={this.props.downloadUri}>Download</a>
            </div>
        );
    },

    render : function()
    {
        return (
            <div>
                <button onClick={this.props.saveButtonCallback}>Save</button>
                {this.renderDownloadLink()}
            </div>
        );
    }

});