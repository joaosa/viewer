'use strict';

var chai = require('chai'),
    _ = require('underscore'),
    viewer = require('../lib/viewer.js');

chai.should();

describe('Viewer', function() {
  var bulkData = {
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
      {"source": "F", "target": "G"}
    ]
  };
  var streamData = {"data": [{"type": "node", "id": "H"}, {"type": "link", "source": "H", "target": "A"}]};
  describe('#setupLayout()', function() {
    it('should set the expected layout properties', function(done) {
      var layout = viewer.setupLayout({w: 960, h: 500});
      ['nodes', 'links', 'size', 'linkDistance', 'charge'].map(function(p) {
        layout.should.have.property(p);
      });
      done();
    });
  });
  describe('#insertInLayout()', function() {
    var layout,
        nodes,
        links;
    before(function(done) {
      layout = viewer.setupLayout({w: 480, h: 250});
      viewer.insertInLayout(bulkData.nodes, bulkData.links, layout);
      nodes = layout.nodes();
      links = layout.links();
      done();
    });
    it('should insert nodes in the layout', function(done) {
      bulkData.nodes.map(function(d) { return d.id; }).should.eql(nodes.map(function(d) { return d.id; }));
      done();
    });
    it('should insert link sources in the layout', function(done) {
      bulkData.links.map(function(d) { return d.source; }).should.eql(links.map(function(d) { return d.source.id; }));
      done();
    });
    it('should insert link targets in the layout', function(done) {
      bulkData.links.map(function(d) { return d.target; }).should.eql(links.map(function(d) { return d.target.id; }));
      done();
    });
    it('should set correct link properties', function(done) {
      ['index', 'weight', 'x', 'y', 'px', 'py'].map(function(p) {
        links.map(function(d) {
          d.source.should.have.property(p);
          d.target.should.have.property(p);
        });
      });
      done();
    });
  });
  describe('data formatting', function() {
    describe('#getNodes()', function() {
      it('should get only nodes from bulk data', function(done) {
        var data = viewer.getNodes(bulkData);
        data.length.should.above(0);
        data.map(function(d) {
          d.should.have.property('type', 'node');
          d.should.have.property('id');
        });
        done();
      });
      it('should get only nodes from stream data', function(done) {
        var data = viewer.getNodes(streamData);
        data.length.should.above(0);
        data.map(function(d) {
          d.should.have.property('type', 'node');
          d.should.have.property('id');
        });
        done();
      });
    });
    describe('#getLinks()', function() {
      it('should get only links from bulk data', function(done) {
        var data = viewer.getLinks(bulkData);
        data.length.should.above(0);
        data.map(function(d) {
          d.should.have.property('type', 'link');
          d.should.have.property('source');
          d.should.have.property('target');
        });
        done();
      });
      it('should get only links from stream data', function(done) {
        var data = viewer.getLinks(streamData);
        data.length.should.above(0);
        data.map(function(d) {
          d.should.have.property('type', 'link');
          d.should.have.property('source');
          d.should.have.property('target');
        });
        done();
      });
    });
    describe('#validLinks()', function() {
      it('should exclude links that don\'t have a valid source/target node', function() {
        var validLinks = viewer.validLinks(viewer.getLinks(streamData), viewer.getNodes(streamData));
        validLinks.should.have.length(0);
      });
    });
    describe('#bulkIn()', function() {
      it('should format bulk data correctly', function(done) {
        // sanity test
        var data = viewer.bulkIn(bulkData);
        _.size(data).should.above(0);
        ['nodes', 'links'].forEach(function(p) {
          data.should.have.property(p);
          data[p].should.be.a('array');
          data[p].length.should.above(0);
        });
        done();
      });
    });
    describe('#streamIn()', function() {
      it('should format stream-ready nodes correctly', function(done) {
        var data = viewer.streamIn({'data': viewer.getNodes(streamData)});
        _.size(data).should.above(0);
        data.should.have.property('nodes');
        data.nodes.should.be.a('array');
        data.nodes.length.should.above(0);
        data.should.have.property('links').with.length(0);
        done();
      });
      it('should format stream-ready links correctly', function(done) {
        var data = viewer.streamIn({'data': viewer.getLinks(streamData)});
        _.size(data).should.above(0);
        data.should.have.property('nodes').with.length(0);
        data.should.have.property('links');
        data.links.should.be.a('array');
        data.links.length.should.above(0);
        done();
      });
      it('should format stream-ready simultaneous nodes and links correctly', function(done) {
        var data = viewer.streamIn(streamData);
        _.size(data).should.above(0);
        ['nodes', 'links'].forEach(function(p) {
          data.should.have.property(p);
          data[p].should.be.a('array');
          data[p].length.should.above(0);
        });
        done();
      });
    });
  });
  // describe('data acquisition', function() {
  //   before(function(done) {
  //     // setup mock server
  //     done();
  //   });
  // });
});
