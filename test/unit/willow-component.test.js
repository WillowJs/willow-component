'use strict';
/*global describe, it, before, beforeEach, after, afterEach, expect, utils, sinon */

var Willow = require('../../index.js');
var TestUtils = require('react/addons').addons.TestUtils;
describe('willow-component', function() {
	describe('contents', function() {
		it('should have a getContents method', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.prototype._willow.getContents).not.to.be.undefined;
		});
		it('should have a setContents method', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.prototype._willow.setContents).not.to.be.undefined;
		});
		it('should have contents property foo', function() {
			var ComponentClass = Willow.createClass({
				foo: 'bar'
			});
			expect(ComponentClass.prototype._willow.getContents().foo).to.equal('bar');
		});
		it('should be able to set the contents successfully', function() {
			var ComponentClass = Willow.createClass({
				foo: 'bar'
			});
			ComponentClass.prototype._willow.setContents({face: 'book'});
			expect(ComponentClass.prototype._willow.getContents().foo).to.be.undefined;
			expect(ComponentClass.prototype._willow.getContents().face).to.equal('book');
		});
	});

	describe('events', function() {
		it('should have a getEvents method', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.prototype._willow.getEvents).not.to.be.undefined;
		});
		it('should have a setEvents method', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.prototype._willow.setEvents).not.to.be.undefined;
		});
		it('should have an on method', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.prototype._willow.on).not.to.be.undefined;
			expect(ComponentClass.on).not.to.be.undefined;
		});
		it('should have no events by default', function() {
			var ComponentClass = Willow.createClass({
				foo: 'bar'
			});
			expect(ComponentClass.prototype._willow.getEvents()).to.deep.equal({});
		});
		it('should keep track of added events', function() {
			var ComponentClass = Willow.createClass({
				foo: 'bar'
			}).on('test', {
				name: 'hello',
				method: 'get',
				dependencies: [],
				run: function(){}
			});
			expect(ComponentClass.prototype._willow.getEvents().test).not.to.be.undefined;
		});
		it('should be able to set the events object successfully', function() {
			var ComponentClass = Willow.createClass({
				foo: 'bar'
			}).on('test', {
				name: 'hello',
				method: 'get',
				dependencies: [],
				run: function(){}
			});
			ComponentClass.prototype._willow.setEvents({foo: 'bar'});
			expect(ComponentClass.prototype._willow.getEvents().test).to.be.undefined;
			expect(ComponentClass.prototype._willow.getEvents().foo).to.equal('bar');
		});
	});

	describe('metadata', function() {
		it('should have a metadata method', function() {
			expect(Willow.createClass({}).metadata).not.to.be.undefined;
		});
		it('should have a getMetadata method', function() {
			expect(Willow.createClass({}).getMetadata).not.to.be.undefined;
			expect(Willow.createClass({}).prototype._willow.getMetadata).not.to.be.undefined;
		});
		it('should have a setMetadata method', function() {
			expect(Willow.createClass({}).prototype._willow.setMetadata).not.to.be.undefined;
		});
		it('should return a undefined when no metadata is set', function() {
			var comp = Willow.createClass({});
			expect(comp.getMetadata()('hello')).to.be.undefined;
		});
		it('should return the correct metadata object', function() {
			var comp = Willow.createClass({}).metadata(function(test) {
				return {
					value: test
				};
			});
			expect(comp.getMetadata()('hello')).to.deep.equal({value: 'hello'});
			expect(comp.getMetadata()('yes')).to.deep.equal({value: 'yes'});
		});
	});

	describe('requires', function() {
		it('should have a require method', function() {
			expect(Willow.createClass({}).require).not.to.be.undefined;
		});
		it('should have a getRequires method', function() {
			expect(Willow.createClass({}).prototype._willow.getRequires).not.to.be.undefined;
		});
		it('should have a setRequires method', function() {
			expect(Willow.createClass({}).prototype._willow.setRequires).not.to.be.undefined;
		});
		it('should have no requires by default', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.prototype._willow.getRequires()).to.deep.equal({});
		});
		it('should set requires successfully', function() {
			var ComponentClass = Willow.createClass({});
			ComponentClass.prototype._willow.setRequires({foo: 'bar'});
			expect(ComponentClass.prototype._willow.getRequires().foo).to.equal('bar');
		});
		it('should be able to access requires on the node', function() {
			var ComponentClass = Willow.createClass({});
			ComponentClass.prototype._willow.setRequires({foo: 'bar'});
			var node = utils.renderIntoDocument(<ComponentClass name="parent" />);
			expect(node.require.foo).to.equal('bar');
		});
		it('should return itself for method chaining', function() {
			var CompClass = Willow.createClass({});
			expect(CompClass.require('_', 'lodash', 'server')).to.equal(CompClass);
		});
		it('should throw and error if no var name is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require(); }).to.throw({
				message: 'A variable name is required',
				status: 400,
				id: 'NOVARNAME',
				params: {}
			});
		});
		it('should throw and error if an invalid var name is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require(true); }).to.throw({
				message: 'Variable names must be strings',
				status: 400,
				id: 'BADVARNAME',
				params: {}
			});
		});
		it('should throw and error if no module name is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require('hello'); }).to.throw({
				message: 'A module to include must be specified',
				status: 400,
				id: 'NOMODNAME',
				params: {}
			});
		});
		it('should throw and error if an invalid module name is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require('hello', 7); }).to.throw({
				message: 'Module names must be strings',
				status: 400,
				id: 'BADMODNAME',
				params: {}
			});
		});
		it('should throw and error if no context is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require('hello', 'world'); }).to.throw({
				message: 'A context is require ("client" or "server" or "both")',
				status: 400,
				id: 'NOCONTEXT',
				params: {}
			});
		});
		it('should throw and error if a bad context is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require('hello', 'world', []); }).to.throw({
				message: 'Context must be a string',
				status: 400,
				id: 'BADCONTEXT',
				params: {}
			});
		});
		it('should throw and error if an invalid context is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require('hello', 'world', []); }).to.throw({
				message: 'Context must be either "client", "server" or "both"',
				status: 400,
				id: 'INVALIDCONTEXT',
				params: {}
			});
		});
		it('should work when valid params are passed in', function() {
			var CompClass = Willow.createClass({});
			expect(CompClass.require('foo', 'bar', 'client')).to.equal(CompClass);
			expect(CompClass.require('faz', 'boz', 'server')).to.equal(CompClass);
			expect(CompClass.require('face', 'book', 'both')).to.equal(CompClass);
		});
	});

	describe('config', function() {
		it('should have a config method', function() {
			expect(Willow.createClass({}).config).not.to.be.undefined;
		});
		it('should have a getConfig method', function() {
			expect(Willow.createClass({}).prototype._willow.getConfig).not.to.be.undefined;
		});
		it('should have a setConfig method', function() {
			expect(Willow.createClass({}).prototype._willow.setConfig).not.to.be.undefined;
		});
		it('should have no configs by default', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.prototype._willow.getConfig()).to.deep.equal({});
		});
		it('should set config successfully', function() {
			var ComponentClass = Willow.createClass({});
			ComponentClass.prototype._willow.setConfig({foo: 'bar'});
			expect(ComponentClass.prototype._willow.getConfig().foo).to.equal('bar');
		});
		it('should be able to access config on the node', function() {
			var ComponentClass = Willow.createClass({});
			ComponentClass.prototype._willow.setConfig({foo: 'bar'});
			var node = utils.renderIntoDocument(<ComponentClass name="parent" />);
			expect(node.config.foo).to.equal('bar');
		});
		it('should throw and error if no key is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.config(); }).to.throw({
				message: 'A key is required',
				status: 400,
				id: 'NOVARNAME',
				params: {}
			});
		});
		it('should throw and error if an invalid var name is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.config(true); }).to.throw({
				message: 'Keys must be strings',
				status: 400,
				id: 'BADVARNAME',
				params: {}
			});
		});
		it('should throw and error if no context is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require('hello', 'world'); }).to.throw({
				message: 'A context is require ("client" or "server" or "both")',
				status: 400,
				id: 'NOCONTEXT',
				params: {}
			});
		});
		it('should throw and error if a bad context is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require('hello', 'world', []); }).to.throw({
				message: 'Context must be a string',
				status: 400,
				id: 'BADCONTEXT',
				params: {}
			});
		});
		it('should throw and error if an invalid context is specified', function() {
			var CompClass = Willow.createClass({});
			expect(function() { CompClass.require('hello', 'world', []); }).to.throw({
				message: 'Context must be either "client", "server" or "both"',
				status: 400,
				id: 'INVALIDCONTEXT',
				params: {}
			});
		});
		it('should work when valid params are passed in', function() {
			var CompClass = Willow.createClass({});
			expect(CompClass.config('foo', 'bar', 'client')).to.equal(CompClass);
			expect(CompClass.config('faz', 'boz', 'server')).to.equal(CompClass);
			expect(CompClass.config('face', 'book', 'both')).to.equal(CompClass);
		});
	});

	describe('context', function() {
		it('should have a getContext method', function() {
			expect(Willow.createClass({}).prototype._willow.getContext).not.to.be.undefined;
		});
		it('should be able to get the full context object', function() {
			var CompClass = Willow.createClass({});
			CompClass.config('foo', 'twitter', 'client');
			CompClass.require('foo', 'facebook', 'both');
			CompClass.require('baz', 'google', 'server');

			expect(CompClass.prototype._willow.getContext()).to.deep.equal({
				config: {
					both: {},
					client: {
						foo: 'twitter'
					},
					server: {}
				},
				requires: {
					both: {
						foo: 'facebook'
					},
					client: {},
					server: {
						baz: 'google'
					}
				}
			});
		});
	});

	describe('on', function() {
		it('should exist on classes', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.on).not.to.be.undefined;
		});
		it('should not exist on nodes', function() {
			var ComponentClass = Willow.createClass({});
			var compNode = utils.renderIntoDocument(<ComponentClass />);
			expect(compNode.on).to.be.undefined;
		});
		it('should return itself for method chaining', function() {
			var ComponentClass = Willow.createClass({
				componentDidMount: function () {
					expect(this.on).to.be.undefined;
				}
			});
			expect(ComponentClass.on('test', {
				name: 'hello',
				run: function(){}
			})).to.equal(ComponentClass);

			var compNode = utils.renderIntoDocument(<ComponentClass />);
			expect(compNode.on).to.be.undefined;
		});
		it('should not allow event handlers without a name', function() {
			var comp = Willow.createClass({});
			expect(function(){
				comp.on('test', {
					run: function(){}
				});
			}).to.throw({
				message: 'An event handler name is required.',
				status: 400,
				id: 'NONAME',
				params: {}
			});
		});
		it('should not allow bad values for the method attribute', function() {
			var comp = Willow.createClass({});
			expect(function(){
				comp.on('test', {
					name: 'hello',
					method: 'asf',
					run: function(){}
				});
			}).to.throw({
				message: 'Invalid method "{method}"',
				status: 400,
				id: 'BADMETHOD',
				params: {method: 'asf'}
			});
		});
		it('should not allow event handlers with non-array dependencies', function() {
			var comp = Willow.createClass({});
			expect(function(){
				comp.on('test', {
					name: 'hello',
					dependencies: 'face',
					run: function(){}
				});
			}).to.throw({
				message: '`dependencies` property must be an array',
				status: 400,
				id: 'BADDEPS',
				params: {}
			});
		});
		it('should not allow event handlers with non-string dependency elements', function() {
			var comp = Willow.createClass({});
			expect(function(){
				comp.on('test', {
					name: 'hello',
					dependencies: [4],
					run: function(){}
				});
			}).to.throw({
				message: 'All dependencies must be strings',
				status: 400,
				id: 'BADDEPS',
				params: {}
			});
			expect(function(){
				comp.on('test', {
					name: 'hello',
					dependencies: [null],
					run: function(){}
				});
			}).to.throw({
				message: 'All dependencies must be strings',
				status: 400,
				id: 'BADDEPS',
				params: {}
			});
			expect(function(){
				comp.on('test', {
					name: 'hello',
					dependencies: [true],
					run: function(){}
				});
			}).to.throw({
				message: 'All dependencies must be strings',
				status: 400,
				id: 'BADDEPS',
				params: {}
			});
		});
		it('should work on the class but not on the node', function() {
			var ComponentClass = Willow.createClass({}).on('test', {
				name: 'hello',
				method: 'get',
				dependencies: [],
				run: function(){}
			});
			var compNode = utils.renderIntoDocument(<ComponentClass />);
			expect(compNode.hasHandler('test', 'hello')).to.be.true;
		});
	});

	describe('trigger', function() {
		// Setup
		var event1TestSpy = sinon.stub().callsArg(1);			// calls the resolve method
		var event1AnotherTestSpy = sinon.stub().callsArg(1);	// calls the resolve method
		var Comp = Willow.createClass({
			render: function() {
				return (<h1>Hello World</h1>);
			}
		})
		.on('event1', {
			name: 'event1.test',
			method: 'local',
			dependencies: [],
			run: event1TestSpy
		})
		.on('event1', {
			name: 'event1.anotherTest',
			method: 'local',
			dependencies: ['event1.test'],
			run: event1AnotherTestSpy
		});
		var compNode = utils.renderIntoDocument(<Comp />);

		// Tests
		it('should exist', function() {
			expect(compNode.trigger).not.to.be.undefined;
		});
		it('should cause the appropriate event handlers to run', function() {
			event1TestSpy.reset();
			event1AnotherTestSpy.reset();
			compNode.trigger('event1')({prop1: 'hello1'});
			expect(event1TestSpy.called).to.be.true;
			expect(event1AnotherTestSpy.calledAfter(event1TestSpy)).to.be.true;
		});
		it('should be able to bubble trigger events to parents asynchronously', function(cb) {
			var childSpy = sinon.stub().callsArg(1);
			var parentSpy = sinon.stub().callsArg(1);
			var ChildComp = Willow.createClass({
				render: function() {
					return (<h1>Hello World</h1>);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: childSpy
			});

			var ParentBuild = Willow.createClass({
				render: function() {
					return (
						<div>
							<ChildComp name="child" trigger={this.trigger} events={{event1: {sync: true}}} />
						</div>
					);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: parentSpy
			});

			var parentNode = utils.renderIntoDocument(<ParentBuild name="parent" />);

			var childNode = TestUtils.findRenderedComponentWithType(parentNode, ChildComp);
			childNode.trigger('event1')({hello: 'world'});

			expect(childSpy.called).to.be.true;
			setTimeout(function() {
				expect(parentSpy.called).to.be.true;
				expect(parentSpy.calledAfter(childSpy)).to.be.true;
				cb();
			}, 100);
		});
		it('should be able to bubble trigger events to parents synchronously', function(cb) {
			var childSpy = sinon.stub().callsArg(1);
			var parentSpy = sinon.stub().callsArg(1);
			var childCalledAt = null;
			var parentCalledAt = null;
			var ChildComp = Willow.createClass({
				events: {
					'event1': {
						bubbles: true,
						sync: false
					}
				},
				render: function() {
					return (<h1>Hello World</h1>);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: function(e, resolve, reject) {
					childCalledAt = new Date();
					setTimeout(function() {
						childSpy(e, resolve, reject);
					}, 500);
				}
			});

			var ParentBuild = Willow.createClass({
				render: function() {
					return (
						<div>
							<ChildComp name="child" trigger={this.trigger} events={{event1: {sync: true}}} />
						</div>
					);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: function(e, resolve, reject) {
					parentCalledAt = new Date();
					parentSpy(e, resolve, reject);
				}
			});

			var parentNode = utils.renderIntoDocument(<ParentBuild name="parent" />);

			var childNode = TestUtils.findRenderedComponentWithType(parentNode, ChildComp);
			childNode.trigger('event1')({hello: 'world'});

			setTimeout(function() {
				expect(childSpy.called).to.be.true;
				expect(parentSpy.called).to.be.true;
				expect(parentSpy.calledAfter(childSpy)).to.be.true;
				expect(parentCalledAt.getTime() - childCalledAt.getTime()).to.be.gte(500);
				cb();
			}, 700);
		});

		it('synchronous events should wait for child to complete before calling parent', function() {
			var childSpy = sinon.stub();
			var parentSpy = sinon.stub().callsArg(1);
			var childCalledAt = null;
			var parentCalledAt = null;
			var ChildComp = Willow.createClass({
				events: {
					'event1': {
						bubbles: true,
						sync: false
					}
				},
				render: function() {
					return (<h1>Hello World</h1>);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: function(e, resolve, reject) {
					childSpy();
					setTimeout(function() {
						resolve();
					}, 500);
				}
			});

			var ParentBuild = Willow.createClass({
				render: function() {
					return (
						<div>
							<ChildComp name="child" trigger={this.trigger} events={{event1: {sync: true}}} />
						</div>
					);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: function(e, resolve, reject) {
					parentCalledAt = new Date();
					parentSpy(e, resolve, reject);
				}
			});

			var parentNode = utils.renderIntoDocument(<ParentBuild name="parent" />);

			var childNode = TestUtils.findRenderedComponentWithType(parentNode, ChildComp);
			childNode.trigger('event1')({hello: 'world'});

			expect(childSpy.called).to.be.true;
			expect(parentSpy.called).to.be.false;
		});

		it('should allow events to be triggered from event handlers', function(cb) {
			var OtherComp = Willow.createClass({
				render: function() {
					return (<h1>Hello World</h1>);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: function(e, resolve, reject) {
					this.trigger('event2')(e);
				}
			})
			.on('event2', {
				name: 'other',
				method: 'local',
				dependencies: [],
				run: function(e, resolve, reject) {
					expect(e.info).to.equal('yes');
					cb();
				}
			});

			var otherCompNode = utils.renderIntoDocument(<OtherComp name="parent" />);
			otherCompNode.trigger('event1')({info: 'yes'});
		});
	});

	describe('clone', function() {
		it('should exist', function() {
			expect(Willow.createClass().prototype._willow.clone).not.to.be.undefined;
		});
		it('should duplicate the existing state', function() {
			var ComponentClass = Willow.createClass({foo1: 'bar1'});
			var state = ComponentClass.prototype._willow;
			state.setEvents({foo2: 'bar2'});
			state.setMetadata({foo3: 'bar3'});
			state.setRequires({foo4: 'bar4'});
			state.setConfig({foo5: 'bar5'});

			var newState = state.clone();

			expect(newState.getContents()).to.deep.equal(state.getContents());
			expect(newState.getEvents()).to.deep.equal(state.getEvents());
			expect(newState.getMetadata()).to.deep.equal(state.getMetadata());
			expect(newState.getRequires()).to.deep.equal(state.getRequires());
			expect(newState.getConfig()).to.deep.equal(state.getConfig());

			state.setContents({baz1: 'bop1'});
			state.setEvents({baz2: 'bop2'});
			state.setMetadata({baz3: 'bop3'});
			state.setRequires({baz4: 'bop4'});
			state.setConfig({baz5: 'bop5'});

			expect(newState.getContents()).not.to.deep.equal(state.getContents());
			expect(newState.getEvents()).not.to.deep.equal(state.getEvents());
			expect(newState.getMetadata()).not.to.deep.equal(state.getMetadata());
			expect(newState.getRequires()).not.to.deep.equal(state.getRequires());
			expect(newState.getConfig()).not.to.deep.equal(state.getConfig());
		});
	});

	describe('run', function() {
		var Comp = Willow.createClass({
			render: function() {
				return (<h1>Hello World</h1>);
			}
		})
		.on('baz', {
			name: 'hello',
			dependencies: [],
			run: function(e, resolve, reject) {
				var pieces = e.echo.split('-');
				var obj = {};
				obj[pieces[0]] = pieces[1];
				resolve(obj);
			}
		});

		it('should exist', function() {
			expect(Comp.run).not.to.be.undefined;
		});
		it('should reject invalid events', function(done) {
			Comp.run(
				'foo',
				'bar',
				{},
				'local',
				function(data) {},
				function(err) {
					expect(err.message).to.equal('Component has no event {{event}}.');
					expect(err.status).to.equal(404);
					expect(err.id).to.equal('NOEVENT');
					expect(err.params.event).to.equal('foo');
					done();
				}
			);
		});
		it('should reject invalid handlers', function(done) {
			Comp.run(
				'baz',
				'bar',
				{},
				'local',
				function(data) {},
				function(err) {
					expect(err.message).to.equal('Component has no handler {{event}}/{{handler}}.');
					expect(err.status).to.equal(404);
					expect(err.id).to.equal('NOHANDLER');
					expect(err.params.event).to.equal('baz');
					expect(err.params.handler).to.equal('bar');
					done();
				}
			);
		});
		it('should reject invalid methods', function(done) {
			Comp.run(
				'baz',
				'hello',
				{},
				'post',
				function(data) {},
				function(err) {
					expect(err.message).to.equal('run(...) call expected {{expectedMethod}} but {{event}}/{{handler}} has method {{actualMethod}}.');
					expect(err.status).to.equal(400);
					expect(err.id).to.equal('BADCALL');
					expect(err.params.event).to.equal('baz');
					expect(err.params.handler).to.equal('hello');
					expect(err.params.expectedMethod).to.equal('local');
					expect(err.params.actualMethod).to.equal('post');
					done();
				}
			);
		});
		it('should accept valid methods', function(done) {
			Comp.run(
				'baz',
				'hello',
				{
					echo: 'hello-world'
				},
				'local',
				function(data) {
					expect(data).to.deep.equal({ hello: 'world' });
					done();
				},
				function(err) {
					console.log(err);
				}
			);
		});
	});

	describe('hasHandler', function() {
		var CompClass = Willow.createClass({}).on('test', {
			name: 'hello',
			method: 'get',
			dependencies: [],
			run: function(){}
		});

		it('should return true for valid handlers', function() {
			expect(CompClass.prototype._willow.hasHandler('test', 'hello')).to.be.true;
			expect(CompClass.prototype._willow.hasHandler('tesT', 'hello')).to.be.true;
		});

		it('should return alse for invalid handlers', function() {
			expect(CompClass.prototype._willow.hasHandler('test', 'HELLOp')).to.be.false;
			expect(CompClass.prototype._willow.hasHandler('testd', 'hello')).to.be.false;
			expect(CompClass.prototype._willow.hasHandler('foo', 'bar')).to.be.false;
			expect(CompClass.prototype._willow.hasHandler('test', 'Hello')).to.be.false;
		});
	});
});