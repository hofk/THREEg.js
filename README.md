# THREEg.js

three. js addon to create special or extended geometries.

The addon generates non indexed BufferGeometries. This allows an explosion representation.

@author hofk / http://sandbox.threejs.hofk.de/

---

The first geometry in THREEg  is an enlarged sphere. 
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
  
  #### Example:
  
```javascript
geometry = new THREE.BufferGeometry();
geometry.createMagicSphere = THREEg.createMagicSphere; // insert the methode from THREEg.js
geometry.createMagicSphere( {
  
	equator: 8,
	contourmode: 'bezier',
	parts: [ 1, 1, 1, 0, 0, 1, 1, 1 ],
	radius: function( t ){ return  1.2 * ( 0.3 + Math.abs( Math.sin( 0.4 * t ) ) ) },
	pointX: function( t ){ return  0.6 * ( 1 + Math.sin( 0.4 * t) ) },
	pointY: function( t ){ return  0.4 * ( 1 + Math.sin( 0.3 * t) ) },
  
 } ); 
	  
  ``` 
  
Parameters briefly explained in THREEg.js:

 ```javascript
	/*	parameter overview	--- all parameters are optional ---
	
	p = {
		
			// simple properties
		
		equator,
		uvmode,
		contourmode,
		
			// array, value 1 for octant, otherwise arbitrary - upper counterclockwise, lower clockwise
		parts, 
		
			// functions with  parameter time   // function ( t )
	
		radius,
		rounding,
		profile,		// y = f( x, t ),  0 < x < PI / 2, 0 < y < 1
		pointX,			// interval 0 to PI / 2
		pointY,			// interval 0 to 1
		driftX,
		driftY,
		driftZ,
		explod,			// factor for exploded view - non indexed BufferGeometry
		
	}	
	
	*/
 ``` 	
 ---
 
```javascript
/* defaults and // values
	
	equator: 6,
	uvmode: 0, //1
	contourmode: 'rounding'; // 'profile'  'bezier' 'linear' 
	parts: [ 1, 1, 1, 1, 1, 1, 1, 1 ],
	radius: function ( t ) { return 1 },
	rounding: function ( t ) { return 1 };
	profile: function ( x, t ) { return Math.sin( x ) };
	pointX: function ( t ) { return 0.001 };
	pointY: function ( t ) { return 0.999 };
	driftX: function ( t ) { return 0 };
	driftY: function ( t ) { return 0 };
	driftZ: function ( t ) { return 0 };
	explode: function ( t ) { return 0 };
*/

---

The second geometry in THREEg  is an enlarged box. 
It is made up of 26 parts. Multi material is supported.

```javascript
	geometry = new THREE.BufferGeometry();
	geometry.createMagicBox = THREEg.createMagicBox; // insert the methode from THREEg.js
	geometry.createMagicBox( parameters ); // apply the methode
	
	// mesh
	mesh = new THREE.Mesh( geometry, materials );
        scene.add( mesh );

 ``` 
 
  Include: <script src="THREEg.js"></script>
  
  #### Example:
  
```javascript
geometry = new THREE.BufferGeometry();
geometry.createMagicBox = THREEg.createMagicBox; // insert the methode from THREEg.js
geometry.createMagicBox( {
  
	smoothness: 1,
	radius: function( t ){ return 0.08 + 0.08 * Math.sin( 0.5 * t ) },
	materials: [ 3, 3, 4, 4, 5, 5, 9, 9, 9, 9, 9 ],
	width: function( t ){ return 0.7 + 0.3 * Math.sin( 0.5 * t ) },
	height: function( t ){ return 0.7 + 0.3 * Math.cos( 0.5 * t ) },
	depth: function( t ){ return 0.7 + 0.3 * Math.cos( 0.5 * t ) * Math.sin( 0.5 * t ) },
	
 } ); 
	  
  ``` 
  
    
Parameters briefly explained in THREEg.js:

 ```javascript
	/*	parameter overview	--- all parameters are optional ---
	p = {
		
			// simple properties
			
		widthSegments,
		heightSegments,
		depthSegments,
		smoothness,
		
		uvmode,
		contourmode,
		explodemode,
		
			// arrays (sides order +x, -x, +y, -y, +z, -z)
			
		sides, // values: no side: 0, complete: 1, in addition: no plane: 2, edgeless: 3, no corners: 4
		lidHinges // values for direction are 0: first, 1: second following axis (order x, y, z, x, y)
		materials, // index for 6 sides and for 3 edges (parallel to axis), 2 corners (+y, -y)		
		
			// functions with  parameter time   // function ( t )
	
		width,
		height,
		depth,
		radius,
		
		waffleDeep,		// depth of center vertex	
		rounding,
		profile,		// y = f( x, t ),  0 < x < PI / 2, 0 < y < 1
		pointX,			// normally interval 0 to PI / 2
		pointY,			// normally interval 0 to 1
		
		lidAngle0,		// lid angle to side
		lidAngle1,
		lidAngle2,
		lidAngle3,
		lidAngle4,
		lidAngle5,
		
		explode,
	}	
	
	*/
 ``` 
 ```javascript
/* defaults and // values
 // see THREEg.js	

*/
 
 ---

// contourmode 'rounding' 
		
	var y1 = 2 / pi * Math.asin( Math.sin( x ) );
	var y2 = Math.sin( x );	
	return y1 + g.rounding( t ) * ( y2 - y1 );
	
// contourmode 'profile', 'linear', 'bezier' implemented with function sinuslike ( x ) { ...

	/* Extension of a function y=f(x), 0 < x < pi2, 0 < y < 1 with f(0) = 0, f(pi2) = 1
		to a function with period 2*pi.
		// pi = Math.PI // pi2 = Math.PI / 2  
		// pX = pointX( t ) // pY = pointY( t )
	*/	
		
// 'linear'
			
	var m = ( 1 - pY ) / ( pi2 - pX );  
	return x > pX ? m * x + 1 - pi2 * m : pY / pX * x;
	
// 'bezier'
	var a = pi2 - 2 * pX;		
	if( a === 0 ) {				
		tm = x / ( 2 * pX );				
	} else {				
		var tp = pX / a;
		var tr = tp * tp  + x / a;				
		tm =  - tp + ( pX < pi2 / 2 ? 1 : -1 ) * Math.sqrt( tr );	
	}			
	return ( 1 - 2 * pY ) * tm * tm + 2 * pY * tm;	
  ... 
  }

 ``` 
