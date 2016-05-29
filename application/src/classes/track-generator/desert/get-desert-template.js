var _ = require('underscore');

module.exports = function(options) {
    options = options || {};
    _(options).defaults({
        height: 200,
        width: 200,
    });
    return {
        "height":options.height,
        "width":options.width,
        "layers":[
            {
             "data":[],
             "height":options.height,
             "name":"background",
             "opacity":1,
             "type":"tilelayer",
             "visible":true,
             "width":options.width,
             "x":0,
             "y":0
            },
            {
             "draworder":"topdown",
             "height":0,
             "name":"track",
             "objects":[],
             "opacity":1,
             "type":"objectgroup",
             "visible":true,
             "width":0,
             "x":0,
             "y":0
            }],
        "nextobjectid":28,
        "orientation":"orthogonal",
        "properties": {},
        "renderorder":"right-down",
        "tileheight":32,
        "tilesets":[
            {
             "firstgid":1,
             "imageUrl":"assets/tilemaps/tiles/desert-with-pit.png",
             "imageheight":199,
             "imagewidth":265,
             "margin":1,
             "name":"Desert",
             "properties": {},
             "spacing":1,
             "tileheight":32,
             "tilewidth":32
            }],
        "tilewidth":32,
        "version":1,
    }
}
