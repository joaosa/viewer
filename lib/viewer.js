/*
 * viewer
 * https://github.com/jjadonotenter/viewer
 *
 * Copyright (c) 2013 Joao Andrade
 * Licensed under the MIT license.
 */

'use strict';

var d3 = require('d3'),
    http = require('http'),
    _ = require('underscore');

exports.setupLayout = function(size) {
  this.layout = d3.layout.force()
    .size([size.w, size.h])
    .linkDistance(80)
    .charge(-800);
};

exports.setupContainer = function(element, size, margin) {
  this.container = d3.select(element).append("svg:svg")
      .attr("width", size.w + margin.left + margin.right)
      .attr("height", size.h + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
};

exports.setup = function(element) {
  var margin = {top: 20, right: 10, bottom: 20, left: 10},
      size = {w: 960, h: 500};
  this.setupLayout(size);
  this.setupContainer(element, size, margin);
  this.layout.on("tick", this.tick(this.container));
};

exports.tick = function(element) {
  return function() {
    element.selectAll(".link")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  element.selectAll(".node")
    .attr("id", function(d) { return d.id; })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

  element.selectAll(".label")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; });
  };
};

exports.insertInLayout = function(nodes, links) {
  var layoutNodes = this.layout.nodes;
  var layoutLinks = this.layout.links;

  layoutNodes(layoutNodes().concat(nodes));

  layoutLinks(layoutLinks().concat(links.map(function(d) {
    var sourceNode = _.find(layoutNodes(), function(n) { return n.id === d.source; });
    var targetNode = _.find(layoutNodes(), function(n) { return n.id === d.target; });
    return {"source": sourceNode, "target": targetNode};
  })));

  this.layout.start();
};

exports.insertInContainer = function() {
  this.container.selectAll(".link")
      .data(this.layout.links())
      .enter()
    .append("svg:line")
      .attr("class", "link");

  var g = this.container.selectAll(".node")
      .data(this.layout.nodes())
      .enter()
    .append("svg:g")
      .call(this.layout.drag);

  g.append("svg:circle")
    .attr("class", "node")
    .attr("r", 15);

  g.append("svg:text")
    .attr("class", "label")
    .attr("dx", "-.35em")
    .attr("dy", ".35em")
    .text(function(d) { return d.id; });
};

exports.insert = function(nodes, links) {
  this.insertInLayout(nodes, links);
  this.insertInContainer();
};

exports.streamIn = function(url) {
  http.get({
    "host": url.host,
    "path": url.path,
    "port": url.port
  }, function(res) {
    res.on('data', function(res) {      
      var d = JSON.parse(res);
      var nodes = _.filter(d.stream, function(datum) { return datum.type === "node"; });
      var links = _.filter(d.stream, function(datum) { return datum.type === "link"; });
      exports.insert(nodes, links);
    });    
  });
};

/*exports.fileIn = function(uri) {
  this.insert();
};*/

exports.dataIn = function(d) {
  this.insert(d.nodes, d.links);
};

exports.run = function() {
  this.setup("body");
  // this.streamIn({"host": "localhost", "path": "/stream", "port": 8080});
  this.dataIn({
      "nodes": [
        {"id": "A"},
        {"id": "B"},
        {"id": "C"},
        {"id": "D"},
        {"id": "E"},
        {"id": "F"},
        {"id": "G"}
      ],
      "links": [
        {"source": "A", "target": "B"},
        {"source": "B", "target": "C"},
        {"source": "A", "target": "D"},
        {"source": "B", "target": "E"},
        {"source": "C", "target": "E"},
        {"source": "D", "target": "E"},
        {"source": "E", "target": "F"},
        {"source": "F", "target": "G"}]
    });
};
