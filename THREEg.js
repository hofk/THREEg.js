// THREEg.js ( rev 89.0 )

/**
 * @author hofk / http://threejs.hofk.de/
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.THREEg = global.THREEg || {})));
}(this, (function (exports) {

'use strict';

var g;	// THREE.BufferGeometry (non indexed)

function createMagicSphere( p ) {
	
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

	if ( p === undefined ) p = {};
	
	g = this;  //  THREE.BufferGeometry() - geometry object from three.js
	
	g.driftXDefault = p.driftX === undefined ? true : false;
	g.driftYDefault = p.driftY === undefined ? true : false;
	g.driftZDefault = p.driftZ === undefined ? true : false;
	g.driftDefault = g.driftXDefault && g.driftYDefault && g.driftZDefault;
	g.explodeDefault = p.explode === undefined ? true : false;
	
	//............................................................set defaults
	
	g.equator = 	p.equator !== undefined ? p.equator	: 6;
	g.uvmode = 		p.uvmode !== undefined ? p.uvmode	: 0;
	g.contourmode =	p.contourmode !== undefined ? p.contourmode	: 'rounding'; // 'profile'  'bezier' 'linear' 
	
	g.parts = 		p.parts !== undefined ? p.parts	: [ 1, 1, 1, 1, 1, 1, 1, 1 ];
	
	g.radius = 		p.radius !== undefined ? p.radius		: function ( t ) { return 1 };
	
	g.rounding =	p.rounding !== undefined ? p.rounding	: function ( t ) { return 1 };
	
	g.profile = 	p.profile !== undefined ? p.profile		: function ( x, t ) { return Math.sin( x ) };
	
	g.pointX = 		p.pointX !== undefined ? p.pointX		: function ( t ) { return 0.001 };
	g.pointY = 		p.pointY !== undefined ? p.pointY		: function ( t ) { return 0.999 };
	
	g.driftX =		p.driftX !== undefined ? p.driftX		: function ( t ) { return 0 };
	g.driftY =		p.driftY !== undefined ? p.driftY		: function ( t ) { return 0 };
	g.driftZ = 		p.driftZ !== undefined ? p.driftZ		: function ( t ) { return 0 };
	
	g.explode = 	p.explode !== undefined ? p.explode		: function ( t ) { return 0 };
	
	//..............................................................................................
	
	var p = g.parts[ 4 ]; // mirror octants, due to uv order
	g.parts[ 4 ] = g.parts[ 7 ];
	g.parts[ 7 ] = p;
	p = g.parts[ 5 ];
	g.parts[ 5 ] = g.parts[ 6 ];
	g.parts[ 6 ] = p;
	
	g.buildMagicSphere = buildMagicSphere;
	g.morphVerticesMagicSphere = morphVerticesMagicSphere;
	
	g.buildMagicSphere();
	g.morphVerticesMagicSphere();
	
}

function buildMagicSphere( ) {
	
	g = this;
	
	var eqt = g.equator;
	var part;		// number of sphere part (0..7)
	
	var x, y, z, ux, uy;
	
	var signX, signY, signZ;
	
	var v8Idx = 0;	// start vertex index of sphere part
	var vIdx;		// vertex index
	var uvIdx;
	
	var ii1;
	var ii0;
	
	var f8Idx = 0;	// start face index of sphere part
	var fIdx;		// face index
	var fPos;		// face position a or b or c 
	
	var a, b, c;
		
	var vFace = [ ];
	var vPos = [ ];
	var vLoc = [ false, false, false ];	// vertex location:  left edge, right edge, bottom edge
	
	var theta;
	var phi;
			
	g.partCount = 0;
	
	for ( var p = 0; p < 8; p ++) {
		
		g.partCount += g.parts[ p ] === 1 ? 1 : 0;
		
	}
	
	const pi2 = Math.PI / 2;
	
	// const uva = 0; // uv index offset, triangle corners a, b, c
	const uvb = 2;
	const uvc = 4;

	function pushFacePos( cornerOffset ) {
		
		fPos = fIdx * 9;
		vFace.push( fPos );
		vPos.push( fPos + cornerOffset );
		
	}
	
	function storePosUvs() {
		
		for ( var p = 0; p < g.vertexPositions[ vIdx ].length; p ++ ) {
			
			uvIdx = g.vertexPositions[ vIdx ][ p ] / 3 * 2;
			
			g.uvs[ uvIdx ] = ux;
			g.uvs[ uvIdx + 1 ] = uy;
			
		}
		
	}
	
	function facesPartSphere( ) {
		
		vIdx = v8Idx;
		
		vFace = [ f8Idx * 9 ];
		vPos = [ f8Idx  * 9 ];
		vLoc = [ true, true, false ];  // pole
		
		g.vertexFaces.push( vFace );
		g.vertexPositions.push( vPos );
		g.vLoc.push( vLoc );  // vertex location - edges, corners
		
		for ( var i = 1; i <= eqt; i ++ ) {
			
			ii1 = ( i - 1 ) * ( i - 1 ) + f8Idx;
			ii0 = i * i + f8Idx;
			
			for ( var j = 0; j <= i ; j ++ ) {
				
				// faces and positions to vertex
				
				vFace = [];
				vPos = [];
				vLoc = [ false, false, false ];
				
				if ( j === 0 ) {
					
					fIdx = ii1;
					pushFacePos( b );
					
					
					if( i < eqt ) {
						
						fIdx = ii0;
						pushFacePos( a );
						
						fIdx ++;
						pushFacePos( c );
						
					} else {
						
						vLoc[ 2 ] = true;
						
					}
					
					vLoc[ 0 ] = true;
					
				}
				
				if ( j > 0 && j < i ) {
					
					fIdx = ii1  + 2 * ( j - 1 );
					pushFacePos( c );
					
					fIdx ++;
					pushFacePos( a );
					
					fIdx ++;
					pushFacePos( b );
					
					if( i < eqt ) {
						
						fIdx = ii0 + 2 * j - 1;
						pushFacePos( b );
						
						fIdx ++;
						pushFacePos( a );
						
						fIdx ++;
						pushFacePos( c );
						
					} else {
						
						vLoc[ 2 ] = true;
						
					}
					
				}
				
				if ( j === i ) {
					
					fIdx = ii0 - 1;
					pushFacePos( c );
					
					if( i < eqt ) {
						
						fIdx = ( i + 1 ) * ( i + 1 ) - 2 + f8Idx;
						pushFacePos( b );
						
						fIdx ++;
						pushFacePos( a );
						
					} else {
						
						vLoc[ 2 ] = true;
						
					}
					
					vLoc[ 1 ] = true;
					
				}
				
				g.vertexFaces.push( vFace );
				g.vertexPositions.push( vPos );
				g.vLoc.push( vLoc );
				
			}
			
		}
		
	}
	
	function uvsPartSphere( ) {
		
		var ism;
		var du = 1 / eqt;
		
		vIdx = v8Idx;	// pole
		
		if (  g.uvmode === 0 ) {
		
			ux = 0.5;
			uy = 1;

			storePosUvs();
			vIdx ++;
									
			for ( var i = 1; i <= eqt; i ++ ) {
				
				ux = 0.5 - i * du / 2;
				uy -= du;
								
				for ( var j = 0; j <= i ; j ++ ) {
																
					storePosUvs();
					vIdx ++;
					ux += du;
									
				}
				
			}
					
		}
		
		if (  g.uvmode === 1 ) {
		
			ux = 0.5;
			uy = 0.5;
			
			storePosUvs();
			vIdx ++;
			
			for ( var i = 1; i <= eqt; i ++ ) {
				
				ism = i / eqt;
				
				phi = pi2 * ( part % 4 );
								
				for ( var j = 0; j <= i ; j ++ ) {
					
					//ux = 0.5 * ( 1 + signY * ism * Math.sin( phi ) ); // mirrored
					ux = 0.5 * ( 1 - signY * ism * Math.sin( phi ) );
					uy = 0.5 * ( 1 + ism  * Math.cos( phi ) );
													
					storePosUvs();
					vIdx ++;
					
					phi +=  pi2 / i;
					
				}
				
			}
			
		}
		
	}
	
	g.vertexCount = ( eqt + 1 ) * ( eqt + 2 ) / 2 * g.partCount;
	g.faceCount = eqt * eqt * g.partCount;
	
	g.positions = new Float32Array( g.faceCount * 9 );
	g.normals = new Float32Array( g.faceCount * 9 );
	g.uvs = new Float32Array( g.faceCount * 6 );  // uv's to positions
	
	g.addAttribute( 'position', new THREE.BufferAttribute( g.positions, 3 ).setDynamic( true ) );
	g.addAttribute( 'normal', new THREE.BufferAttribute( g.normals, 3 ).setDynamic( true ) );
	g.addAttribute( 'uv', new THREE.BufferAttribute( g.uvs, 2 ) ); 
	
	g.vertexFaces = []; // needed to calculate the normals
	g.vertexPositions = [];
	g.vLoc = []; // edges, corners
	
	for ( var p = 0; p < 8; p ++ ) {
		
		if ( g.parts[ p ] === 1 ) {
			
			part = p;
			signY = part < 4 ? 1 : -1;		// first, because signY is required for signX, signZ
			signX = ( ( part % 4 ) % 3 === 0 ? 1 : -1 ) * signY;
			signZ = ( ( part % 4 ) > 1 ? 1 : -1 ) * signY;
			
			a = 0; 	// position index offset, triangle corners a, b, c
			b = p < 4 ? 3 : 6;
			c = p < 4 ? 6 : 3;
			
			facesPartSphere( ); // faces to vertex
			uvsPartSphere( );	// uv's to vertex
			
			v8Idx += ( eqt + 1 ) * ( eqt + 2 ) / 2;
			f8Idx += eqt * eqt;
			
		}
		
	}
	
	f8Idx = 0;
	
	for ( var prt = 0; prt < 8; prt ++ ) {
	
		if ( g.parts[ prt ] === 1 ) {
			
			for ( var f = f8Idx, pos = f8Idx * 3; f < f8Idx  + eqt * eqt ; f ++, pos += 3 ) {
				
				g.addGroup( pos, 3, prt + 1 ); // default material index is 0.1 * 10 = 1
				
			}
			
			f8Idx += eqt * eqt;
			
		}
		
	}
	
}

function morphVerticesMagicSphere( time ) {
	
	var t = time !== undefined ? time : 0;
	
	g = this;
	
	var eqt = g.equator;
	var part;			// number of sphere part (0..7)
	
	var v8Idx = 0;		// start vertex index of sphere part
	var vIdx;			// vertex index
	var posIdx;
	var posIdx0;
	
	var f8Idx = 0;		// start face index of sphere part
	var f3, fp;
	
	var x, y, z;
	var theta;
	var phi;
	
	var signX, signY, signZ;
	
	var lenV;			// length of vector
	var f1Vec = {};
	var f2Vec = {};
	var normal = {};
	
	const pi = Math.PI;
	const pi2 = Math.PI / 2;	

	function sinuslike ( x ) {
			
		var pX =  g.pointX( t );
		var pY =  g.pointY( t );
	
		function bezier( x ) {
			
			var tm;
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
		
		function linear( x ) {
			
			var m = ( 1 - pY ) / ( pi2 - pX );
			return x > pX ? m * x + 1 - pi2 * m : pY / pX * x;
	
		} 
		
		
		if  ( g.contourmode === 'rounding' ) {
		
			var y1 = 2 / pi * Math.asin( Math.sin( x ) );
			var y2 = Math.sin( x );
		
			return y1 + g.rounding( t ) * ( y2 - y1 );
			
		} else {
		
			var k1 = g.contourmode === 'profile' ? g.profile : ( g.contourmode === 'bezier' ? bezier : linear );
			
			if ( x < 0  ) return -k1( -x, t );
			if ( x >= 0 && x <= pi2 ) return k1( x, t );
			if ( x > pi2 && x <= pi ) return k1( pi - x, t );	
			if ( x > pi && x <= 3 * pi2 ) return -k1( x - pi, t );	
			if ( x > 3 * pi2 && x <= 2 * pi ) return -k1( 2 * pi - x, t );	
			if ( x > 2 * pi && x <= 5 * pi2 + 0.001 ) return  k1( x - 2 * pi, t );
			//if ( x > 2 * pi ) return  k1( x - 2 * pi, t ); // ???
		
		}
		
	}
	
	function cosinuslike( x ) {
	
		return sinuslike( x + pi2 );
	
	}
	
	/* cosinuslike for 'rounding' from sinuslike used!
		function cosinuslike( x ) {
			
			var y1 = -2 / pi * Math.asin( -Math.cos( x ) );
			var y2 = Math.cos( x );
			
			return y1 + g.rounding( t ) * ( y2 - y1 );
							
		}
	*/	
	
	
	function xyzCalculation( ) {
		
		x = g.radius( t ) * cosinuslike( theta ) * cosinuslike( phi );
		y = g.radius( t ) * sinuslike( theta );
		z = -g.radius( t ) * cosinuslike( theta ) * sinuslike( phi );
		
		if ( !g.driftDefault ) {
			
			x += signX * signY * g.driftX( t );
			y += signY * g.driftY( t );
			z += signZ * signY * g.driftZ( t );
			
		}
		
	}
	
	function storeVertexPositions() {
		
		for ( var p = 0; p < g.vertexPositions[ vIdx ].length; p ++ ) {
			
			g.positions[ g.vertexPositions[ vIdx ][ p ] ] = x;
			g.positions[ g.vertexPositions[ vIdx ][ p ] + 1 ] = y;
			g.positions[ g.vertexPositions[ vIdx ][ p ] + 2 ] = z;
			
		}
		
	}
	
	function verticesPartSphere( ) {
		
		vIdx = v8Idx;	// pole
		
		theta = signY * pi2; 
		phi = pi2 * ( part % 4 );
		
		xyzCalculation( );
		storeVertexPositions( );
		
		vIdx ++;
		
		for ( var i = 1; i <= eqt; i ++ ) {
			
			theta = signY * pi2 * ( 1 -  i / eqt );
			
			phi = pi2 * ( part % 4 );
			
			for ( var j = 0; j <= i ; j ++ ) {
				
				xyzCalculation( );
				storeVertexPositions( );
				
				vIdx ++;
				
				phi +=  pi2 / i;
				
			}
			
		}
	
	}
	
	function normalsPartSphere( ) {
		
		// face normals (needed for vertex normals) 
			
		for ( var f = f8Idx; f < f8Idx + g.faceCount / g.partCount ; f ++ ) {
			
			normal.x = 0;
			normal.y = 0;
			normal.z = 0;
			
			posIdx = f * 9 + 3;
			posIdx0 = f * 9;
			
			f1Vec.x = g.positions[ posIdx ] - g.positions[ posIdx0 ];
			f1Vec.y = g.positions[ posIdx + 1 ] - g.positions[ posIdx0 + 1 ];
			f1Vec.z = g.positions[ posIdx + 2 ] - g.positions[ posIdx0 + 2  ];
			
			posIdx = f * 9 + 6;
			
			f2Vec.x = g.positions[ posIdx ] - g.positions[ posIdx0 ];
			f2Vec.y = g.positions[ posIdx + 1 ] - g.positions[ posIdx0 + 1 ];
			f2Vec.z = g.positions[ posIdx + 2 ] - g.positions[ posIdx0 + 2 ];
			
			//  add cross product
			
			normal.x += f1Vec.y * f2Vec.z - f1Vec.z * f2Vec.y;
			normal.y += f1Vec.z * f2Vec.x - f1Vec.x * f2Vec.z;
			normal.z += f1Vec.x * f2Vec.y - f1Vec.y * f2Vec.x;
			
			// normalize
			
			lenV = Math.sqrt( normal.x * normal.x + normal.y * normal.y + normal.z * normal.z );
			
			normal.x = normal.x / lenV;
			normal.y = normal.y / lenV;
			normal.z = normal.z / lenV;
			
			g.faceNormals.push( normal.x, normal.y, normal.z );
			
		}
		
		// vertex normals
		
		for ( var v = v8Idx; v < v8Idx + g.vertexFaces.length / g.partCount; v ++ ) {
			
			normal.x = 0;
			normal.y = 0;
			normal.z = 0;
			
			// add face normals	
			
			for ( var f = 0; f < g.vertexFaces[ v ].length; f ++ ) {
				
				normal.x += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 ];
				normal.y += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 + 1 ];
				normal.z += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 + 2 ];
				
			}
			
			// location and normalize
			
			// no edge
			if ( !g.vLoc[ v ][ 0 ] && !g.vLoc[ v ][ 1 ] && !g.vLoc[ v ][ 2 ] ) {
				
				lenV = Math.sqrt( normal.x * normal.x + normal.y * normal.y + normal.z * normal.z );
				
				normal.x = normal.x / lenV;
				normal.y = normal.y / lenV;
				normal.z = normal.z / lenV;
				
			} else {
				
				// pole corner
				if ( g.vLoc[ v ][ 0 ] && g.vLoc[ v ][ 1 ] ) {
					
					normal.x = 0
					normal.y = signY;
					normal.z = 0;
					
				}
				//  edge
				if ( ( g.vLoc[ v ][ 0 ] && !g.vLoc[ v ][ 1 ] && !g.vLoc[ v ][ 2 ]  ) || ( !g.vLoc[ v ][ 0 ] && g.vLoc[ v ][ 1 ] && !g.vLoc[ v ][ 2 ] )) {
					
					if ( normal.x * normal.x < normal.z * normal.z) {
						
						normal.x = 0;
						lenV = Math.sqrt( normal.y * normal.y + normal.z * normal.z );
						normal.y = normal.y / lenV;
						normal.z = normal.z / lenV;
						
					} else {
						
						lenV = Math.sqrt( normal.x * normal.x + normal.y * normal.y );
						normal.x = normal.x / lenV;
						normal.y = normal.y / lenV;
						normal.z = 0;
						
					}
					
				}
				
				// left / right corner
				if ( ( g.vLoc[ v ][ 0 ] && !g.vLoc[ v ][ 1 ] && g.vLoc[ v ][ 2 ] ) || ( !g.vLoc[ v ][ 0 ] && g.vLoc[ v ][ 1 ] && g.vLoc[ v ][ 2 ] )) {
					
					if ( normal.x * normal.x < normal.z * normal.z) {
						
						normal.x = 0;
						normal.y = 0;
						normal.z = signZ;
						
					} else {
						
						normal.x = signX;
						normal.y = 0;
						normal.z = 0;
						
					}
					
				}
				
				// bottom edge
				if ( !g.vLoc[ v ][ 0 ] && !g.vLoc[ v ][ 1 ] && g.vLoc[ v ][ 2 ] ) {
					
					lenV = Math.sqrt( normal.x * normal.x + normal.z * normal.z );
					
					normal.x = normal.x / lenV;
					normal.y = 0;
					normal.z = normal.z / lenV;
					
				}
				
			}
			
			// write the vertex normals corresponding to positions
			
			for ( var f = 0; f < g.vertexFaces[ v ].length; f ++ ) {
				
				g.normals[ g.vertexPositions[ v ][ f ] ] = normal.x;
				g.normals[ g.vertexPositions[ v ][ f ] + 1 ] = normal.y;
				g.normals[ g.vertexPositions[ v ][ f ] + 2 ] = normal.z;
				
			}
			
		}
		
	}
	
	g.attributes.position.needsUpdate = true;
	g.attributes.normal.needsUpdate = true;
	
	// set vertex positions and calculate normals
	
	g.faceNormals = [];			// clear face normals
	
	for ( var p = 0; p < 8; p ++ ) {
		
		if ( g.parts[ p ] === 1) {
			
			part = p;
			
			signY = part < 4 ? 1 : -1;		// first, because signY is required for signX, signZ
			signX = ( ( part % 4 ) % 3 === 0 ? 1 : -1 ) * signY;
			signZ = ( ( part % 4 ) > 1 ? 1 : -1 ) * signY;
			
			verticesPartSphere( );	// faces to vertex
			normalsPartSphere( );	// normals to vertex
			
			v8Idx += ( eqt + 1 ) * ( eqt + 2 ) / 2;
			f8Idx += eqt * eqt;
			
		}
		
	}
	
	// explode
	
	if ( !g.explodeDefault ) {
		
		for ( var f = 0; f < g.faceCount; f ++ ) {
			
			 f3 = f * 3;
			
			for ( var p = 0; p < 3; p ++ ) {
				
				fp = f * 9 + p * 3;
				
				g.positions[ fp ] = g.positions[ fp ] + g.faceNormals[ f3 ] * g.radius( t ) * g.explode( t );
				g.positions[ fp + 1 ] = g.positions[ fp + 1 ] + g.faceNormals[ f3 + 1 ] * g.radius( t ) * g.explode( t );
				g.positions[ fp + 2 ] = g.positions[ fp + 2 ] + g.faceNormals[ f3 + 2 ] * g.radius( t ) * g.explode( t );
				
			}
			
		}
		
	}
	
}

function vertexFaceNumbersHelper( mesh, mode, size, color ) {
	
	//  mode: 0 nothing, 1 vertex, 2 face, 3 vertex & face
	
	var verticesCount;
	var facesCount;
	 
	var vertexNumbers = [];
	var faceNumbers = [];
	var materialDigits = new THREE.LineBasicMaterial( { color: color } );
	var geometryDigit = [];
	var digit = [];
	var d100, d10, d1;		// digits
	var coordDigit = [];	// design of the digits
	
	var digitPositions = [];
	
	function numbering() { 
		
		i1 ++;														// starts with  -1 + 1 = 0
		
		if ( i1   === 10 ) {i1   = 0; i10 ++ }
		if ( i10  === 10 ) {i10  = 0; i100 ++ }
		if ( i100 === 10 ) {i100 = 0 }								// hundreds (reset when overflow)
		
		if ( i100 > 0 ) {
			
			d100 = digit[ i100 ].clone();							// digit for hundreds
			board.add( d100 );										// on the board ...
			d100.position.x = -8 * 0.1 * size;						// ... move slightly to the left
			
		}
		
		if ( ( i100 > 0 ) || ( ( i100 === 0 ) && ( i10 > 0 ) ) ) {	// no preceding zeros tens
			
			d10 = digit[ i10 ].clone();								// digit for tenth
			board.add( d10 );										// on the board
			
		}
		
		d1 =   digit[ i1 ].clone();									// digit 
		board.add( d1 );											//  on the board ...
		d1.position.x = 8 * 0.1 * size;		 						// ... move slightly to the right
		
	}
	
	coordDigit[ 0 ] = [ 0,0, 0,9, 6,9, 6,0, 0,0 ];
	coordDigit[ 1 ] = [ 0,6, 3,9, 3,0 ];
	coordDigit[ 2 ] = [ 0,9, 6,9, 6,6, 0,0, 6,0 ];
	coordDigit[ 3 ] = [ 0,9, 6,9, 6,5, 3,5, 6,5, 6,0, 0,0 ];
	coordDigit[ 4 ] = [ 0,9, 0,5, 6,5, 3,5, 3,6, 3,0 ];
	coordDigit[ 5 ] = [ 6,9, 0,9, 0,5, 6,5, 6,0, 0,0 ];
	coordDigit[ 6 ] = [ 6,9, 0,9, 0,0, 6,0, 6,5, 0,5 ];
	coordDigit[ 7 ] = [ 0,9, 6,9, 6,6, 0,0 ];
	coordDigit[ 8 ] = [ 0,0, 0,9, 6,9, 6,5, 0,5, 6,5, 6,0, 0,0 ];
	coordDigit[ 9 ] = [ 6,5, 0,5, 0,9, 6,9, 6,0, 0,0 ];

	// non indexed BufferGeometry
	
	if ( mesh.geometry.isBufferGeometry && !mesh.geometry.indexed) {
		
		if ( mode === 1 || mode === 3 ) {
			
			verticesCount = mesh.geometry.vertexPositions.length;
			
		}
		
		if ( mode === 2 || mode === 3 ) {
			
			facesCount = mesh.geometry.positions.length / 9;
			
		}
		
		for ( var i = 0; i < 10; i ++ ) {
			
			geometryDigit[ i ] = new THREE.BufferGeometry();
			
			digitPositions[ i ] =  new Float32Array( coordDigit[ i ].length / 2 * 3 );
			geometryDigit[ i ].addAttribute( 'position', new THREE.BufferAttribute( digitPositions[ i ], 3 ) );
			
			for ( var j = 0; j < coordDigit[ i ].length/ 2; j ++ ) {
				
				digitPositions[ i ][ j * 3 ] =  0.1 * size * coordDigit[ i ][ 2 * j ];
				digitPositions[ i ][ j * 3 + 1 ] = 0.1 * size * coordDigit[ i ][ 2 * j + 1 ];
				digitPositions[ i ][ j * 3 + 2 ] = 0;
				
			}
			
			digit[ i ] = new THREE.Line( geometryDigit[ i ], materialDigits );
			
		}
		
		if ( mode === 1 || mode === 3 ) {
			
			var i100 =  0;
			var i10  =  0;
			var i1   = -1;
			
			for ( var i = 0; i < verticesCount ; i ++ ) {
				
				// Number on board, up to three digits are pinned there
				
				var board = new THREE.Mesh( new THREE.BufferGeometry() );
				
				numbering(); // numbering the vertices, hundreds ...
				
				vertexNumbers.push( board );	// place the table in the vertex numbering data field
				mesh.add( vertexNumbers[ i ] );	
				
			}
			
		}
		
		if ( mode === 2 || mode === 3 ) {
			
			var i100 =  0;
			var i10  =  0;
			var i1   = -1;
			
			for ( var i = 0; i < facesCount ; i ++ ) {
				
				// Number on board, up to three digits are pinned there
				
				var board = new THREE.Mesh( new THREE.BufferGeometry() );
				
				numbering(); // numbering the facesces, hundreds ...
				
				faceNumbers.push( board );	// place the table in the face numbering data field
				mesh.add( faceNumbers[ i ] );
				
			}
			
		}
		
	}
	
	// update helper
	
	this.update = function ( mode ) {
		
		var x, y, z;

		// non indexed BufferGeometry
		
		if ( mesh.geometry.isBufferGeometry && !mesh.geometry.indexed ) {
			
			if ( mode === 1 || mode === 3 ) {
				
				for( var n = 0; n < vertexNumbers.length; n ++ ) { 
					
					vertexNumbers[ n ].position.set( mesh.geometry.positions[ mesh.geometry.vertexPositions[ n ][ 0 ] ], mesh.geometry.positions[ mesh.geometry.vertexPositions[ n ][ 0 ] + 1 ], mesh.geometry.positions[ mesh.geometry.vertexPositions[ n ][ 0 ] + 2] );
					vertexNumbers[ n ].quaternion.copy(camera.quaternion);
					
				}
				
			}
			
			if ( mode === 2 || mode === 3 ) {
				
				for( var n = 0; n < faceNumbers.length; n ++ ) {
					
					x = 0;
					x += mesh.geometry.positions[ 9 * n ];
					x += mesh.geometry.positions[ 9 * n + 3 ];
					x += mesh.geometry.positions[ 9 * n + 6 ];
					x /= 3;	
					
					y = 0;
					y += mesh.geometry.positions[ 9 * n + 1 ];
					y += mesh.geometry.positions[ 9 * n + 4 ];
					y += mesh.geometry.positions[ 9 * n + 7 ];
					y /= 3;	
					
					z = 0;
					z += mesh.geometry.positions[ 9 * n + 2 ];
					z += mesh.geometry.positions[ 9 * n + 5 ];
					z += mesh.geometry.positions[ 9 * n + 8 ];
					z /= 3;	
					
					faceNumbers[ n ].position.set( x, y, z );
					faceNumbers[ n ].quaternion.copy(camera.quaternion);
					
				}
				
			}
			
		}
		
	}
	
}

exports.createMagicSphere = createMagicSphere;
exports.buildMagicSphere = buildMagicSphere;
exports.morphVerticesMagicSphere =	morphVerticesMagicSphere;

exports.vertexFaceNumbersHelper = vertexFaceNumbersHelper;

Object.defineProperty(exports, '__esModule', { value: true });

})));