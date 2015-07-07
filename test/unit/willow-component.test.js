var WillowComponent = require('../../index.js');
var TestUtils = require('react/addons').addons.TestUtils;
describe('willow-component', function() {

	// Some setup code...
	var Comp = WillowComponent.extend({
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
	var BuiltComp = Comp.build();
	var compNode = utils.renderIntoDocument(<BuiltComp />);


	describe('on', function() {
		it('should exist on components', function() {
			expect(WillowComponent.extend().on).not.to.be.undefined;
		});
		it('should exist on nodes', function() {
			expect(compNode.on).not.to.be.undefined;
		});
		it('should return itself for method chaining', function() {
			var comp = WillowComponent.extend({});
			expect(comp.on('test', {
				name: 'hello',
				run: function(){}
			})).to.equal(comp);
		});
		it('should not allow event handlers without a name', function() {
			var comp = WillowComponent.extend({});
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
			var comp = WillowComponent.extend({});
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
			var comp = WillowComponent.extend({});
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
			var comp = WillowComponent.extend({});
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
	});

	describe('extend', function() {
		it('should exist on components', function() {
			expect(WillowComponent.extend).not.to.be.undefined;
		});
		it('should not exist on nodes', function() {
			expect(compNode.extend).to.be.undefined;
		});
		it('should return a willow component', function() {
			var comp = WillowComponent.extend({});
			expect(comp.extend).not.to.be.undefined;
			expect(comp.on).not.to.be.undefined;
			expect(comp.build).not.to.be.undefined;
		});
		it('should properly extend object attributes', function() {
			var parent = WillowComponent.extend({
				property: 'val',
				property2: 'a',
				componentWillMount: function() {
					this.trigger('render', {});
				},
				render: function() {
					return React.DOM.h1(null, "Hello, world!");
				}
			});

			expect(parent.peek().property).to.equal('val');
			expect(parent.peek().property2).to.equal('a');
			expect(parent.peek().componentWillMount).not.to.be.undefined;
			expect(parent.peek().render).not.to.be.undefined;
			expect(parent.peek().blah).to.be.undefined;

			var child = parent.extend({
				property: 'b'
			});

			expect(child.peek().property).to.equal('b');
			expect(child.peek().property2).to.equal('a');
		});
		it('should clear out old events for subsequent extends', function() {
			var Comp1 = WillowComponent.extend({
				render: function() {
					return (<div></div>);
				}
			})
			.on('test-event', {
				name: 'test-event-1',
				method: 'local',
				dependencies: [],
				run: function(e, resolve, reject) {
					resolve();
				}
			})
			.on('test-event', {
				name: 'test-event-2',
				method: 'local',
				dependencies: [],
				run: function(e, resolve, reject) {
					resolve();
				}
			})
			.build();

			var Comp2 = WillowComponent.extend({
				render: function() {
					return (<div></div>);
				}
			})
			.build();

			var c1 = utils.renderIntoDocument(<Comp1 />);
			var c2 = utils.renderIntoDocument(<Comp2 />);

			expect(c2.willow.events.handlers['test-event']).to.be.undefined;
		});
	});

	describe('trigger', function() {
		// Setup
		var event1TestSpy = sinon.stub().callsArg(1);			// calls the resolve method
		var event1AnotherTestSpy = sinon.stub().callsArg(1);	// calls the resolve method
		var Comp = WillowComponent.extend({
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
		var BuiltComp = Comp.build();
		var compNode = utils.renderIntoDocument(<BuiltComp />);

		// Tests
		it('should exist', function() {
			expect(compNode.trigger).not.to.be.undefined;
		});
		it('should cause the appropriate event handlers to run', function() {
			event1TestSpy.reset();
			event1AnotherTestSpy.reset();
			compNode.trigger('event1', {prop1: 'hello1'});
			expect(event1TestSpy.called).to.be.true;
			expect(event1AnotherTestSpy.calledAfter(event1TestSpy)).to.be.true;
		});
		it('handlers should be entended properly', function() {
			event1TestSpy.reset();
			event1AnotherTestSpy.reset();
			var CompExtended = Comp.extend({
				render: function() {
					return (<h1>Hello World!</h1>);
				}
			}, true);
			var BuiltCompExtended = CompExtended.build();
			var compExtendedNode = utils.renderIntoDocument(<BuiltCompExtended />);
			compExtendedNode.trigger('event1', {prop1: 'hello1'});
			expect(event1TestSpy.called).to.be.true;
			expect(event1AnotherTestSpy.called).to.be.true;
			expect(compExtendedNode.getDOMNode().innerHTML).to.equal('Hello World!');
		});
		it('should be able to bubble trigger events to parents asynchronously', function(cb) {
			var childSpy = sinon.stub().callsArg(1);
			var parentSpy = sinon.stub().callsArg(1);
			var ChildComp = WillowComponent.extend({
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
				run: childSpy
			});
			var ChildBuild = ChildComp.build();

			var ParentBuild = WillowComponent.extend({
				render: function() {
					return (
						<div>
							<ChildBuild name="child" trigger={this.trigger} events={{event1: {sync: true}}} />
						</div>
					);
				}
			})
			.on('event1', {
				name: 'event1.test',
				method: 'local',
				dependencies: [],
				run: parentSpy
			})
			.build();

			var parentNode = utils.renderIntoDocument(<ParentBuild name="parent" />);

			var childNode = TestUtils.findRenderedComponentWithType(parentNode, ChildBuild);
			childNode.trigger('event1', {hello: 'world'});

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
			var ChildComp = WillowComponent.extend({
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
			var ChildBuild = ChildComp.build();

			var ParentBuild = WillowComponent.extend({
				render: function() {
					return (
						<div>
							<ChildBuild name="child" trigger={this.trigger} events={{event1: {sync: true}}} />
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
			})
			.build();

			var parentNode = utils.renderIntoDocument(<ParentBuild name="parent" />);

			var childNode = TestUtils.findRenderedComponentWithType(parentNode, ChildBuild);
			childNode.trigger('event1', {hello: 'world'});

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
			var ChildComp = WillowComponent.extend({
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
			var ChildBuild = ChildComp.build();

			var ParentBuild = WillowComponent.extend({
				render: function() {
					return (
						<div>
							<ChildBuild name="child" trigger={this.trigger} events={{event1: {sync: true}}} />
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
			})
			.build();

			var parentNode = utils.renderIntoDocument(<ParentBuild name="parent" />);

			var childNode = TestUtils.findRenderedComponentWithType(parentNode, ChildBuild);
			childNode.trigger('event1', {hello: 'world'});

			expect(childSpy.called).to.be.true;
			expect(parentSpy.called).to.be.false;
		});
	});

	describe('toString', function() {
		it('should exist', function() {
			expect(Comp.toString).not.to.be.undefined;
		});
		it('should return a valid javascript object', function() {
			var obj;
			eval('obj = '+Comp.toString());
			expect(obj.contents).not.to.be.undefined;
			expect(obj.contents.render).not.to.be.undefined;
		});
		it('should convert events properly', function() {
			var Comp = WillowComponent.extend({
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
				method: 'local',
				dependencies: ['event1.test'],
				run: function() {

				}
			});

			var obj;
			eval('obj = '+Comp.toString());
			expect(obj.events).not.to.be.undefined;
			expect(obj.events.event1).not.to.be.undefined;
			expect(obj.events.event1['event1.test']).not.to.be.undefined;
			expect(obj.events.event1['event1.test'].name).not.to.be.undefined;
			expect(obj.events.event1['event1.test'].name).to.equal('event1.test');
		});
		it('should only should be able to only show local events', function() {
			var Comp = WillowComponent.extend({
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
			eval('obj = '+Comp.toString(true));
			expect(obj.events).not.to.be.undefined;
			expect(obj.events.event1).not.to.be.undefined;
			expect(obj.events.event1['event1.test']).not.to.be.undefined;
			expect(obj.events.event1['event1.test'].name).not.to.be.undefined;
			expect(obj.events.event1['event1.test'].name).to.equal('event1.test');
			expect(obj.events.event1['event1.anothertest']).to.be.undefined;
		});
	});

	describe('build', function() {
		it('should return a react component if we are running on the client', function() {
			var Comp = WillowComponent.extend({
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
			.build();

			var compNode = utils.renderIntoDocument(<Comp />);
			expect(compNode.getDOMNode).not.to.be.undefined;
			expect(compNode.props).not.to.be.undefined;
			expect(compNode.context).not.to.be.undefined;
			expect(compNode.state).not.to.be.undefined;
			expect(compNode.refs).not.to.be.undefined;
		});
	});

	describe('run', function() {
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
					expect(err.params.expectedMethod).to.equal('post');
					expect(err.params.actualMethod).to.equal('local');
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
					expect(data.hello).to.equal('world');
					done();
				},
				function(err) {
					console.log(err);
				}
			);
		});
	});
});