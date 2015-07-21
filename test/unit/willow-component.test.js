/*global describe, it, before, beforeEach, after, afterEach, expect, utils, sinon */

var Willow = require('../../index.js');
var TestUtils = require('react/addons').addons.TestUtils;
describe('willow-component', function() {

	describe('on', function() {
		it('should exist on classes', function() {
			var ComponentClass = Willow.createClass({});
			expect(ComponentClass.on).not.to.be.undefined;
		});
		it('should exist on nodes', function() {
			var ComponentClass = Willow.createClass({});
			var compNode = utils.renderIntoDocument(<ComponentClass />);
			expect(compNode.on).not.to.be.undefined;
		});
		it('should return itself for method chaining', function() {
			var ComponentClass = Willow.createClass({
				componentDidMount: function () {
					expect(this.on('test', {
						name: 'pancakes',
						run: function(){}
					})).to.equal(this);
				}
			});
			expect(ComponentClass.on('test', {
				name: 'hello',
				run: function(){}
			})).to.equal(ComponentClass);

			var compNode = utils.renderIntoDocument(<ComponentClass />);
			expect(compNode.on('test', {
				name: 'goodbye',
				run: function(){}
			})).to.equal(compNode);
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
		it('should work both on the class and on the node', function() {
			var ComponentClass = Willow.createClass({}).on('test', {
				name: 'hello',
				dependencies: [],
				run: function(){}
			});
			var compNode = utils.renderIntoDocument(<ComponentClass />);
			expect(compNode._willow.events.test.hello.name).to.equal('hello');

			compNode.on('test', {
				name: 'goodbye',
				dependencies: ['hello'],
				run: function(){}
			});
			expect(compNode._willow.events.test.goodbye.dependencies[0]).to.equal('hello');
		});

		it('should not modify the class when called on the node', function() {
			var ComponentClass = Willow.createClass({}).on('test', {
				name: 'hello',
				dependencies: [],
				run: function(){}
			});
			var compNode = utils.renderIntoDocument(<ComponentClass />);

			compNode.on('test', {
				name: 'goodbye',
				dependencies: ['hello'],
				run: function(){}
			});
			expect(ComponentClass.prototype._willow.events.test.goodbye).to.be.undefined;
			expect(compNode._willow.events.test.goodbye).not.to.be.undefined;
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
	});

	describe('toString', function() {
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
			expect(Comp.toString).not.to.be.undefined;
		});
		it('should return a valid javascript object', function() {
			var obj;
			eval('obj = '+Comp.toString());
			console.log(obj);
			expect(obj.contents).not.to.be.undefined;
			expect(obj.contents.render).not.to.be.undefined;
		});
		it('should convert events properly', function() {
			var Comp2 = Willow.createClass({
				render: function() {
					return (<h1>Hello World</h1>);
				}
			})
			.require('_', 'lodash', 'server')
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: function() {

				}
			})
			.on('event1', {
				name: 'event1.anotherTest',
				method: 'local',
				dependencies: ['event1.test'],
				run: function() {

				}
			});

			var obj;
			eval('obj = '+Comp2.toString());
			expect(obj.events).not.to.be.undefined;
			expect(obj.events.event1).not.to.be.undefined;
			expect(obj.events.event1['event1.test']).not.to.be.undefined;
			expect(obj.events.event1['event1.test'].name).not.to.be.undefined;
			expect(obj.events.event1['event1.test'].name).to.equal('event1.test');
			expect(obj.metadata).not.to.be.undefined;
			expect(obj.requires).not.to.be.undefined;
			expect(obj.requires.server._).to.equal('lodash');
		});
		it('should only should be able to only show local events', function() {
			var Comp2 = Willow.createClass({
				render: function() {
					return (<h1>Hello World</h1>);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: function() {

				}
			})
			.on('event1', {
				name: 'event1.anotherTest',
				method: 'post',
				dependencies: ['event1.test'],
				run: function() {

				}
			});

			var obj;
			eval('obj = '+Comp2.toString(true));
			expect(obj.events).not.to.be.undefined;
			expect(obj.events.event1).not.to.be.undefined;
			expect(obj.events.event1['event1.test']).not.to.be.undefined;
			expect(obj.events.event1['event1.test'].name).not.to.be.undefined;
			expect(obj.events.event1['event1.test'].name).to.equal('event1.test');
			expect(obj.events.event1['event1.anothertest']).to.be.undefined;
			expect(obj.metadata).not.to.be.undefined;
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
					expect(data.hello).to.deep.equal({ hello: 'world' });
					done();
				},
				function(err) {
					console.log(err);
				}
			);
		});
	});

	describe('metadata', function() {
		it('should exist', function() {
			expect(Willow.createClass().metadata).not.to.be.undefined;
		});
		it('should return itself for method chaining when passed a function argument', function() {
			var comp = Willow.createClass({});
			expect(comp.metadata(function(){})).to.equal(comp);
		});
		it('should return a metadata object when passed a non-function argument', function() {
			var comp = Willow.createClass({}).metadata(function(test) {
				return {
					value: test
				};
			});
			expect(comp.metadata('hello')).to.deep.equal({value: 'hello'});
		});
	});

	describe('require', function() {
		it('should exist', function() {
			expect(Willow.createClass({}).require).not.to.be.undefined;
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
			expect(function() {CompClass.require('hello', 7)}).to.throw({
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
		it('should load the proper required modules before the component mounts on the server', function() {
			var CompClass = Willow.createClass({}).require('_', 'lodash', 'server');
			var compNode = utils.renderIntoDocument(<CompClass />);
			expect(compNode.requires).not.to.be.undefined;
			expect(compNode.requires._).not.to.be.undefined;
			expect(compNode.requires._.isFunction).not.to.be.undefined;
		});
	});

	// describe('requires', function() {
	// 	Comp.require('_', 'lodash', 'client');

	// 	it('should exist', function() {
	// 		expect(Willow.createClass({}).requires).not.to.be.undefined;
	// 	});
	// 	it('should return an object with all the required modules', function() {
	// 		var comp = Willow.createClass({}).require('_', 'lodash', 'client');
	// 		expect(comp.requires().client._).to.equal('lodash');
	// 	});
	// });
});