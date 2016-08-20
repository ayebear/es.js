// import 'es.js'
let es = require('../src/picoes.js')
let assert = require('chai').assert

describe('World', function() {
	describe('component()', function () {
		it('define a component', function () {
			let world = new es.World()
			world.component('position', function(x = 0, y = 0) {
				this.x = x
				this.y = y
			})
			let ent = world.entity().set('position', 1, 2)
			assert('position' in world.components)
			assert(Object.keys(world.components).length == 1)
			assert(ent.has('position'))
			assert(ent.get('position').x === 1)
			assert(ent.get('position').y === 2)
		})
		it('define an object component', function () {
			let world = new es.World()
			world.component('position', {
				x: 0,
				y: 0
			})
			let ent = world.entity().update('position', {
				x: 1,
				y: 2
			})
			let ent2 = world.entity().update('position', {
				x: 1
			})
			assert('position' in world.components)
			assert(Object.keys(world.components).length == 1)
			assert(ent.has('position'))
			assert(ent.get('position').x === 1)
			assert(ent.get('position').y === 2)
			assert(ent2.has('position'))
			assert(ent2.get('position').x === 1)
			assert(ent2.get('position').y === 0)
		})
		it('define an empty component', function () {
			let world = new es.World()
			world.component('position')
			let ent = world.entity().update('position', {
				x: 1
			})
			assert('position' in world.components)
			assert(Object.keys(world.components).length == 1)
			assert(ent.has('position'))
			assert(ent.get('position').x === 1)
			assert(!('y' in ent.get('position')))
		})
	})

	describe('system()', function() {
		it('define a system', function() {
			let world = new es.World()
			world.component('position')
			world.system(['position'], class {})
			assert(world.systems.length == 1)
		})
		it('system iteration', function() {
			let world = new es.World()
			world.component('position')
			world.component('velocity')
			world.system(['position', 'velocity'], class {
				every(position, velocity, ent) {
					assert(position)
					assert(velocity)
					position.x += velocity.x
					position.y += velocity.y
					assert(ent)
					assert(ent.has('position'))
					assert(ent.has('velocity'))
				}
			})
			let entA = world.entity()
			let entB = world.entity()
			entA.update('position', {x: 1, y: 1}).update('velocity', {x: 1, y: 0})
			entB.update('position', {x: 30, y: 40}).update('velocity', {x: -1, y: 2})

			assert(entA.get('position').x == 1 && entA.get('position').y == 1)
			assert(entB.get('position').x == 30 && entB.get('position').y == 40)

			world.run()

			assert(entA.get('position').x == 2 && entA.get('position').y == 1)
			assert(entB.get('position').x == 29 && entB.get('position').y == 42)

			world.run()

			assert(entA.get('position').x == 3 && entA.get('position').y == 1)
			assert(entB.get('position').x == 28 && entB.get('position').y == 44)
		})
	})

	describe('entity()', function() {
		it('create an entity', function() {
			let world = new es.World()
			world.component('position')
			let ent = world.entity()
			assert(Object.keys(world.entities).length == 1)
		})
		it('remove an entity', function() {
			let world = new es.World()
			world.component('position')
			let ent = world.entity()
			ent.set('position')
			ent.get('position').val = 100

			assert(Object.keys(world.entities).length == 1)
			assert(Object.keys(world.components).length == 1)
			assert(ent.has('position'))
			assert(ent.get('position').val === 100)
			assert(ent.valid())

			ent.destroy()

			assert(Object.keys(world.entities).length == 0)
			assert(Object.keys(world.components).length == 1)
			assert(!ent.valid())
			assert(!ent.has('position'))

			// Just for safe measure
			ent.destroy()

			assert(Object.keys(world.entities).length == 0)
			assert(Object.keys(world.components).length == 1)
			assert(!ent.valid())
			assert(!ent.has('position'))
		})
		it('get and set components', function() {
			let world = new es.World()
			world.component('position', function(x = 0, y = 0) {
				this.x = x
				this.y = y
			})
			world.component('object', {
				val: 0,
				test: 1
			})
			world.component('empty')
			let ent = world.entity()
			ent.set('position', 5)
			assert(Object.keys(ent.data).length == 1)
			assert(ent.get('position').x === 5)
			assert(ent.get('position').y === 0)

			ent.update('position', {y: 3})
			assert(Object.keys(ent.data).length == 1)
			assert(ent.get('position').x === 5)
			assert(ent.get('position').y === 3)

			ent.update('object', {val: 50})
			assert(Object.keys(ent.data).length == 2)
			assert(ent.get('object').val === 50)
			assert(ent.get('object').test === 1)

			ent.update('empty', {testing: 100})
			assert(Object.keys(ent.data).length == 3)
			assert(ent.get('empty').testing === 100)

			// Access test
			ent.removeAll()
			assert(!ent.has('position'))
			ent.access('position').x = 300
			assert(ent.has('position'))
			assert(ent.get('position').x === 300)

			// Get test
			ent.removeAll()
			assert(!ent.has('position'))
			assert(ent.get('position') === undefined)
			assert(!ent.has('position'))
			ent.set('position', 333)
			assert(ent.get('position').x === 333)
			assert(ent.get('position').y === 0)
		})
		it('remove components', function() {
			let world = new es.World()
			world.component('position')
			world.component('velocity')
			let ent = world.entity().set('position').set('velocity')
			assert(Object.keys(ent.data).length == 2)
			assert(ent.has('position'))
			assert(ent.has('velocity'))

			ent.remove('position')
			assert(Object.keys(ent.data).length == 1)
			assert(!ent.has('position'))
			assert(ent.has('velocity'))

			ent.remove('velocity')
			assert(Object.keys(ent.data).length == 0)
			assert(!ent.has('position'))
			assert(!ent.has('velocity'))

			ent.set('position').set('velocity')
			assert(Object.keys(ent.data).length == 2)
			assert(ent.has('position'))
			assert(ent.has('velocity'))
			ent.removeAll()
			assert(Object.keys(ent.data).length == 0)
			assert(!ent.has('position'))
			assert(!ent.has('velocity'))
		})
		it('serialize components', function() {
			let world = new es.World()
			world.component('position')
			let ent = world.entity().update('position', {x: 4, y: 6})

			let data = JSON.parse(ent.toJson())
			assert(data)
			assert(data.position)
			assert(data.position.x === 4)
			assert(data.position.y === 6)
		})
		it('deserialize components', function() {
			let world = new es.World()
			world.component('position')
			let ent = world.entity()
			assert(Object.keys(ent.data).length == 0)

			ent.fromJson('{"position": {"x": 4, "y": 6}}')
			assert(ent.has('position'))
			assert(Object.keys(ent.data).length == 1)
			assert(ent.get('position'))
			assert(ent.get('position').x === 4)
			assert(ent.get('position').y === 6)
		})
		it('check for existence of components', function() {
			let world = new es.World()

			// Test all three component types
			world.component('position', function(x = 0, y = 0) {
				this.x = x
				this.y = y
			})
			world.component('velocity', {
				x: 0,
				y: 0
			})
			world.component('player')

			let ent = world.entity()
				.set('position', 1, 2)
				.set('velocity', {x: 3, y: 4})
				.set('player')

			// Check for existence
			assert(ent.has('position') && ent.has('velocity') && ent.has('player'))
			assert(ent.has('position', 'velocity', 'player'))
			assert(!ent.has('position', 'invalid'))
			assert(!ent.has('velocity', 'invalid'))
			assert(!ent.has('player', 'invalid'))
		})
		it('register and use prototypes', function() {
			let world = new es.World()

			// Test all three component types
			world.component('position', function(x = 0, y = 0) {
				this.x = x
				this.y = y
			})
			world.component('velocity', {
				x: 0,
				y: 0
			})
			world.component('player')

			// Register prototypes in all ways
			world.prototype({Player: {
				position: {
					x: 5,
					y: 10
				},
				velocity: {
					x: 15,
					y: 20
				},
				player: {}
			}, Enemy: {
				position: {},
				velocity: {}
			}})
			let stringTest = JSON.stringify({Test: {
				position: {
					x: 3.14159,
					y: 5000
				}
			}})
			world.prototype(stringTest)

			// Create entities with the prototype
			let p = world.entity('Player')
			let e = world.entity('Enemy')
			let t = world.entity('Test')

			// Make sure all components exist and there are no extras
			assert(p.has('position', 'velocity', 'player'))
			assert(e.has('position', 'velocity') && !e.has('player'))
			assert(t.has('position') && !t.has('velocity') && !t.has('player'))

			// Make sure all component values are correct
			assert(p.get('position').x === 5 && p.get('position').y === 10)
			assert(p.get('velocity').x === 15 && p.get('velocity').y === 20)
			assert(p.get('player') !== undefined)
			assert(e.get('position').x === 0 && e.get('position').y === 0)
			assert(e.get('velocity').x === 0 && e.get('velocity').y === 0)
			assert(t.get('position').x === 3.14159 && t.get('position').y === 5000)
		})
	})
})