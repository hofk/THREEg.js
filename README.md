# THREEg
---
three. js addon to create special or extended geometries.
The addon generates non indexed BufferGeometries. This allows an explosion representation.

//

@author hofk / http://sandbox.threejs.hofk.de/

//
---

The first geometry in THREEg  is an #enlarged sphere. 
It is made up of eight parts. Multi material is supported.

```javascript
	geometry = new THREE.BufferGeometry();
	geometry.createMagicSphere = THREEg.createMagicSphere; // insert the methode from THREEg.js
	geometry.createMagicSphere( parameters ); // apply the methode
	
	// mesh
	mesh = new THREE.Mesh( geometry, materials );
  scene.add( mesh );
 ``` 
 
  Include: <script src="THREEg.js"></script>
  
  Example:
  ```javascript
  geometry = new THREE.BufferGeometry();
  
	geometry.createMagicSphere = THREEg.createMagicSphere; // insert the methode from THREEg.js
  
	geometry.createMagicSphere( 
  
 	  equator: 8,
	  contourmode: 'bezier',
	  parts: [ 1, 1, 1, 0, 0, 1, 1, 1 ],
	  radius: function( t ){ return  1.2 * ( 0.3 + Math.abs( Math.sin( 0.4 * t ) ) ) },
	  pointX: function( t ){ return  0.6 * ( 1 + Math.sin( 0.4 * t) ) },
	  pointY: function( t ){ return  0.4 * ( 1 + Math.sin( 0.3 * t) ) },
  
  ); 
	  
  ``` 
  
