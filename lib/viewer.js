/*
 * viewer
 * https://github.com/jjadonotenter/viewer
 *
 * Copyright (c) 2013 Joao Andrade
 * Licensed under the MIT license.
 */

'use strict';

var d3 = require('d3'),
    io = require('socket.io-client'),
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

exports.getNodes = function(d) { 
  return _.filter(d.stream, function(datum) { return datum.type === "node"; }); 
};

exports.getLinks = function(d) { 
  return _.filter(d.stream, function(datum) { return datum.type === "link"; }); 
};

exports.getSourceNode = function(link, nodes) {
  return _.find(nodes, function(n) { return n.id === link.source; });
};

exports.getTargetNode = function(link, nodes) {
  return _.find(nodes, function(n) { return n.id === link.target; });
};

exports.insertInLayout = function(nodes, links) {  
  var layoutNodes = this.layout.nodes;
  var layoutLinks = this.layout.links;

  layoutNodes(layoutNodes().concat(nodes));

  layoutLinks(layoutLinks().concat(links.map(function(l) {
    return {"source": exports.getSourceNode(l, layoutNodes()), 
            "target": exports.getTargetNode(l, layoutNodes())};
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

exports.streamIn = function(d) {
  return {'nodes': this.getNodes(d), 'links': this.getLinks(d)};
};

/*exports.fileIn = function(uri) {
  // implement file reading
  this.insert();
};*/

exports.dataIn = function(d) {
  return {'nodes': d.nodes, 'links': d.links};
};

exports.run = function(host, port) {
  this.setup("body");

  var socket = io.connect('http://' + host + ':' + port);
  socket.on('connect', function() {
    socket.emit('ready');

    socket.on('data', function(msg) {
      exports.insert(exports.dataIn(msg));
    });

    socket.on('stream', function(msg) {
      exports.insert(exports.streamIn(msg));
    });
  });
};
