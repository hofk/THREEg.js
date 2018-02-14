# THREEg

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
