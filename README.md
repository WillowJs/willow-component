# willow-component

```js
{
	name: 'upload',
	method: 'post',
	dependencies: ['validate'],
	middleware: ['isLoggedIn'],
	run: function(e, resolve, reject) {
		// ... code goes here
	}
}