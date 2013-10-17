/*jshint node:true */
/*global describe:false, it:false */
"use strict";

var Orchestrator = require('../');
var Q = require('q');
require('should');
require('mocha');

describe('orchestrator tasks', function() {
	describe('run()', function() {

		it('should run multiple tasks', function(done) {
			var orchestrator, a, fn, fn2;

			// Arrange
			orchestrator = new Orchestrator();
			a = 0;
			fn = function() {
				++a;
			};
			fn2 = function() {
				++a;
			};
			orchestrator.add('test', fn);
			orchestrator.add('test2', fn2);

			// Act
			orchestrator.run('test', 'test2');

			// Assert
			a.should.equal(2);
			done();
		});

		it('should run all tasks when call run() multiple times', function(done) {
			var orchestrator, a, fn, fn2;

			// Arrange
			orchestrator = new Orchestrator();
			a = 0;
			fn = function() {
				++a;
			};
			fn2 = function() {
				++a;
			};
			orchestrator.add('test', fn);
			orchestrator.add('test2', fn2);

			// Act
			orchestrator.run('test');
			orchestrator.run('test2');

			// Assert
			a.should.equal(2);
			done();
		});

		it('should add new tasks at the front of the queue', function(done) {
			var orchestrator, a, fn, fn2, fn3, aAtFn2, aAtFn3, test2pos, test3pos;

			// Arrange
			orchestrator = new Orchestrator();
			a = 0;
			fn = function() {
				orchestrator.run('test3');
				++a;
			};
			fn2 = function() {
				aAtFn2 = a;
				++a;
			};
			fn3 = function() {
				aAtFn3 = a;
				++a;
			};
			orchestrator.add('test', fn);
			orchestrator.add('test2', fn2);
			orchestrator.add('test3', fn3);

			// Act
			orchestrator.run('test', 'test2');

			// Assert
			aAtFn3.should.equal(1); // 1 ran
			aAtFn2.should.equal(2); // 1 and 3 ran
			a.should.equal(3);
			test2pos = orchestrator.seq.indexOf('test2');
			test3pos = orchestrator.seq.indexOf('test3');
			test2pos.should.be.above(-1);
			test3pos.should.be.above(-1);
			test2pos.should.be.above(test3pos);
			done();
		});

		it('should run all tasks when call run() multiple times', function(done) {
			var orchestrator, a, fn, fn2;

			// Arrange
			orchestrator = new Orchestrator();
			a = 0;
			fn = function() {
				++a;
			};
			fn2 = function() {
				++a;
			};
			orchestrator.add('test', fn);
			orchestrator.add('test2', fn2);

			// Act
			orchestrator.run('test');
			orchestrator.run('test2');

			// Assert
			a.should.equal(2);
			done();
		});

		it('should run all tasks when call run() with no arguments', function(done) {
			var orchestrator, a, fn, fn2;

			// Arrange
			orchestrator = new Orchestrator();
			a = 0;
			fn = function() {
				++a;
			};
			fn2 = function() {
				++a;
			};
			orchestrator.add('test', fn);
			orchestrator.add('test2', fn2);

			// Act
			orchestrator.run();

			// Assert
			a.should.equal(2);
			done();
		});

		it('should run all async promise tasks', function(done) {
			var orchestrator, a, fn, fn2;

			// Arrange
			orchestrator = new Orchestrator();
			a = 0;
			fn = function() {
				var deferred = Q.defer();
				setTimeout(function () {
					++a;
					deferred.resolve();
				},1);
				return deferred.promise;
			};
			fn2 = function() {
				var deferred = Q.defer();
				setTimeout(function () {
					++a;
					deferred.resolve();
				},1);
				return deferred.promise;
			};
			orchestrator.add('test', fn);
			orchestrator.add('test2', fn2);

			// Act
			orchestrator.run('test');
			orchestrator.run('test2', function () {
				// Assert
				orchestrator.isRunning.should.equal(false);
				a.should.equal(2);
				done();
			});
			orchestrator.isRunning.should.equal(true);
		});

		it('should run all async callback tasks', function(done) {
			var orchestrator, a, fn, fn2;

			// Arrange
			orchestrator = new Orchestrator();
			a = 0;
			fn = function(cb) {
				setTimeout(function () {
					++a;
					cb(null);
				},1);
			};
			fn2 = function(cb) {
				setTimeout(function () {
					++a;
					cb(null);
				},1);
			};
			orchestrator.add('test', fn);
			orchestrator.add('test2', fn2);

			// Act
			orchestrator.run('test');
			orchestrator.run('test2', function () {
				// Assert
				orchestrator.isRunning.should.equal(false);
				a.should.equal(2);
				done();
			});
			orchestrator.isRunning.should.equal(true);
		});

		it('should run task scoped to orchestrator', function(done) {
			var orchestrator, a, fn;

			// Arrange
			orchestrator = new Orchestrator();
			a = 0;
			fn = function() {
				this.should.equal(orchestrator);
				++a;
			};
			orchestrator.add('test', fn);

			// Act
			orchestrator.run('test');

			// Assert
			a.should.equal(1);
			orchestrator.isRunning.should.equal(false);
			done();
		});

	});
});