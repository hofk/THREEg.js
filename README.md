# THREEg.js

three. js addon to create special or extended geometries.

The addon generates non indexed BufferGeometries. This allows an explosion representation.

@author hofk / http://sandbox.threejs.hofk.de/
 or http://sandboxthreeg.threejs.hofk.de/

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
		explodemode,
		
			// array, value 1 for octant, otherwise arbitrary - upper counterclockwise, lower clockwise
		parts, 
		
			// functions with  parameter time   // function ( t )
	
		radius,
		rounding,
		profile,		// y = f( x, t ),  0 < x < PI / 2, 0 < y < 1
		pointX,			// normally interval 0 to PI / 2
		pointY,			// normally interval 0 to 1
		driftX,
		driftY,
		driftZ,
		explode,		// factor for exploded view - non indexed BufferGeometry
		
	}	
	
	*/
 ``` 	
 
```javascript
/* defaults and // values
	
	equator: 6,
	uvmode: 0, //1
	contourmode: 'rounding'; // 'profile'  'bezier' 'linear'
	explodemode: 'center'; // 'normal'
	
	parts: [ 1, 1, 1, 1, 1, 1, 1, 1 ],
	radius: function ( t ) { return 1 },
	rounding: function ( t ) { return 1 },
	profile: function ( x, t ) { return Math.sin( x ) },
	pointX: function ( t ) { return 0.001 },
	pointY: function ( t ) { return 0.999 },
	driftX: function ( t ) { return 0 },
	driftY: function ( t ) { return 0 },
	driftZ: function ( t ) { return 0 },
	explode: function ( t ) { return 0 },
*/
```
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
/* defaults and values

	widthSegments: 2,
	heightSegments: 2,
	depthSegments: 2,	
	smoothness: 4,
	
	uvmode: 0,
	contourmode: 'rounding', // 'profile' 'bezier' 'linear' 
	explodemode: 'center', // 'normal'
	
	sides: 		[ 1, 1, 1, 1, 1, 1 ],
	lidHinges:		[ 0, 0, 0, 0, 0, 0 ],
	materials: 		[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], // material index
	
	width: 		function ( t ) { return 1 },
	height: 		function ( t ) { return 1 },
	depth: 		function ( t ) { return 1 },
	radius: 		function ( t ) { return 0.1 },
	
	waffleDeep:		function ( t ) { return 0 },		
	rounding:		function ( t ) { return 1 },		
	profile: 		function ( x, t ) { return Math.sin( x ) },	
	pointX: 		function ( t ) { return 0.001 },
	pointY: 		function ( t ) { return 0.999 },
	
	lidAngle0:		function ( t ) { return 0 },
	lidAngle1:		function ( t ) { return 0 },
	lidAngle2:		function ( t ) { return 0 },
	lidAngle3:		function ( t ) { return 0 },
	lidAngle4:		function ( t ) { return 0 },
	lidAngle5:		function ( t ) { return 0 },
	
	explode:		function ( t ) { return 0 },	

*/
 ```
  ```javascript
  
  // box with 6 planes + 12 edges + 8 corners = 26 parts:
	
    var sideEdge = [        // edges    _____2_______
                            //         |            /          sites (planes)
    [  4,  7,  8,  9 ],     //     10/ |          9/|            ____________
    [  5,  6, 10, 11 ],     //      / 5|          / |           |            /
    [  2,  3,  9, 10 ],     //     /______3_____ / 4|         / |      |5|  /|
    [  0,  1,  8, 11 ],     //    |    |_____1__|___|        /  |   /2/    / |
    [  0,  3,  6,  7 ],     //    | 11/         |   /       /____________ /  |
    [  1,  2,  4,  5 ]      //   6|  /         7|  /8      |  1 |________|_0_|
                            //    | /           | /        |   /         |   /
    ];                      //    | ______0____ |/         |  /    /3/   |  /
                            //                             | /  |4|      | /
                            //                             | ___________ |/
    var sideCorner = [      // corners
                            //         1____________0
    [ 0, 3, 4, 7 ],         //         |            /
    [ 1, 2, 5, 6 ],         //       / |           /|
    [ 0, 1, 2, 3 ],         //      /  |          / |
    [ 4, 5, 6, 7 ],         //    2/____________3/  |
    [ 2, 3, 6, 7 ],         //    |    |________|___|
    [ 0, 1, 4, 5 ]          //    |   /5        |   4
                            //    |  /          |  /
    ];                      //    | /           | /
                            //    | ___________ |/
                            //    6             7
			    
  ```
 
 ---
further information:

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
 
 ---


Easy to design 3D and 2D Labyrinth Geometry is the third geometry in THREEg. It is realized as one non-indexed BufferGeometry. Multi material is supported.


```javascript
	geometry = new THREE.BufferGeometry();
	geometry.createLabyrinth = THREEg.createLabyrinth; // insert the methode from THREEg.js
	geometry.createLabyrinth(  dim, design, m ); // apply the methode
	
	// mesh
	mesh = new THREE.Mesh( geometry, materials );
        scene.add( mesh );

 ``` 

parameters:  
 dim: '2D' or '3D'
 design : arays as in the examples
 m: arays for material index as in the examples


 Include: <script src="THREEg.js"></script>
 
 

```javascript
// Description of the design in THREEg.js section Labyrinth-3D-2D 

// ..................................... Labyrinth-3D-2D .......................................

/*
	icons design 3D
	The characters on the keyboard have been chosen so that they roughly reflect the form.
	
	wall description
	sides l f r b is left front right back, with floor and roof
	
	char sides
	G	l f r b   can only be achieved by beaming
	M	l f r
	C	b l f
	3	f r b
	U	l b r
	H	l r
	:	f b
	F	l f
	7	f r
	L	l b
	J	b r
	I	l 
	1	r
	-	f
	.	b
	
	without walls
	since extra character not possible on the wall
	* roof and floor
	^ roofless
	v floorless
	x roofless and floorless
	
	with four side walls but roofless and floorless
	#
	
//--------------------------------------------------------------
	
	design 2D 
	only icon + 
	All the neighboring boxes are connected. There's no way out!
	
	var design2D = [  // will be converted to design 3D
	' ++++++++++   ',
	' +++  ++  ++  ',
	 // ...
	];
		
*/

//--------------------------------------------------------------
// EXAMPLES:

var design3D = [
	// upper storey first
	//23456789.......
	[
	'     M         G', // 1
	'     H          ', // 2
	'     H          ', // 3
	'   F-*--7       ', // 4
	'   I*7**1       ', // 5
	' C:v*L.**:::7   ', // 6
	'   L*...J   U   ', // 7
	'    H           ', // 8
	'    L::::3      '  // 9	
	],[
	'                ', // 1
	'                ', // 2
	'          G     ', // 3
	'                ', // 4
	'                ', // 5
	'   #            ', // 6
	'                ', // 7
	'                ', // 8
	'                '  // 9	
	],[
	'F::3            ', // 1
	'H    F:::::7    ', // 2
	'H    H     H    ', // 3
	'H  F-*-7   H    ', // 4
	'H  I****:::1    ', // 5
	'L::x***1   H    ', // 6
	'   I...J   H    ', // 7
	'   H   F:7 L:::7', // 8
	'   L:::J L:::::J'  // 9	
	]];
	
	// labyrinth material index
	var materialIndex3D = [
	// upper storey first
	// px, nx, py, ny, pz, nz 
	[ 0, 1, 2, 3, 4, 5 ], 
	[ 0, 0, 1, 1, 2, 2 ],
	[ 6, 7, 6, 7, 6, 7 ],
	];

//---------------------------------------------------------
		
	var design2D = [  // will be converted to design 3D
	' ++++++++++   ',
	' +++  ++  ++  ',
	' +++  +++     ',
	'++ ++ ++++++++',
	' +++++ + +   +',
	'   +  ++ +++++',
	'   ++++  +    '
	];
	
	var materialIndex2D = [
	
	// px, nx, py, ny, pz, nz 
	0, 1, 2, 3, 4, 5 
	
	];


 ``` 
 
  
