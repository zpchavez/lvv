import _ from 'underscore';

export default function(options) {
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
             "opacity":1.0,
             "type":"tilelayer",
             "visible":true,
             "width":options.width,
             "x":0,
             "y":0
            },
            {
                "data":[],
                "height":options.height,
                "name":"decoration",
                "opacity":0.7,
                "type":"tilelayer",
                "visible":true,
                "width":options.width,
                "x":0,
                "y":0
            },
            {
                "data":[],
                "height":options.height,
                "name":"foreground",
                "opacity":1.0,
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
            },
            {
             "data":[],
             "height":options.height,
             "name":"rough",
             "opacity":1,
             "type":"tilelayer",
             "visible":false,
             "width":options.width,
             "x":0,
             "y":0
            },
            {
             "data":[],
             "height":options.height,
             "name":"drops",
             "opacity":1,
             "type":"tilelayer",
             "visible":false,
             "width":options.width,
             "x":0,
             "y":0
            },
            {
             "data":[],
             "height":options.height,
             "name":"water",
             "opacity":1,
             "type":"tilelayer",
             "visible":false,
             "width":options.width,
             "x":0,
             "y":0
            },
            {
             "data":[],
             "height":options.height,
             "name":"ramps",
             "opacity":1,
             "type":"tilelayer",
             "visible":false,
             "width":options.width,
             "x":0,
             "y":0
            },
            {
                "draworder": "topdown",
                "height": 50,
                "name": "obstacles",
                "objects": [],
                "opacity": 1,
                "type": "objectgroup",
                "visible": true,
            },
            {
                "draworder": "topdown",
                "height": 50,
                "name": "track-delineators",
                "objects": [],
                "opacity": 1,
                "type": "objectgroup",
                "visible": true,
            },
        ],
        "placedObjectClasses": {
            "Ant": true,
            "HandShovel": true,
            "HorseShoe": true,
            "Lollipop": true,
            "Sprayer":  true,
            "Pebble1": true,
            "Pebble2": true,
            "Pebble3": true,
            "Pebble4": true,
            "Pebble5": true,
            "Pebble6": true,
            "Pebble7": true,
        },
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
            }
        ],
        "tilewidth":32,
        "version":1,
    }
};
