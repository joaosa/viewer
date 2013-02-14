'use strict';

var should = require('should'),
    viewer = require('../lib/viewer.js');

describe('Viewer', function() {
  describe('#setupLayout()', function() {
    before(function(done) {
      viewer.setupLayout({w: 960, h: 500});
      done();
    });
    it('should set the expected layout properties', function(done) {
      ['nodes', 'links', 'size', 'linkDistance', 'charge'].map(function(p) {
        viewer.layout.should.have.property(p);
      });
      done();
    });
  });
  describe('#insertInLayout()', function() {
    var data = {
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
    };
    before(function(done) {
      viewer.setupLayout({w: 480, h: 250});
      viewer.insertInLayout(data.nodes, data.links);
      done();
    });
    it('should insert nodes in the layout', function(done) {
      var nodes = viewer.layout.nodes();
      data.nodes.map(function(d) { return d.id; }).should.eql(nodes.map(function(d) { return d.id; }));
      done();
    });
    it('should insert link sources in the layout', function(done) {
      var links = viewer.layout.links();
      data.links.map(function(d) { return d.source; }).should.eql(links.map(function(d) { return d.source.id; }));
      done();
    });
    it('should insert link targets in the layout', function(done) {
      var links = viewer.layout.links();
      data.links.map(function(d) { return d.target; }).should.eql(links.map(function(d) { return d.target.id; }));
      done();
    });
    it('should set correct link properties', function(done) {
      var links = viewer.layout.links();
      ['index', 'weight', 'x', 'y', 'px', 'py'].map(function(p) {
        links.map(function(d) {
          d.source.should.have.property(p);
          d.target.should.have.property(p);
        });
      });
      done();
    });
  });
  /*describe('#streamIn()', function() {
    // setup mock server
    it('should receive json data correctly', function(done) {
      // verify data in the correct format
      done();
    });
  });*/
});
