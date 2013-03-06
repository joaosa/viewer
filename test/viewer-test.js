'use strict';

var chai = require('chai'),
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
      {"source": "F", "target": "G"}]
  };
  var streamData = {"stream": [{"type": "node", "id": "H"}, {"type": "link", "source": "H", "target": "A"}]};
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
    before(function(done) {
      viewer.setupLayout({w: 480, h: 250});
      viewer.insertInLayout(bulkData.nodes, bulkData.links);
      done();
    });
    it('should insert nodes in the layout', function(done) {
      var nodes = viewer.layout.nodes();
      bulkData.nodes.map(function(d) { return d.id; }).should.eql(nodes.map(function(d) { return d.id; }));
      done();
    });
    it('should insert link sources in the layout', function(done) {
      var links = viewer.layout.links();
      bulkData.links.map(function(d) { return d.source; }).should.eql(links.map(function(d) { return d.source.id; }));
      done();
    });
    it('should insert link targets in the layout', function(done) {
      var links = viewer.layout.links();
      bulkData.links.map(function(d) { return d.target; }).should.eql(links.map(function(d) { return d.target.id; }));
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
  describe('data formatting', function() {
    describe('#dataIn()', function() {
      it('should format bulk data correctly', function(done) {
        // sanity test
        var data = viewer.dataIn(bulkData);        
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
        var data = viewer.streamIn({'stream': viewer.getNodes(streamData)});
        data.should.have.property('nodes');
        data.nodes.should.be.a('array');
        data.nodes.length.should.above(0);
        data.should.have.property('links').with.length(0);
        done();
      });
      it('should format stream-ready links correctly', function(done) {
        var data = viewer.streamIn({'stream': viewer.getLinks(streamData)});
        data.should.have.property('nodes').with.length(0);
        data.should.have.property('links');
        data.links.should.be.a('array');
        data.links.length.should.above(0);
        done();
      });
      it('should format stream-ready simultaneous nodes and links correctly', function(done) {
        var data = viewer.streamIn(streamData);
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
