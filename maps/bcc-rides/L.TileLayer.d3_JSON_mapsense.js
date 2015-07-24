L.TileLayer.d3_JSON = L.TileLayer.extend({
    //extending L.TileLayer to support topoJSON and geoJSON vector sources
    //rendering with d3, borrows from zjonsson & https://github.com/glenrobertson/leaflet-tilelayer-geojson/

    onAdd: function(map) {
        var map_container_svg = d3.select(map._container).select("svg");

        L.TileLayer.prototype.onAdd.call(this, map);
        this.mapsenseStyle = this.options.mapsenseStyle;

        this._path = d3.geo.path().projection({
            stream: function(stream) {
                // no sampling along great arc
                // just a pure projection, without the default d3 projection-stream pipeline
                // so, long lines don't make curves, i.e. they obey the mercator projection
                return {
                    point: function(x, y) {
                        var p = map.latLngToLayerPoint(new L.LatLng(y, x));
                        stream.point(p.x, p.y);
                    },
                    lineStart: stream.lineStart,
                    lineEnd: stream.lineEnd,
                    polygonStart: stream.polygonStart,
                    polygonEnd: stream.polygonEnd,
                    sphere: stream.sphere
                };
            }

        });

        this.on("tileunload", function(d) {
            if (d.tile.xhr) d.tile.xhr.abort();
            if (d.tile.nodes) d.tile.nodes.remove();
            d.tile.nodes = null;
            d.tile.xhr = null;
        });
    },
    _loadTile: function(tile, tilePoint) {
        var self = this;
        this._adjustTilePoint(tilePoint);
        var mapsenseStyle = this.mapsenseStyle;

        if (!tile.nodes && !tile.xhr) {
            tile.xhr = d3.json(this.getTileUrl(tilePoint), function(data) {
                var geoJson;

                if (data === '') {
                    // Ignore empty submissions
                } else {
                    geoJson = topo2Geo(data);
                }

                tile.xhr = null;

                nwPoint = tilePoint.multiplyBy(256);
                sePoint = nwPoint.add([256, 256]);
                nw = map.unproject(nwPoint);
                se = map.unproject(sePoint);

                var point = map.latLngToLayerPoint(new L.LatLng(nw.lat, nw.lng));
                var tile_coords = "tile_" + point.x + "_" + point.y;

                d3.select(map._container).select("svg")
                    .append("clipPath")
                    .attr("id", tile_coords)
                    .attr("style", "fill: none; stroke: pink; transform: translate(" + point.x + "px, " + point.y + "px); -webkit-transform: translate(" + point.x + "px, " + point.y + "px);")
                    .append("rect")
                    .attr("width", "256")
                    .attr("height", "256");

                d3.select(map._container).select("svg")
                    .append("rect")
                    .attr("style", "transform: translate(" + point.x + "px, " + point.y + "px); -webkit-transform: translate(" + point.x + "px, " + point.y + "px);")
                    .attr("width", "256")
                    .attr("height", "256")
                    .attr("class", "mapsense-"+self.mapsenseStyle +" tile-background");

                tile.nodes = d3.select(map._container).select("svg").append("g");

                // tile.nodes is now a bunch of appended g's

                var grp = tile.nodes.selectAll("path")
                    .data(geoJson.features)
                    .enter()
                    .append("g")
                    .attr("class", "groupr");

                grp.append("path")
                    .attr("d", self._path)
                    .attr("clip-path", "url(#" + tile_coords + ")")
                    .attr("class", self.options.class)
                    .attr("class", function(d) { // this data is a bunch of features
                        var zoomClass = "_" + Math.floor(map.getZoom());
                        var classes = ['mapsense-'+self.mapsenseStyle];

                        if (d.properties) {
                            if (d.properties) {
                                if (d.properties.layer)
                                    classes.push(d.properties.layer);
                                if (d.properties.natural)
                                    classes.push(d.properties.natural);
                                if (d.properties.sub_layer)
                                    classes.push(d.properties.sub_layer);
                            } else {
                                classes.push('unknown');
                            }
                            classes = classes.join(' ');
                            return classes;
                        } else {}
                    });
            });
        }
    }

});


function topologyFeatures(topology) {
    function convert(topology, object, layer, features) {
        var featureOrCollection = topojson.feature(topology, object),
            layerFeatures;

        if (featureOrCollection.type === "FeatureCollection") {
            layerFeatures = featureOrCollection.features;
        } else {
            layerFeatures = [featureOrCollection];
        }
        layerFeatures.forEach(function(f) {
            f.properties.layer = layer;
        });
        features.push.apply(features, layerFeatures);
    }

    var features = [];
    for (var o in topology.objects) {
        convert(topology, topology.objects[o], o, features);
    }
    return features;
}

function topo2Geo(tj) {
    var gj = {
        type: "FeatureCollection",
        features: topologyFeatures(tj)
    };
    return gj;
}
