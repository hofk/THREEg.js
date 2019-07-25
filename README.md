# THREEg.js

#### A three.js addon to create special or extended geometries.

The addon generates indexed or non indexed BufferGeometries. Non indexed allows an explosion representation.

@author hofk / http://sandbox.threejs.hofk.de/
 or http://sandboxthreeg.threejs.hofk.de/
 

For more efficiency.

Each single geometry section between ............................. name ............................. can be deleted.


---
 
..................................... Magic Box ................................................

An enlarged box. Non indexed BufferGeometry.
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
 
*further information:*

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
 
  }
 
 ---
 

 ..................................... Magic Sphere .............................................

An enlarged sphere. Non indexed BufferGeometry.
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

..................................... Labyrinth-3D-2D ..........................................

Easy to design 3D and 2D Labyrinth Geometry. Non indexed BufferGeometry.
It is realized as one non-indexed BufferGeometry. Multi material is supported.


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
 	design: arrays as in the examples
 	m: arrays for material index as in the examples


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
	
	];
		
*/


``` 

 
#### EXAMPLES:

```javascript
 
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
 
 ---

..................................... Line Grid ...................................................

Easy to design Line Grid Geometry. Non indexed BufferGeometry.

The line grid can either be created in the xy-plane, or you can design grids on the sides of a box.

```javascript

var gridGeometry = new THREE.BufferGeometry( );
gridGeometry.createLineGrid = THREEg.createLineGrid;
gridGeometry.createLineGrid( designGrid, multi material, width, height, depth );
var grid = new THREE.LineSegments( gridGeometry, materials );

 ```

parameters:

	designGrid: arrays as in the examples
	If the design results in double lines at one position, the surplus line is eliminated.

  optional are
  
	multi material:  mode 'align' (2 materials) or 'side' (default, up to 6 materials)
	width, height, depth:

 	For a box.
	The size of the box is determined by the design by default, but can also be specified as required.
	The length of the first line in the design of each side is decisive for the centering of the design.
	You can easily change the centering by using blanks at the beginning and end.

Include: <script src="THREEg.js"></script>

```javascript

// Description of the design in THREEg.js section Line Grid.

// ..................................... Line Grid ...................................................

/*
	design: array :
	
	icons
	The characters on the keyboard have been chosen so that they roughly reflect the form.
	
	description
	lines l f r b is left front right back
	
	char lines
	G	l f r b		// compatible to labyrinth design
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
	
	special signs
	#	Grid with complete squares, equals G
	
	+	All the neighboring squares are connected.
*/


``` 

 
#### EXAMPLES:

```javascript

// Note: Half the length of the first string on each plane determines the center of the design.
	
	var designPlaneNo1 =[	// is created on the x-y plane
	'        +        ',// spaces after + -->  length of first row, center of design
	'        +  ',
	'    .F7.-.F7. ', 
	'    I.  G  .1 ',
	'    I L. .J 1 ',
	'    I   H   1 ',
	'## : U C 3 M : ## ',
	'    I   H   1 ',
	'    I F- -7 1 ',
	'    I-  H  -1 ',
	'    -LJ-.-LJ- ',
	'        +',
	'        +'
	];
	
	var designBoxNo2 = [
	
	[], // no px
	[], // no nx
	[   // py
	'+++++++',
	'++   ++',
	'+ 7 F +',
	'  1 I  ',
	'+ J L +',
	'++   ++',
	'++   ++'
	],
	[  // ny
	'### + ###',
	'## +++  #',
	'#  + +  #',
	'#   H   #',
	'   : :   ',
	'#   H   #',
	'#  L.J  #',
	'##     ##',
	'###   ###'
	],
	[   // pz
	'+++++++++',
	'+++###+++',
	'##     ##',
	'##  +  ##',
	'##     ##',
	'+++ H +++',
	'+++###+++'
	]   // no nz
	];


 ``` 
 
 
 ---

..................................... Profiled Contour Geometry MultiMaterial ...................................................

The geometry is realized as indexed BufferGeometry and supports two MultiMaterial modes.
Each an array with the 2D coordinates of the profile shape and the frame contour is required.

```javascript
	geometry = new THREE.BufferGeometry();	
	geometry.createProfiledContourMMgeometry = THREEg.createProfiledContourMMgeometry;
	geometry.createProfiledContourMMgeometry( profileShape, contour, contourClosed, openEnded, profileMaterial );
	// mesh
	mesh = new THREE.Mesh( geometry, materials );
        scene.add( mesh );

 ``` 

parameters:

 	profileShape: array with coordinate pairs
 	contour: array  with coordinate pairs
 
 optional are

 	contourClosed: if true (default) the last point is connected to the first one
 	openEnded: if true the ends are not closed, default is false
 	profileMaterial: true - each section of the profile has an increased material index,
	false (default) - each contour surface has an increased material index

Include: <script src="THREEg.js"></script>
 
 
#### EXAMPLE:

```javascript

var profileShape = [];
for ( var i = 0; i < 8; i ++ ){	
   profileShape.push ( 0.5 * Math.cos( i / detail * Math.PI * 2 ), 0.5 * Math.sin( i / detail * Math.PI * 2 ) ); }
var contour = [-3,4, 0,4, 4,4, 2,1, 4,-2, 0,-3, -4,-3,	-4,0 ];
var materials = [ // rainbow-colored	
	new THREE.MeshPhongMaterial( { color: 0xfa0001, side: THREE.DoubleSide } ),
	new THREE.MeshPhongMaterial( { color: 0xff7b00, side: THREE.DoubleSide } ),
	new THREE.MeshPhongMaterial( { color: 0xf9f901, side: THREE.DoubleSide } ),
	new THREE.MeshPhongMaterial( { color: 0x008601, side: THREE.DoubleSide } ),
	new THREE.MeshPhongMaterial( { color: 0x01bbbb, side: THREE.DoubleSide } ),
	new THREE.MeshPhongMaterial( { color: 0x250290, side: THREE.DoubleSide } ),	
	new THREE.MeshPhongMaterial( { color: 0xfc4ea5, side: THREE.DoubleSide } ),
	new THREE.MeshPhongMaterial( { color: 0x83058a, side: THREE.DoubleSide } ),
	new THREE.MeshPhongMaterial( { color: 0x83058a, side: THREE.DoubleSide } )	
]
var geometry = new THREE.BufferGeometry( );
geometry.createProfiledContourMMgeometry = THREEg.createProfiledContourMMgeometry;
geometry.createProfiledContourMMgeometry( profileShape, contour, false, false, true );
// mesh
var fullProfile = new THREE.Mesh( geometry, materials );
scene.add( fullProfile );

 ``` 
  

 ---

.................................................................... Road / Wall ..............................................................................

The geometry is realized as indexed BufferGeometry and supports MultiMaterial. 



```javascript
	geometry = new THREE.BufferGeometry();
	
	g.createRoad = THREEg.createRoad;
	g.createRoad( curvePoints, lengthSegments, trackDistances );	
   // or
	g.createWall = THREEg.createWall;
	g.createWall( curvePoints, lengthSegments, sidesDistances, widthDistance, hightDistance );
		
	// mesh
	mesh = new THREE.Mesh( geometry, materials );
        scene.add( mesh );

 ``` 


parameters: 

	(all optional)
	
 	curvePoints: Array  with groups of 3 coordinates each for CatmullRomCurve3, are converted to Vector3.   
	lengthSegments: Number of segments for the length of the road.
	
	trackDistances: Array with distances to the center of the street (curve).
	
	sidesDistances: Array of 4 arrays with distances for sides left, top, right, bottom. If [] the side is not created.
	widthDistance: Distance between left and right side. If not specified, the width of the top page is used.
	hightDistance: Distance between top and bottom side. If not specified, the height of the left page is used.
		
Include: <script src="THREEg.js"></script>
 	
####  EXAMPLE: road

```javascript
var curvePoints =  [
 -25, 0.2, -25,
 -24, 0.2, -24,
 -4, 2, -9,
 4, 1, -6,
 6, 0, 0,
 -3, 1, 1,
 -11, 0, 6,
 -12, 1, 1,
 -7, 1, -3,
 7, 8, -9,
 13, 2, -12,
];
var lengthSegments = 200;
var trackDistances = [ -0.62, -0.6, -0.02, 0.02, 0.6, 0.62 ];

var g = new THREE.BufferGeometry( );
g.createRoad = THREEg.createRoad;
g.createRoad( curvePoints, lengthSegments, trackDistances );

tex = new THREE.TextureLoader().load( 'CentralMarking.png' );
tex.wrapS = THREE.RepeatWrapping;
tex.repeat.set( lengthSegments / 2 );
var material = [	
	new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, wireframe: true} ),
	new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, wireframe: true} ),
	new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide, wireframe: true } ),
	new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide} ),
	new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} ),	
];
// mesh
var mesh = new THREE.Mesh( g, material );
scene.add( mesh );

``` 
![CentralMarking](CentralMarking.png)  CentralMarking.png

	g.t = []; // tangents
	g.n = []; // normals
	g.b = []; // binormals
	
are stored in the geometry, see example RoadRace.html	


 	
####  EXAMPLE: wall

```javascript

var curvePoints =  [
 -16, 0,  24,
  -2, 0,  24,
  10, 3,  16,
  14, 2,   6,
  28, 0,   4,
  22, 1,  -8,
  10, 2, -14,
   0, 5, -12,
  -4, 2,  -6,
 -16, 0,   0,
 -20, 3,   8,
 -24, 0,  24,
 -16, 0,  24  
];

var lengthSegments = 400;
var sidesDistances = [ [ -0.9, -0.3, 0.3, 0.9 ], [ -0.4, 0, 0.4 ], [ -0.9, -0.3, 0.3, 0.9 ], [ -0.9, 1.1 ] ];

var gWall = new THREE.BufferGeometry( );
gWall.createWall = THREEg.createWall;
gWall.createWall( curvePoints, lengthSegments, sidesDistances );
//gWall.createWall( ); // all parameters default

tex = new THREE.TextureLoader().load( 'brick.jpg' );
tex.wrapS = THREE.RepeatWrapping;
tex.wrapT = THREE.RepeatWrapping;
tex.repeat.set( lengthSegments / 2, 4 );

var material = [
		
	new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide } ),
	new THREE.MeshBasicMaterial( { color: 0xff8844, side: THREE.DoubleSide, wireframe: true } ),
	new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide, wireframe: true } ),
	new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } ),
	new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } ),
	new THREE.MeshBasicMaterial( { color: 0x128821, side: THREE.DoubleSide } ),
	new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide } ),
	new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide, wireframe: true } ),
	new THREE.MeshBasicMaterial( { color: 0x004400, side: THREE.DoubleSide } ),
	
];

var mesh = new THREE.Mesh( gWall, material );
scene.add( mesh );

 ``` 

 ---

.................................................................... Sphere Cut ..............................................................................

*see also TriangulationSphereWithHoles in addon THREEi.js (implicit surface)*

Sphere with up to 6 coordinate planes parallel holes.
There are two different designs of the faces.
The variants:
- completely symmetrical
- efficiently

The geometry is realized as indexed BufferGeometry and supports MultiMaterial. 

```javascript
	geometry = new THREE.BufferGeometry();
	
	g.createSphereCut = THREEg.createSphereCut;
        g.createSphereCut( p );

	// mesh
	mesh = new THREE.Mesh( geometry, materials ); // multimaterial array with 8 materials
        scene.add( mesh );

 ``` 


parameters:  (all parameters are optional)

	p = {
		radius,
		equator, // set to divisible by 4 if symmetric (min 8)
		cut, // array, [ px, nx, py, ny, pz, nz ] if symmetric max. 1/2 equator, otherwise equator, non-overlapping
		parts, // array, value 1 for octant, otherwise arbitrary - upper counterclockwise, lower clockwise
		symmetric // default is false
	}	



####  EXAMPLE:

From the geometry some values can be used for the connection with other forms.

g.radius,  g.cutRadius[ ], g.cutSegments[ ], g.cutDistance[ ]

```javascript
const g = new THREE.BufferGeometry( );
g.createSphereCut = THREEg.createSphereCut;
g.createSphereCut( { 
		radius: 2,
		equator: 38, // is set to divisible by 4 (= 40) if symmetric: true
		cut: [ 6, 3, 10, 11, 12, 0 ], // if symmetric max. 1/2 equator, otherwise equator, non-overlapping
		parts: [ 1, 1, 1, 1, 1, 0, 0, 1 ], //  1 for create part, otherwise arbitrary
		//symmetric: true // default is false
} );

const mesh = new THREE.Mesh( g, material );  // multimaterial array with 8 materials
scene.add( mesh );

const cyliGeo0 = new THREE.CylinderBufferGeometry( g.cutRadius[ 0 ], g.cutRadius[ 0 ], g.radius, g.cutSegments[ 0 ], 4, true );
const cyli0 = new THREE.Mesh( cyliGeo0, new THREE.MeshBasicMaterial( { color: 0x0000aa, side: THREE.DoubleSide, wireframe: true } ), );
scene.add( cyli0 );
cyli0.rotation.z = Math.PI / 2;
cyli0.position.x = g.radius / 2 + g.cutDistance[ 0 ];

const cyliGeo2 = new THREE.CylinderBufferGeometry( g.cutRadius[2], g.cutRadius[2], g.radius, g.cutSegments[ 2 ], 4, true  );
const cyli2 = new THREE.Mesh( cyliGeo2, new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, wireframe: true } ), );
scene.add( cyli2 );
cyli2.position.y = g.radius / 2 + g.cutDistance[2];


 ``` 


