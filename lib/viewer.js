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
  var nNodes = 100,
      width = size.w,
      height = size.h,
      k = Math.sqrt(nNodes / (width * height));

  return d3.layout.force()
    .size([width, height])
    .gravity(100 * k)
    .linkDistance(20) // 80
    .charge(-25 / k); // -8000
};

exports.setupContainer = function(element, size, margin) {
  return d3.select(element).append("svg:svg")
      .attr("width", size.w + margin.left + margin.right)
      .attr("height", size.h + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
};

exports.setup = function(element) {
  var margin = {top: 20, right: 10, bottom: 20, left: 10},
      size = {w: 1024, h: 768};
  var layout = this.setupLayout(size);
  var container = this.setupContainer(element, size, margin);

  var nodeCache = [];
  var linkCache = [];

  this.cache = function(data) {
    linkCache = data.links;
    nodeCache = data.nodes;
  };

  this.update = function(layout, element) {
    exports.updateLayout(nodeCache, linkCache, layout, element);
  };

  layout.on("tick", this.updateContainer(container));

  return {'layout': layout, 'container': container};
};

exports.getNodes = function(data) {
  if (data.hasOwnProperty('data')) {
    return _.filter(data.data, function(datum) { return datum.type === "node"; });
  }
  else if (data.hasOwnProperty('nodes')) {
    return data.nodes.map(function(datum) {
      datum['type'] = 'node';
      return datum;
    });
  } else {
    return [];
  }
};

exports.getLinks = function(data) {
  if (data.hasOwnProperty('data')) {
    return _.filter(data.data, function(datum) { return datum.type === "link"; });
  }
  else if (data.hasOwnProperty('links')) {
    return data.links.map(function(datum) {
      datum['type'] = 'link';
      return datum;
    });
  } else {
    return [];
  }
};

exports.getSourceNode = function(link, nodes) {
  return _.find(nodes, function(n) { return n.id === link.source; });
};

exports.getTargetNode = function(link, nodes) {
  return _.find(nodes, function(n) { return n.id === link.target; });
};

exports.insertInLayout = function(nodes, links, layout) {
  var layoutNodes = layout.nodes;
  var layoutLinks = layout.links;

  layoutNodes(nodes);
  layoutLinks(links.map(function(l) {
    return {"source": exports.getSourceNode(l, layoutNodes()),
            "target": exports.getTargetNode(l, layoutNodes())};
  }));

  layout.start();
};

exports.insertInContainer = function(layout, element) {
  var color = d3.scale.category10();

  element.selectAll(".link")
      .data(layout.links())
    .enter().append("svg:line")
      .attr("class", "link");

  element.selectAll(".node")
      .data(layout.nodes())
    .enter().append("svg:circle")
      .attr("class", "node")
      .attr("r", 15)
      .style("fill", function (d) {
        var degree = layout.links().filter(function (l) { return l.target.id === d.id || l.source.id === d.id; }).length;
        return color(degree);
      });

  element.selectAll(".label")
    .data(layout.nodes())
  .enter().append("svg:text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.id; })
    .attr("dx", "-.1em")
    .attr("dy", ".35em")
    .call(layout.drag);
};

exports.insert = function(nodes, links, layout, element) {
  this.insertInLayout(nodes, links, layout);
  this.insertInContainer(layout, element);
};

exports.validLinks = function(links, nodes) {
  var nodeIDs = nodes.map(function(n) { return n.id; });
  return links.filter(function(l) {
    return _.contains(nodeIDs, l.source) && _.contains(nodeIDs, l.target);
  });
};

exports.updateLayout = function(nodes, links, layout, element) {
  // some links might reference nodes that haven't arrived yet
  this.insert(nodes, this.validLinks(links, nodes), layout, element);
};

exports.updateContainer = function(element) {
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
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
  };
};

exports.format = function(data) {
  return {'nodes': this.getNodes(data), 'links': this.getLinks(data)};
};

exports.run = function(host, port) {
  var view = this.setup("body");
  var layout = view.layout;
  var container = view.container;

  var socket = io.connect('http://' + host + ':' + port);
  socket.on('connect', function() {
    socket.emit('ready');

    socket.on('data', function(msg) {
      exports.cache(exports.format(msg));
      exports.update(layout, container);
    });
  });
};
