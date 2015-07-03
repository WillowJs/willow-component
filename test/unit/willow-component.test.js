var WillowComponent = require('../../index.js');
describe('willow-component', function() {

	// Some setup code...
	var Comp = WillowComponent.extend({
		render: function() {
			return (<h1>Hello World</h1>);
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
});