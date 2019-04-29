// THREEg.js ( rev 104.0 )

/**
 * @author hofk / http://threejs.hofk.de/
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.THREEg = global.THREEg || {})));
}(this, (function (exports) {

'use strict';

var g;	// THREE.BufferGeometry

//#################################################################################################

//
//       Each single section between ..... name ...... can be deleted.
//
// ..................................... Magic Box ................................................

function createMagicBox( p ) {
	
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
	
	if ( p === undefined ) p = {};
	
	g = this;  //  THREE.BufferGeometry() - geometry object from three.js
	
	g.lidAngleDefault = ( p.lidAngle0 === undefined && p.lidAngle1 === undefined && p.lidAngle2 === undefined && p.lidAngle3 === undefined && p.lidAngle4 === undefined && p.lidAngle5 === undefined ) ? true : false;
	g.explodeDefault = p.explode === undefined ? true : false;
	
	//............................................................ set defaults
	
	g.widthSegments = 	p.widthSegments !== undefined ? p.widthSegments : 2;
	g.heightSegments = 	p.heightSegments !== undefined ? p.heightSegments : 2;
	g.depthSegments = 	p.depthSegments !== undefined ? p.depthSegments : 2;	
	g.smoothness = 		p.smoothness !== undefined ? p.smoothness : 4;
	
	g.uvmode = 			p.uvmode !== undefined ? p.uvmode : 0;
	g.contourmode =		p.contourmode !== undefined ? p.contourmode	: 'rounding'; // 'profile' 'bezier' 'linear' 
	g.explodemode =		p.explodemode !== undefined ? p.explodemode	: 'center'; // 'normal'
	
	g.sides = 			p.sides !== undefined ? p.sides : [ 1, 1, 1, 1, 1, 1 ];
	g.lidHinges =		p.lidHinges !== undefined ? p.lidHinges : [ 0, 0, 0, 0, 0, 0 ];
	g.materials = 		p.materials !== undefined ? p.materials : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]; // material index
	
	g.width = 			p.width !== undefined ? p.width				: function ( t ) { return 1 };
	g.height = 			p.height !== undefined ? p.height			: function ( t ) { return 1 };
	g.depth = 			p.depth !== undefined ? p.depth				: function ( t ) { return 1 };
	g.radius = 			p.radius !== undefined ? p.radius			: function ( t ) { return 0.1 };
	
	g.waffleDeep =		p.waffleDeep !== undefined ? p.waffleDeep	: function ( t ) { return 0 };		
	g.rounding =		p.rounding !== undefined ? p.rounding		: function ( t ) { return 1 };		
	g.profile = 		p.profile !== undefined ? p.profile			: function ( x, t ) { return Math.sin( x ) };	
	g.pointX = 			p.pointX !== undefined ? p.pointX			: function ( t ) { return 0.001 };
	g.pointY = 			p.pointY !== undefined ? p.pointY			: function ( t ) { return 0.999 };
	
	g.lidAngle0 =		p.lidAngle0 !== undefined ? p.lidAngle0		: function ( t ) { return 0 };
	g.lidAngle1 =		p.lidAngle1 !== undefined ? p.lidAngle1		: function ( t ) { return 0 };
	g.lidAngle2 =		p.lidAngle2 !== undefined ? p.lidAngle2		: function ( t ) { return 0 };
	g.lidAngle3 =		p.lidAngle3 !== undefined ? p.lidAngle3		: function ( t ) { return 0 };
	g.lidAngle4 =		p.lidAngle4 !== undefined ? p.lidAngle4		: function ( t ) { return 0 };
	g.lidAngle5 =		p.lidAngle5 !== undefined ? p.lidAngle5		: function ( t ) { return 0 };
	
	g.explode =			p.explode !== undefined ? p.explode			: function ( t ) { return 0 };
	
	//..............................................................................................
	
	g.widthP =	function ( t ) { return  g.width( t ) - 2 * g.radius( t ) }; // width plane
	g.heightP =	function ( t ) { return  g.height( t ) - 2 * g.radius( t ) }; // height plane
	g.depthP =	function ( t ) { return  g.depth( t ) - 2 * g.radius( t ) }; // depth plane
	
	g.lidAngles = [ g.lidAngle0, g.lidAngle1, g.lidAngle2, g.lidAngle3, g.lidAngle4, g.lidAngle5 ];
	
	g.buildMagicBox = buildMagicBox;
	g.morphVerticesMagicBox = morphVerticesMagicBox;
	
	g.buildMagicBox();
	g.morphVerticesMagicBox();
	
}

function buildMagicBox( ) {
	
	g = this;
	
	var s1, s2; // .. segments
	var si;		// side i
	var ws = g.widthSegments;
	var hs = g.heightSegments;
	var ds = g.depthSegments;
	var sm = g.smoothness;
	
	var fLeft;				// face left (index)
	var fLeftPos;
	var fRight;				// face right (index)
	var fRightPos;
	var fIdx;				// face index
	var fPos 
	var vIdx;				// vertex index
	var waffleVidx; 		// waffle vertex index
	var uvIdx;				// uv index

	g.vertexFaces = []; // needed to calculate the normals
	g.vertexPositions = [];
		
	g.vPlanesIdx = [ 0, 0, 0, 0, 0, 0 ];
	g.vEdgesIdx = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	g.vCornersIdx = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
	
	g.fPlanesIdx = [ -1, -1, -1, -1, -1, -1 ];
	g.fEdgesIdx = [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ];
	g.fCornersIdx = [ -1, -1, -1, -1, -1, -1, -1, -1 ];
	
	g.fPlanesCount = [ ];
	g.fEdgesCount = [ ];
	g.fCornersCount = [ ];
	
	// 6 planes + 12 edges + 8 corners = 26 parts:
	
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
	
	for ( var i = 0; i < 6; i ++ ) {
		
		si = g.sides[ i ];
		
		if ( si === 0 || si === 2 || si === 5 || si === 6 || si === 9 ) g.vPlanesIdx [ i ] = -1; //no plane

		if ( si === 0 || si === 3 || si === 5 || si === 7 || si === 9 ) {
			
			//no edges
			g.vEdgesIdx[ sideEdge[ i ][ 0 ] ] = -1;
			g.vEdgesIdx[ sideEdge[ i ][ 1 ] ] = -1;
			g.vEdgesIdx[ sideEdge[ i ][ 2 ] ] = -1;
			g.vEdgesIdx[ sideEdge[ i ][ 3 ] ] = -1;
			
		}
		
		if ( si === 0 || si === 4 || si === 6 || si === 7 || si === 9 ) {
			
			//no corners
			g.vCornersIdx[ sideCorner[ i ][ 0 ] ] = -1;
			g.vCornersIdx[ sideCorner[ i ][ 1 ] ] = -1;
			g.vCornersIdx[ sideCorner[ i ][ 2 ] ] = -1;
			g.vCornersIdx[ sideCorner[ i ][ 3 ] ] = -1;
			
		} 
			
	}
	
	g.vertexCount = 0;
	g.faceCount = 0;
   
	// count (planes)
	for ( var i = 0; i < 6; i ++ ) {		
		
		if ( g.vPlanesIdx[ i ] === 0 ) {
			
			g.vPlanesIdx[ i ] = g.vertexCount;
			g.fPlanesIdx[ i ] = g.faceCount;
			
			s1 = i < 2 ? hs : ws; // segments
			s2 = i < 4 ? ds : hs;
						
			g.vertexCount += ( 2 * s1 + 1 ) * s2 + s1 + 1;
			g.faceCount += s1 * s2 * 4;
						
			g.fPlanesCount[ i ] = g.faceCount - g.fPlanesIdx[ i ];
				
		}
		
	}
	
	// count (edges)
	for ( var i = 0; i < 12; i ++ ) {	

		s1 = sm; // segments
		
		if ( g.vEdgesIdx[ i ] === 0  ) {
			
			g.vEdgesIdx[ i ] = g.vertexCount;
			g.fEdgesIdx[ i ] = g.faceCount;
			
			s2 = i < 4 ? ws : ( i < 8 ? hs : ds ); // segments
				
			g.vertexCount += ( 2 * s1 + 1 ) * s2 + s1 + 1;
			g.faceCount += s1 * s2 * 4;
						
			g.fEdgesCount[ i ] = g.faceCount - g.fEdgesIdx[ i ];
			
		}
	
	}
	
	// count (corners)
	for ( var i = 0; i < 8; i ++ ) {
			
		if ( g.vCornersIdx[ i ] === 0 ) {
									
			g.vCornersIdx[ i ] = g.vertexCount;
			g.fCornersIdx[ i ] = g.faceCount;
		
			g.vertexCount += ( sm + 1 ) * ( sm + 2 ) / 2 ;
			g.faceCount += sm * sm;
			
			g.fCornersCount[ i ] = g.faceCount - g.fCornersIdx[ i ];
			
		}
		
	}	

	function facesPlaneEdge( type, part ) {
		
		// planes and rounded edges
		
		var s1, s2; // segments
		var vPartIdx;
		var fPartIdx;
		
		var b, c; // position index offset, triangle corners a = 0, b, c 	
	
		if ( type === 'plane' ) {
			
			if ( part === 1 ||  part === 3 ||  part === 4 ) { 				
							
				b = 3;
				c = 6;
				
			} else {
				
				b = 6;
				c = 3;
				
			}
			
			s1 = part < 2 ? hs : ws;
			s2 = part < 4 ? ds : hs;
			
			vPartIdx = g.vPlanesIdx[ part ];
			fPartIdx = g.fPlanesIdx[ part ];
							
		} 
		
		if ( type === 'edge' ) {
		
			if ( part === 0 ||  part === 2 ||  part === 5 ||  part === 7 || part === 8 ||  part === 10 ) {
					
				b = 3;
				c = 6;
				
			} else {
				
				b = 6;
				c = 3;
				
			}
			
			s1 = part < 4 ? ws : ( part < 8 ? hs : ds )
			s2 = sm; 
			
			vPartIdx = g.vEdgesIdx[ part ]; 
			fPartIdx = g.fEdgesIdx[ part ];
						
		}
		
		var vFace = [];
		var vPos = [];
		
		for ( var j = 0; j < s1 + 1; j ++ ) {
			
			for ( var i = 0; i < s2 + 1; i ++ ) {
				
				fLeft = 4 * ( ( j - 1 ) * s2 + i ) + fPartIdx; // face indices left
				fLeftPos = fLeft * 9;
				fRight = 4 * ( j * s2 + i ) + fPartIdx; // face indices right
				fRightPos = fRight * 9;
				
				vFace = [];
				vPos = [];

				if ( j > 0 ) {
					
					if ( i < s2 ) { 
						
						vFace.push( fLeftPos );
						vPos.push( fLeftPos + c );
						
						vFace.push( fLeftPos + 18 );
						vPos.push( fLeftPos + 18 + b );
						
					}
					
					if ( i > 0 ) {
						
						vFace.push( fLeftPos - 9 );
						vPos.push( fLeftPos - 9 + b );
						
						vFace.push( fLeftPos - 18 );
						vPos.push( fLeftPos - 18 + c );
					}
					
				}
				
				if ( j < s1 ) {
					
					if ( i < s2 ) {
						
						vFace.push( fRightPos + 9 );
						vPos.push( fRightPos + 9 + c );
						
						vFace.push( fRightPos );
						vPos.push( fRightPos + b );
						
					}
					
					if ( i > 0 ) {
						
						vFace.push( fRightPos - 9 );
						vPos.push( fRightPos - 9 + c );
						
						vFace.push( fRightPos - 27 );
						vPos.push( fRightPos - 27 + b );
						
					}
					
				}
	
				g.vertexFaces.push( vFace );
				g.vertexPositions.push( vPos );
					
			}
			
			// segment center vertices with 4 faces 
			
			if ( j < s1 ) {
				
				for ( var i = 0; i < s2; i ++ ) {
					
					vFace = []; 
					vPos = [];
					
					fPos = ( 4 * ( j * s2 + i ) + fPartIdx ) * 9;
					
					vFace.push( fPos );
					vPos.push( fPos );
					
					vFace.push( fPos + 9 );
					vPos.push( fPos + 9 );
					
					vFace.push( fPos + 18 );
					vPos.push( fPos + 18 );
					
					vFace.push( fPos + 27 );
					vPos.push( fPos + 27 );
					
					g.vertexFaces.push( vFace );
					g.vertexPositions.push( vPos );
										
				}
				
			}
			
		}
		
		// write uv buffer array
		
		for ( var j = 0; j < s1 + 1; j ++ ) {
			
			for ( var i = 0; i < s2 + 1; i ++ ) {
				
				vIdx = ( 2 * s2 + 1 ) * j + i + vPartIdx;	// vertex index
				
				for ( var p = 0; p < g.vertexPositions[ vIdx ].length; p ++ ) {
					
					uvIdx = g.vertexPositions[ vIdx ][ p ] / 3 * 2;
												
					if ( part === 0 ||  part === 2 ||  part === 5 ||  part === 7 || part === 8 ||  part === 10 ) {
						
						g.uvs[ uvIdx ] = type === 'plane' ? ( s1 - j ) / s1 :  j / s1;
						
					} else {
						
						g.uvs[ uvIdx ] = type === 'plane' ? j / s1 : ( s1 - j ) / s1; 
						
					}
					
					g.uvs[ uvIdx + 1 ] =  i / s2;
					
				}
				
			}
			
		}
		
		// write uv buffer array  for segment centers
				
		for ( var j = 0; j < s1; j ++ ) {
			
			for ( var i = 0; i < s2; i ++ ) {
				
				waffleVidx = ( 2 * s2 + 1 ) * j + i + s2 + 1 + vPartIdx; // waffle-vertex index
				
				for ( var p = 0; p < g.vertexPositions[ waffleVidx ].length; p ++ ) {
					
					uvIdx =  g.vertexPositions[ waffleVidx  ][ p ] / 3 * 2;
												
					if ( part === 0 ||  part === 2 ||  part === 5 ||  part === 7 || part === 8 ||  part === 10 ) {
					
						g.uvs[ uvIdx ] = type === 'plane' ? ( s1 - j - 0.5 ) / s1 : ( j + 0.5 ) / s1;
						
					} else {
						
						g.uvs[ uvIdx ] = type === 'plane' ?  ( j + 0.5 ) / s1 : ( s1 - j - 0.5 ) / s1;
						
					}	
										
					g.uvs[ uvIdx + 1 ] = ( i + 0.5 ) / s2;
					
				}
				
			}
			
		}
		
	}
	
	function facesPartSphere( part ) {
	
		// corner
					
		var ii1;
		var ii0;
		
		var vFace = [ ];
		var vPos = [ ];

		var signY = part < 4 ? 1 : -1;		// first, because signY is required for signX, signZ
		var signX = ( ( part % 4 ) % 3 === 0 ? 1 : -1 ) * signY;
		var signZ = ( ( part % 4 ) > 1 ? 1 : -1 ) * signY;
		
		var a = 0; 	// position index offset, triangle corners a, b, c
		var b = part < 4 ? 3 : 6;
		var c = part < 4 ? 6 : 3;
		
		var ux,uy;
		var phi;
		const pi2 = Math.PI / 2;
		
		function pushFacePos( offset ) {
		
			fPos = fIdx * 9;
			vFace.push( fPos );
			vPos.push( fPos + offset );
		
		}
		
		function storePosUvs() {
			
			for ( var p = 0; p < g.vertexPositions[ vIdx ].length; p ++ ) {
				
				uvIdx = g.vertexPositions[ vIdx ][ p ] / 3 * 2;
				
				g.uvs[ uvIdx ] = ux;
				g.uvs[ uvIdx + 1 ] = uy;
				
			}
			
		}
		
		function uvsPartSphere( ) {
			
			var ism;
			var du = 1 / sm;
			
			vIdx = g.vCornersIdx[ part ]; // pole
	
			if ( g.uvmode === 0 ) {
			
				ux = 0.5;
				uy = 1;
				
				storePosUvs();
				vIdx ++;
				
				for ( var i = 1; i <= sm; i ++ ) {
					
					ux = 0.5 - signY * i * du / 2;
					uy -= du;
					
					for ( var j = 0; j <= i ; j ++ ) {
						
						storePosUvs();
						vIdx ++;
						ux += signY * du;
						
					}
					
				}
				
			}
			
			if ( g.uvmode === 1 ) {
			
				ux = 0.5;
				uy = 0.5;
				
				storePosUvs();
				vIdx ++;
				
				for ( var i = 1; i <= sm; i ++ ) {
					
					ism = i / sm;
					
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
		
		vFace = [ g.fCornersIdx[ part ] * 9 ];
		vPos = [ g.fCornersIdx[ part ]  * 9 ];
				
		g.vertexFaces.push( vFace );
		g.vertexPositions.push( vPos );
				
		for ( var i = 1; i <= sm; i ++ ) {
			
			ii1 = ( i - 1 ) * ( i - 1 ) + g.fCornersIdx[ part ];
			ii0 = i * i + g.fCornersIdx[ part ];
			
			for ( var j = 0; j <= i ; j ++ ) {
				
				// faces and positions to vertex
				
				vFace = [];
				vPos = [];
				
				if ( j === 0 ) {
					
					fIdx = ii1;
					pushFacePos( b );
										
					if( i < sm ) {
						
						fIdx = ii0;
						pushFacePos( a );
						
						fIdx ++;
						pushFacePos( c );
						
					} 
					
				}
				
				if ( j > 0 && j < i ) {
					
					fIdx = ii1  + 2 * ( j - 1 );
					pushFacePos( c );
					
					fIdx ++;
					pushFacePos( a );
					
					fIdx ++;
					pushFacePos( b );
					
					if( i < sm ) {
						
						fIdx = ii0 + 2 * j - 1;
						pushFacePos( b );
						
						fIdx ++;
						pushFacePos( a );
						
						fIdx ++;
						pushFacePos( c );
						
					} 
					
				}
				
				if ( j === i ) {
					
					fIdx = ii0 - 1;
					pushFacePos( c );
					
					if( i < sm ) {
						
						fIdx = ( i + 1 ) * ( i + 1 ) - 2 + g.fCornersIdx[ part ];
						pushFacePos( b );
						
						fIdx ++;
						pushFacePos( a );
						
					} 
					
				}
				
				g.vertexFaces.push( vFace );
				g.vertexPositions.push( vPos );
				
				
			}
			
		}
		
		uvsPartSphere( );
		
	}
		
	g.positions = new Float32Array( g.faceCount * 9 );
	g.normals = new Float32Array( g.faceCount * 9 );
	g.uvs = new Float32Array( g.faceCount * 6 );  // uv's to positions
	
	g.addAttribute( 'position', new THREE.BufferAttribute( g.positions, 3 ).setDynamic( true ) );
	g.addAttribute( 'normal', new THREE.BufferAttribute( g.normals, 3 ).setDynamic( true ) );
	g.addAttribute( 'uv', new THREE.BufferAttribute( g.uvs, 2 ) );

	// up to 26 parts:
	
	//  planes
	for ( var i = 0; i < 6; i ++ ) {
		
		if ( g.vPlanesIdx[ i ] > -1 ) {
	
			facesPlaneEdge( 'plane', i );
			
			g.addGroup( g.fPlanesIdx[ i ] * 3, g.fPlanesCount[ i ] * 3, g.materials[ i ] ); // material
						
		}
		
	}
	
	// edges
	for ( var i = 0; i < 12; i ++ ) {
		
		if ( g.vEdgesIdx[ i ] > -1 ) {
			
			facesPlaneEdge( 'edge', i );
			
			g.addGroup( g.fEdgesIdx[ i ] * 3, g.fEdgesCount[ i ] * 3, g.materials[ Math.floor( i / 4 ) + 6 ] ); // material
			
		}
		
	}
	
	// corners
	for ( var i = 0; i < 8; i ++ ) {
		
		if ( g.vCornersIdx[ i ] > -1 ) {
			
			facesPartSphere( i );
			
			g.addGroup( g.fCornersIdx[ i ] * 3, g.fCornersCount[ i ] * 3, g.materials[ Math.floor( i / 4 ) + 9 ] ); // material
			
		}
		
	}
	
}

function morphVerticesMagicBox( time ) {

	var t = time !== undefined ? time : 0;
	
	g = this;
	
	var ws = g.widthSegments;
	var hs = g.heightSegments;
	var ds = g.depthSegments;
	var sm = g.smoothness;
	
	var f3, fp;
			
	var signX, signY, signZ;
	
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
	
	function morphPlaneEdge( type, part ) { 
	
		var s1, s2; // segments
		var vPartIdx;
		var fPartIdx;
		var vIdx; // vertex index
		
		var x, y, z;
				
		var nj;
		var ni;  
				
		var theta;
		
		var sign1;
		var sign2;
		
		var waffleVidx;
		var	posIdx;
		var posIdx0;
		
		var f0Vec = {};
		var f1Vec = {};
		var f2Vec = {};
		var normal = {};
		var lenV;
		
		if ( type === 'plane' ) {
			
			s1 = part < 2 ? hs : ws;
			s2 = part < 4 ? ds : hs;
			
			vPartIdx = g.vPlanesIdx[ part ];
			fPartIdx = g.fPlanesIdx[ part ];
						
		} 
		
		if ( type === 'edge' ) {
			
			s1 = part < 4 ? ws : ( part < 8 ? hs : ds )
			s2 = sm; 
			
			vPartIdx = g.vEdgesIdx[ part ]; 
			fPartIdx = g.fEdgesIdx[ part ]; 
			
		}
	
		// const a = 0; //  position index offset, triangle corners a, b, c
		const b = 3;
		const c = 6;
	
		function verticesPartPlaneEdge( part ) {
			
			// outer segment points	
					
			for ( var j = 0; j < s1 + 1; j ++ ) {
					
				nj = j / s1;
				
				for ( var i = 0; i < s2 + 1; i ++ ) {
					
					ni   = i / s2;
							
					if ( type === 'plane' ) {
					
						if ( g.lidAngleDefault ) { 
							
							if ( part < 2 ) {
								
								sign1 = 1 - 2 * part;
								x = sign1 * g.width( t ) / 2;
								y = ( ni - 0.5 ) * g.heightP( t );
								z = ( nj - 0.5 ) * g.depthP( t );	 
							
							}
												
							if ( part === 2 || part === 3 ) {
							
								sign1 = 5 - 2 * part;
								x = ( nj - 0.5 ) * g.widthP( t );
								y = sign1 * g.height( t ) / 2;
								z = ( ni - 0.5 ) * g.depthP( t );
								
							}
							
							if ( part > 3 ) {
								
								sign1 = 9 - 2 * part;
								x = ( nj - 0.5 ) * g.widthP( t );
								y = ( ni - 0.5 ) * g.heightP( t );
								z = sign1 * g.depth( t ) / 2;
								
							}
							
						} else {
						
							if ( part < 2 ) {
								
								sign1 = 1 - 2 * part;
								
								x = sign1 * g.width( t ) / 2;
								
								if ( g.lidHinges[ part ] === 0 ) { 
								
									x += sign1 * Math.sin( g.lidAngles[ part ](t) ) * ni * g.depthP( t );
									y = ( Math.cos( g.lidAngles[ part ](t) ) * ni - 0.5) * g.heightP( t ); // to y
									z = ( nj - 0.5 ) * g.depthP( t );
																						
								} else {
									
									x += sign1 * Math.sin( g.lidAngles[ part ](t) ) * nj * g.heightP( t );
									y = ( ni - 0.5 ) * g.heightP( t );
									z = ( Math.cos( g.lidAngles[ part ](t) ) * nj - 0.5 ) * g.depthP( t ); // to z 
									
								}
								
							}
												
							if ( part === 2 || part === 3 ) {
							
								sign1 = 5 - 2 * part;
									
								y = sign1 * g.height( t ) / 2;
								
								if ( g.lidHinges[ part ] === 0 ) { 
								
									x = ( nj - 0.5 ) * g.widthP( t );
									y += sign1 * Math.sin( g.lidAngles[ part ](t) ) * ni * g.depthP( t );
									z = ( Math.cos( g.lidAngles[ part ](t) ) * ni - 0.5 ) * g.depthP( t ); // to z
									
								} else {
								
									x = (  Math.cos( g.lidAngles[ part ](t) ) * nj - 0.5 ) * g.widthP( t ); // to x
									y += sign1 * Math.sin( g.lidAngles[ part ](t) ) * nj * g.widthP( t );
									z = ( ni - 0.5 ) * g.depthP( t );
									
								}
							
							}
							
							if ( part > 3 ) {
								
								sign1 = 9 - 2 * part;
								
								z = sign1 * g.depth( t ) / 2;
								
								if ( g.lidHinges[ part ] === 0 ) { 
											
									x = ( Math.cos( g.lidAngles[ part ](t) ) * nj - 0.5 ) * g.widthP( t ); //  to x
									y = ( ni - 0.5 ) * g.heightP( t );
									z += sign1 * Math.sin( g.lidAngles[ part ](t) ) * nj * g.widthP( t );
																
								} else {
								
									x = ( nj - 0.5 ) * g.widthP( t );
									y = ( Math.cos( g.lidAngles[ part ](t) ) * ni - 0.5 ) * g.heightP( t );  // to y
									z += sign1 * Math.sin( g.lidAngles[ part ](t) ) * ni * g.heightP( t );
									
								}	
							
							}
											
						}
						
					}
					
					if ( type === 'edge' ) {
		
						theta = pi2 * ( 1 - ni );
						
						if ( part < 4 ) {
						
							sign1 = part < 2 ? -1 : 1; 
							sign2 = ( part === 1 ) || ( part === 2 ) ? -1 : 1;
							
							x = ( nj - 0.5 ) * g.widthP( t );
							y = sign1 * g.radius( t ) * sinuslike( theta ) + sign1 * g.heightP( t ) / 2;
							z = sign2 * g.radius( t ) * cosinuslike( theta ) + sign2 * g.depthP( t ) / 2; 
							
						}
						
						if ( part > 3 && part < 8 ) {
							
							sign1 = ( part === 5 ) || ( part === 6 ) ? -1 : 1;
							sign2 = part < 6 ? -1 : 1;
							
							x = sign1 * g.radius( t ) * sinuslike( theta ) + sign1 * g.widthP( t ) / 2;
							y = ( nj - 0.5 ) * g.heightP( t );
							z = sign2 * g.radius( t ) * cosinuslike( theta ) + sign2 * g.depthP( t ) / 2;
							
						}
						
						if ( part > 7 ) {
							
							sign1 = part > 9 ? -1 : 1;  
							sign2 = ( part === 9 ) || ( part === 10 ) ? 1 : -1;
						
							x = sign1 * g.radius( t ) * sinuslike( theta ) + sign1 * g.widthP( t ) / 2;
							y = sign2 * g.radius( t ) * cosinuslike( theta ) + sign2 * g.heightP( t ) / 2;
							z = ( nj - 0.5 ) * g.depthP( t );
							
						}
						
					}
					
					vIdx = ( 2 * s2 + 1 ) * j + i + vPartIdx;	// vertex index
								
					for ( var p = 0; p < g.vertexPositions[ vIdx ].length; p ++) {
						
						g.positions[ g.vertexPositions[ vIdx ][ p ] ] = x;
						g.positions[ g.vertexPositions[ vIdx ][ p ] + 1 ] = y;
						g.positions[ g.vertexPositions[ vIdx ][ p ] + 2 ] = z;
						
					}
					
				}
				
			}
			
			// center points
			
			for ( var j = 0; j < s1; j ++ ) {
			
				nj = j / s1;
			
				for ( var i = 0; i  < s2; i ++ ) {
					
					ni =  i / s2;
					
					waffleVidx =  ( 2 * s2 + 1 ) * j + i + s2 + 1  + vPartIdx ;
					posIdx = ( 4 * ( j * s2 + i ) + fPartIdx ) * 9 ; // position index ( 4 faces / segment with 9 positions)
					
					// xyzCenterPoint
					
					f0Vec.x = 0;
					f0Vec.y = 0;
					f0Vec.z = 0;
					
					f0Vec.x += g.positions[ posIdx + 3 ];	// lower face, b, x
					f0Vec.x += g.positions[ posIdx + 6 ];	// lower face, c, x
					f0Vec.x += g.positions[ posIdx + 30 ];	// upper face, b, x
					f0Vec.x += g.positions[ posIdx + 33 ];	// upper face, c, x
					
					f0Vec.y += g.positions[ posIdx + 4 ];	// lower face, b, y
					f0Vec.y += g.positions[ posIdx + 7 ];	// lower face, c, y
					f0Vec.y += g.positions[ posIdx + 31 ];	// upper face, b, y
					f0Vec.y += g.positions[ posIdx + 34 ];	// upper face, c, y
					
					f0Vec.z += g.positions[ posIdx + 5 ];	// lower face, b, z
					f0Vec.z += g.positions[ posIdx + 8 ];	// lower face, c, z
					f0Vec.z += g.positions[ posIdx + 32 ];	// upper face, b, z
					f0Vec.z += g.positions[ posIdx + 35 ];	// upper face, c, z
					
					f0Vec.x *= 0.25;
					f0Vec.y *= 0.25;
					f0Vec.z *= 0.25;
		
					// wafflePoint();
					f1Vec.x = g.positions[ posIdx + 33 ] - g.positions[ posIdx + 6 ]; // left top -  right bottom
					f1Vec.y = g.positions[ posIdx + 34 ] - g.positions[ posIdx + 7 ];
					f1Vec.z = g.positions[ posIdx + 35 ] - g.positions[ posIdx + 8 ];
					
					f2Vec.x = g.positions[ posIdx + 3 ] - g.positions[ posIdx + 30 ]; // left bottom - right top
					f2Vec.y = g.positions[ posIdx + 4 ] - g.positions[ posIdx + 31 ];
					f2Vec.z = g.positions[ posIdx + 5 ] - g.positions[ posIdx + 32 ];
					
					// cross product
					
					normal.x = f1Vec.y * f2Vec.z - f1Vec.z * f2Vec.y;
					normal.y = f1Vec.z * f2Vec.x - f1Vec.x * f2Vec.z;
					normal.z = f1Vec.x * f2Vec.y - f1Vec.y * f2Vec.x;
					
					lenV = Math.sqrt( normal.x * normal.x + normal.y * normal.y + normal.z * normal.z );
					
					//normalize
									
					normal.x = -g.waffleDeep( t ) * normal.x / lenV;
					normal.y = -g.waffleDeep( t ) * normal.y / lenV;
					normal.z = -g.waffleDeep( t ) * normal.z / lenV;
				
					f0Vec.x += normal.x;
					f0Vec.y += normal.y;
					f0Vec.z += normal.z;			
					
					// set positions
					
					for ( var p = 0; p < g.vertexPositions[ waffleVidx ].length; p ++) {
						
						g.positions[ g.vertexPositions[ waffleVidx][ p ] ] = f0Vec.x;
						g.positions[ g.vertexPositions[ waffleVidx ][ p ] + 1 ] = f0Vec.y;
						g.positions[ g.vertexPositions[ waffleVidx ][ p ] + 2 ] = f0Vec.z;
						
					}
					
				}
		
			}
	
		}
		
		function normalsPartPlaneEdge( part ) { 
		
			// face normals
			
			for ( var f = fPartIdx; f < fPartIdx + s1 * s2 * 4 ; f ++ ) {
				
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
				//  							 +   g.vertexFaces.length part
			for ( var v = vPartIdx; v < vPartIdx + ( 2 * s2 + 1 ) * s1 + s2 + 1; v ++ ) {
				
				normal.x = 0;
				normal.y = 0;
				normal.z = 0;
				
				// add face normals	
				
				for ( var f = 0; f < g.vertexFaces[ v ].length; f ++ ) {
					
					normal.x += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 ];
					normal.y += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 + 1 ];
					normal.z += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 + 2 ];
					
				}
				
				// normalize
				
				lenV = Math.sqrt( normal.x * normal.x + normal.y * normal.y + normal.z * normal.z );
				
				normal.x = normal.x / lenV;
				normal.y = normal.y / lenV;
				normal.z = normal.z / lenV;
				
				// write the vertex normals corresponding to positions 
				
				for ( var f = 0; f < g.vertexFaces[ v ].length; f ++ ) {
					
					g.normals[ g.vertexPositions[ v ][ f ] ] = normal.x;
					g.normals[ g.vertexPositions[ v ][ f ] + 1 ] = normal.y;
					g.normals[ g.vertexPositions[ v ][ f ] + 2 ] = normal.z;
					
				}
				
			}
					
		}
		
		function explodePartPlaneEdge( part ) { 
		
			// explode with 'center' mode
			
			if (  !g.explodeDefault && g.explodemode === 'center' ) {
			
				for ( var j = 0; j < s1; j ++ ) {
				
					nj = j / s1;
				
					for ( var i = 0; i  < s2; i ++ ) {
						
						ni = i / s2;
						
						waffleVidx =  ( 2 * s2 + 1 ) * j + i + s2 + 1  + vPartIdx ;
						posIdx = ( 4 * ( j * s2 + i ) + fPartIdx ) * 9 ; // position index ( 4 faces / segment with 9 positions)
								
						x = g.positions[ g.vertexPositions[ waffleVidx][ 0 ] ] * g.explode( t );
						y = g.positions[ g.vertexPositions[ waffleVidx ][ 0 ] + 1 ] * g.explode( t );
						z = g.positions[ g.vertexPositions[ waffleVidx ][ 0 ] + 2 ] * g.explode( t );
						
						// set positions
						for ( var p = posIdx; p < posIdx + 36 ; p += 3) {
							
							g.positions[ p ] += x;
							g.positions[ p + 1 ] += y;
							g.positions[ p + 2 ] += z;
							
						}
						
					}
					
				}
				
			}	
		
		}
		
		// ------------------------------------	
		
		verticesPartPlaneEdge( part );
		normalsPartPlaneEdge( part );
		if ( !g.explodeDefault && g.explodemode === 'center' ) explodePartPlaneEdge( part ); // explode with 'center' mode
		
	}
	
	function morphPartSphere( part ) {
				
		var vIdx;	// vertex index
		var posIdx;
		var posIdx0;

		var x, y, z;
		var theta;
		var phi;
	
		var lenV;	// length of vector
		var f1Vec = {};
		var f2Vec = {};
		var normal = {};
		
		function xyzCalculation( ) {
			
			x = g.radius( t ) * cosinuslike( theta ) * cosinuslike( phi );
			y = g.radius( t ) * sinuslike( theta );
			z = -g.radius( t ) * cosinuslike( theta ) * sinuslike( phi );
			
			x += signX * signY * g.widthP( t ) / 2;
			y += signY * g.heightP( t ) / 2;
			z += signZ * signY * g.depthP( t ) / 2;	
			
		}
		
		function storeVertexPositions( ) {
			
			for ( var p = 0; p < g.vertexPositions[ vIdx ].length; p ++ ) {
				
				g.positions[ g.vertexPositions[ vIdx ][ p ] ] = x;
				g.positions[ g.vertexPositions[ vIdx ][ p ] + 1 ] = y;
				g.positions[ g.vertexPositions[ vIdx ][ p ] + 2 ] = z;
				
			}
			
		}
		
		function verticesPartSphere( part ) {
			
			vIdx = g.vCornersIdx[ part ];	// pole
			
			theta = signY * pi2; 
			phi = pi2 * ( part % 4 );

			xyzCalculation( );
			storeVertexPositions( );
			
			vIdx ++;
			
			for ( var i = 1; i <= sm; i ++ ) {
				
				theta = signY * pi2 * ( 1 -  i / sm );
				
				phi = pi2 * ( part % 4 );
				
				for ( var j = 0; j <= i ; j ++ ) {
					
					xyzCalculation( );
					storeVertexPositions( );
					
					vIdx ++;
					
					phi +=  pi2 / i;
					
				}
				
			}
		
		}
		
		function normalsPartSphere( part ) {
			
			// face normals (needed for vertex normals) 
						
			for ( var f = g.fCornersIdx[ part ]; f < g.fCornersIdx[ part ] + sm * sm ; f ++ ) {
				
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
			
			for ( var v = g.vCornersIdx[ part ]; v < g.vCornersIdx[ part ] + ( sm + 1 ) * ( sm + 2 ) / 2; v ++ ) {
				
				normal.x = 0;
				normal.y = 0;
				normal.z = 0;
				
				// add face normals	
				
				for ( var f = 0; f < g.vertexFaces[ v ].length; f ++ ) {
					
					normal.x += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 ];
					normal.y += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 + 1 ];
					normal.z += g.faceNormals[ g.vertexFaces[ v ][ f ] / 3 + 2 ];
					
				}
				
				//  normalize
								
				// no edge
								
				lenV = Math.sqrt( normal.x * normal.x + normal.y * normal.y + normal.z * normal.z );
				
				normal.x = normal.x / lenV;
				normal.y = normal.y / lenV;
				normal.z = normal.z / lenV;
				
				// write the vertex normals corresponding to positions
				
				for ( var f = 0; f < g.vertexFaces[ v ].length; f ++ ) {
					
					g.normals[ g.vertexPositions[ v ][ f ] ] = normal.x;
					g.normals[ g.vertexPositions[ v ][ f ] + 1 ] = normal.y;
					g.normals[ g.vertexPositions[ v ][ f ] + 2 ] = normal.z;
					
				}
				
			}
			
		}
		
		function explodePartSphere( part ) {
		
			// explode with 'center' mode
		
			for ( var f = g.fCornersIdx[ part ]; f < g.fCornersIdx[ part ] + sm * sm; f ++ ) {
				
				posIdx = f * 9;
				
				x = 0;
				y = 0;
				z = 0;
	
				x += g.positions[ posIdx ] + g.positions[ posIdx  + 3 ] + g.positions[ posIdx  + 6 ];
				y += g.positions[ posIdx + 1 ] + g.positions[ posIdx  + 4 ] + g.positions[ posIdx  + 7 ];
				z += g.positions[ posIdx + 2 ] + g.positions[ posIdx  + 5 ] + g.positions[ posIdx  + 8 ];
				
				x = g.explode( t ) * x / 3;
				y = g.explode( t ) * y / 3; 
				z = g.explode( t ) * z / 3;
				
				for ( var p = 0; p < 9; p += 3 ) {
				
					g.positions[ posIdx + p ] += x; 
					g.positions[ posIdx + p + 1 ] += y;
					g.positions[ posIdx + p + 2 ] += z;
					
				}	
				
			}
			
		}
		
		// ------------------------------------	
		
		signY = part < 4 ? 1 : -1;		// first, because signY is required for signX, signZ
		signX = ( ( part % 4 ) % 3 === 0 ? 1 : -1 ) * signY;
		signZ = ( ( part % 4 ) > 1 ? 1 : -1 ) * signY;
		
		verticesPartSphere( part );	// faces to vertex
		normalsPartSphere( part );	// normals to vertex
		if ( !g.explodeDefault && g.explodemode === 'center' ) explodePartSphere( part ); // explode with 'center' mode
		
	}
 
 // -------------------------------------------------------------------
 	
	g.attributes.position.needsUpdate = true;
	g.attributes.normal.needsUpdate = true;
	
	g.faceNormals = [];			// clear face normals
	
	// set vertex positions and calculate normals (up to 26 parts)
	
	// planes
	for ( var i = 0; i < 6; i ++ ) {
		
		 if ( g.fPlanesIdx[ i ] !== -1 ) morphPlaneEdge( 'plane', i );
		
	}
	
	// edges
	for ( var i = 0; i < 12; i ++ ) {
		
		if ( g.fEdgesIdx[ i ] !== -1 ) morphPlaneEdge( 'edge', i )
		
	}
	
	// corners	
	for ( var cor = 0; cor < 8; cor ++ ) {
	
		if ( g.fCornersIdx[ cor ] !== -1 ) morphPartSphere( cor );
				
	}
	
	// explode with 'normal' mode ( for all faces in all parts )

	if ( !g.explodeDefault && g.explodemode === 'normal' ) {
		
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

exports.createMagicBox = createMagicBox;
exports.buildMagicBox = buildMagicBox;
exports.morphVerticesMagicBox =	morphVerticesMagicBox;		
	
// ..................................... Magic Sphere .............................................

function createMagicSphere( p ) {
	
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
		pointY,			// normallyinterval 0 to 1
		driftX,
		driftY,
		driftZ,
		explode,		// factor for exploded view - non indexed BufferGeometry
		
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
	g.explodemode =	p.explodemode !== undefined ? p.explodemode	: 'center'; // 'normal'

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
		
		// vIdx = v8Idx;
		
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
		
		var ieqt;
		var du = 1 / eqt;
		
		vIdx = v8Idx;	// pole
		
		if ( g.uvmode === 0 ) {
		
			ux = 0.5;
			uy = 1;

			storePosUvs();
			vIdx ++;
									
			for ( var i = 1; i <= eqt; i ++ ) {
				
				ux =  0.5 - signY * i * du / 2;
				uy -= du;
								
				for ( var j = 0; j <= i ; j ++ ) {
																
					storePosUvs();
					vIdx ++;
					ux += signY * du;
									
				}
				
			}
					
		}
		
		if (  g.uvmode === 1 ) {
		
			ux = 0.5;
			uy = 0.5;
			
			storePosUvs();
			vIdx ++;
			
			for ( var i = 1; i <= eqt; i ++ ) {
				
				ieqt = i / eqt;
				
				phi = pi2 * ( part % 4 );
								
				for ( var j = 0; j <= i ; j ++ ) {
					
					//ux = 0.5 * ( 1 + signY * ieqt * Math.sin( phi ) ); // mirrored
					ux = 0.5 * ( 1 - signY * ieqt * Math.sin( phi ) );
					uy = 0.5 * ( 1 + ieqt  * Math.cos( phi ) );
													
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
				
				g.addGroup( pos, 3, prt + 1 ); // material
				
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
	
	function explodePartSphere(  ) {

		// explode with 'center' mode
	
		for ( var f = f8Idx; f < f8Idx + eqt * eqt; f ++ ) {
			
			posIdx = f * 9;
			
			x = 0;
			y = 0;
			z = 0;
	
			x += g.positions[ posIdx ] + g.positions[ posIdx  + 3 ] + g.positions[ posIdx  + 6 ];
			y += g.positions[ posIdx + 1 ] + g.positions[ posIdx  + 4 ] + g.positions[ posIdx  + 7 ];
			z += g.positions[ posIdx + 2 ] + g.positions[ posIdx  + 5 ] + g.positions[ posIdx  + 8 ];
			
			x = g.explode( t ) * x / 3;
			y = g.explode( t ) * y / 3; 
			z = g.explode( t ) * z / 3;
			
			for ( var p = 0; p < 9; p += 3 ) {
			
				g.positions[ posIdx + p ] += x; 
				g.positions[ posIdx + p + 1 ] += y;
				g.positions[ posIdx + p + 2 ] += z;
				
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
			if ( !g.explodeDefault && g.explodemode === 'center' ) explodePartSphere( ); // explode with 'center' mode
			
			v8Idx += ( eqt + 1 ) * ( eqt + 2 ) / 2;
			f8Idx += eqt * eqt;
			
		}
		
	}	
	
	// explode with 'normal' mode (faces of all parts)
	
	if ( !g.explodeDefault && g.explodemode === 'normal' ) {
		
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

exports.createMagicSphere = createMagicSphere;
exports.buildMagicSphere = buildMagicSphere;
exports.morphVerticesMagicSphere =	morphVerticesMagicSphere;

// ..................................... Labyrinth-3D-2D ..........................................

function createLabyrinth( dim, design, m ) {

	/* parameters:  
	dim: '2D' or '3D'
	design : arays as in the examples 
	m: arays for material index as in the examples 


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
	
	//_____________________________________________
	
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
	
	var materialIndex = [
	// upper storey first
	// px, nx, py, ny, pz, nz 
	[ 0, 1, 2, 3, 4, 5 ], 
	[ 0, 0, 1, 1, 2, 2 ],
	[ 6, 7, 6, 7, 6, 7 ],
	];
	
	//--------------------------------------------------------------
	
	design 2D 
	only icon + 
	All the neighboring boxes are connected. There's no way out!
	
	var design2D = [  // will be converted to design 3D
	' ++++++++++   ',
	' +++  ++  ++  ',
	' +++  +++     ',
	'++ ++ ++++++++',
	' +++++ + +   +',
	'   +  ++ +++++',
	'   ++++  +    '
	];
	
	var materialIndex = [
	// px, nx, py, ny, pz, nz 
		0, 1, 2, 3, 4, 5 
	];
		
	*/

	g = this;  //  THREE.BufferGeometry() - non indexed BufferGeometry object from three.js
	
	g.dim = dim;
	g.storeys = ( dim === '3D' ) ? design.length : 1;
	
	if ( dim === '3D' ) {
		
		g.design = design;
		
	} else {
		
		// convert design 2D style to 3D style
		g.design = [];
		g.design.push( [] ); // create a storey
		var dRows = design.length;
		var dCols;
		var row;
		
		for( var f = 0; f < g.storeys; f ++ ) { 

			for( var r = 0; r < dRows; r ++ ) {
				
				dCols = design[ r ].length;
				row = '';
				
				for( var c = 0; c < dCols; c ++ ) {	
				
					row = row + convertDesign2D( design );
							
				}
				
				g.design[ 0 ].push( row );
				
			}
	
		} 
		
	}
	
	if ( dim === '3D' ) {
		
		g.m =  m 
		
	} else {
		
		g.m = [];
		g.m.push( m ); // for storey 0
	}
	
	g.buildLabyrinth = buildLabyrinth;
	
	g.buildLabyrinth();
	
		
	function convertDesign2D( dsgn ) {
	
		var left = false;
		var front = false;
		var right = false;
		var back = false;
	
		if ( dsgn[ r ][ c ] === '+' ) {
			
			if( c === 0 ) { left = true }	else { if( dsgn[ r ][ c-1 ] !== '+' ) { left = true } };
			if( r === 0 ) { front = true }	else { if( dsgn[ r-1 ][ c ] !== '+' ) { front = true } };
			if( c === dCols - 1 ) { right = true }	else { if( dsgn[ r ][ c+1 ] !== '+' ) { right = true } };
			if( r === dRows - 1 ) { back = true }	else { if( dsgn[ r+1 ][ c ] !== '+' ) { back = true } };
	
			if ( left && front && right && back ) return 'G';
			if ( left && front && right && !back ) return 'M';
			if ( left && front && !right && back ) return 'C';
			if ( !left && front && right && back ) return '3';
			if ( left && !front && right && back ) return 'U';
			if ( left && !front && right && !back ) return 'H';
			if ( !left && front && !right && back ) return ':';
			if ( left && front && !right && !back ) return 'F';
			if ( !left && front && right && !back ) return '7';
			if ( left && !front && !right && back ) return 'L';
			if ( !left && !front && right && back ) return 'J';
			if ( left && !front && !right && !back ) return 'I';
			if ( !left && !front && right && !back ) return '1';
			if ( !left && front && !right && !back ) return '-';
			if ( !left && !front && !right && back ) return '.';
			if ( !left && !front && !right && !back ) return '*';
			
		} else { 
			// elseif ( dsgn[ r ][ c ] === '.' )  
		return  ' ';  // String.fromCharCode(32); // space
		
		}	
		
	}
	
} 

function buildLabyrinth( ) {

	g = this;
	
	var s;
	var icon;
	var c1, f1, r1; // next column x, floor y, row z 
	var planesPos = [];
	var posIdx = 0; 
	var planesUVs = [];
	var uvIdx = 0;
	var groupStart = 0;
		
	// count faces
	g.faceCount = 0;
	
	for( var f = 0; f < g.storeys; f ++ ) {
		
		for( var r = 0; r < g.design[ f ].length; r ++ ) {
			
			for( var c = 0; c < g.design[ f ][ r ].length; c ++ ) {
	
				icon = g.design[ g.storeys - 1 - f ][ r ][ c ];
				
				if ( icon !== ' ' ) { countFaces( icon ) } 
				
			}		
	
		}
	
	}
	
	g.positions = new Float32Array( g.faceCount * 9 );
	//g.normals = new Float32Array( g.faceCount * 9 );
	g.uvs = new Float32Array( g.faceCount * 6 );  // uv's to positions
	
	g.addAttribute( 'position', new THREE.BufferAttribute( g.positions, 3 ) );
	//g.addAttribute( 'normal', new THREE.BufferAttribute( g.normals, 3 ) );
	g.addAttribute( 'uv', new THREE.BufferAttribute( g.uvs, 2 ) );
	
	// create faces
	for( var f = 0; f < g.storeys; f ++ ) {
		
		for( var r = 0; r < g.design[ f ].length; r ++ ) {
			
			for( var c = 0; c < g.design[ f ][ r ].length; c ++ ) {
	
				icon = g.design[ g.storeys - 1 - f ][ r ][ c ];
				
				if ( icon !== ' ' ) {
					
					c1 = c + 1;
					f1 = f + 1;
					r1 = r + 1;
					
					createBox( icon )
				
				} 					
				
			}		
	
		}
	
	}
	
	function countFaces( icon ) {

		switch ( icon ) {
			case 'G':
				g.faceCount += 12;
				break;
			case 'M':   
			case 'C': 						
			case '3':
			case 'U':
				g.faceCount += 10;
				break;
			case 'H': 	
			case ':': 
			case 'F': 
			case '7': 
			case 'L': 
			case 'J':
			case '#': // only 4 side walls
				g.faceCount += 8;
				break;		
			case 'I': 
			case '1': 
			case '-':
			case '.': 
				g.faceCount += 6;
			break;
			case '*':
				g.faceCount += 4;
			break;			
			case '^':
			case 'v':
				g.faceCount += 2;
			break;
			// case 'x': 
			//  g.faceCount += 0
			//  break;							
			default: 
			//  g.faceCount += 0
		}

	}
	
	function createBox( icon ) {
		
		planesPos = [];
		planesUVs = [];
		
		s = g.storeys - 1 - f; // upper storey first
		
		switch ( icon ) {
			case 'G': box_G( );     break;
			case 'M': box_M( );     break;
			case 'C': box_C( );     break;
			case '3': box_3( );     break;
			case 'U': box_U( );     break;
			case 'H': box_H( );     break;
			case ':': box_colon( ); break;
			case 'F': box_F( );     break;
			case '7': box_7( );     break;
			case 'L': box_L( );     break;
			case 'J': box_J( );     break;
			case 'I': box_I( );     break;
			case '1': box_1( );     break;
			case '-': box_minus( ); break;
			case '.': box_dot( );   break;
			case '*': box_multi( ); break;
			case '^': box_caret( ); break;
			case 'v': box_v( );     break;
			case 'x': box_x( );     break;
			case '#': box_sharp( ); break;
			default: box_x( );
		}
		
		for ( let i = 0; i < planesPos.length; i ++ ) { 
			
			g.positions[ posIdx + i ] = planesPos[ i ];
				
		}
		
		posIdx += planesPos.length;
		
		for ( let i = 0; i < planesUVs.length; i ++ ) { 
			
			g.uvs[ uvIdx + i ] = planesUVs[ i ];
				
		}
		
		uvIdx += planesUVs.length;
		
	}	
		
	// function pushUVs( ) { planesUVs.push( 1,0, 1,1, 0,1,  1,0, 0,1, 0,0 ) } // outside
	function pushUVs( ) { planesUVs.push( 0,0, 0,1, 1,1,  0,0, 1,1, 1,0 ) }    // inside
	function groupAdd( m ) { g.addGroup( groupStart, 6, m ); groupStart += 6 }
	
	function px( ) { planesPos.push( c1,f,r, c1,f1,r, c1,f1,r1,   c1,f,r, c1,f1,r1, c1,f,r1 ); pushUVs( ); groupAdd( g.m[ s ][ 0 ] ) }
	function nx( ) { planesPos.push( c,f,r1, c,f1,r1, c,f1,r,   c,f,r1, c,f1,r, c,f,r ); pushUVs( ); groupAdd( g.m[ s ][ 1 ] ) }
	function py( ) { planesPos.push( c,f1,r1, c1,f1,r1, c1,f1,r,   c,f1,r1, c1,f1,r, c,f1,r ); pushUVs( ); groupAdd( g.m[ s ][ 2 ] ) }
	function ny( ) { planesPos.push( c,f,r, c1,f,r, c1,f,r1,   c,f,r, c1,f,r1, c,f,r1 ); pushUVs( ); groupAdd( g.m[ s ][ 3 ] ) }
	function pz( ) { planesPos.push( c1,f,r1, c1,f1,r1, c,f1,r1,   c1,f,r1, c,f1,r1, c,f,r1 ); pushUVs( ); groupAdd( g.m[ s ][ 4 ] ) }
	function nz( ) { planesPos.push( c,f,r, c,f1,r, c1,f1,r,   c,f,r, c1,f1,r, c1,f,r ); pushUVs( ); groupAdd( g.m[ s ][ 5 ] ) }
	
	function box_G( ) { px( ); nx( ); py( ); ny( ); pz( ); nz( ) }
	function box_M( ) { px( ); nx( ); py( ); ny( ); nz( ) }
	function box_C( ) { nx( ); py( ); ny( ); pz( ); nz( ) }
	function box_3( ) { px( ); py( ); ny( ); pz( ); nz( ) }
	function box_U( ) { px( ); nx( ); py( ); ny( ); pz( ) }
	function box_H( ) { px( ); nx( ); py( ); ny( ) }
	function box_colon( ) { py( ); ny( ); pz( ); nz( ) }
	function box_F( ) { nx( ); py( ); ny( ); nz( ) }
	function box_7( ) { px( ); py( ); ny( );  nz( ) }
	function box_L( ) { nx( ); py( ); ny( ); pz( ) }
	function box_J( ) { px( ); py( ); ny( ); pz( ) }
	function box_I( ) { nx( ); py( ); ny( ) }
	function box_1( ) { px( ); py( ); ny( ) }
	function box_minus( ) { py( ); ny( ); nz( ) }
	function box_dot( ) { py( ); ny( ); pz( ) }
	function box_multi( ) { py( ); ny( ) };
	function box_caret( ) { ny( ) }
	function box_v( ) { py( ) }
	function box_x( ) {  }
	function box_sharp( ) { px( ); nx( ); pz( ); nz( ) }
	
}

exports.createLabyrinth = createLabyrinth;
exports.buildLabyrinth = buildLabyrinth;

// ..................................... Line Grid ...................................................

function createLineGrid( design, multiMaterial, width, height, depth ) {  
		// multiMaterial, width, height, depth are optional, if not available the design dimension is used
	
	// multiMaterial: mode 'align' (2 materials) or 'side' (default, up to 6 materials)
	
	/*________________________________________________
	
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
	__________________________________________________
	
	EXAMPLES
	
	Note: Half the length of the first string on each plane determines the center of the design.
	
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
	_______________________________________________*/
	
	g = this;  //  THREE.BufferGeometry() - geometry object from three.js
	
	g.multiMaterial = multiMaterial || 'side'; // 'align'
	g.plane = false;
	
	var icon, bin, rows, cols;
	var charRow, binRow;
	
	if ( Array.isArray( design[ 0 ] ) ) {
		
		g.dsgn = design;
		
	} else {
		
	 	g.dsgn = [ [], [], [], [], design ]; // like pz but uses first material
		g.plane = true;
		
	}
	
	g.sides = g.dsgn.length;
	
	g.w2 = 0; // width / 2
	g.h2 = 0; // height / 2
	g.d2 = 0; //depth / 2
	
	// convert design to binary form, count lines
	
	g.convDsgn = [];
	g.binDsgn = [];
	g.lines = []; // lines per side (cumulative)
	g.lineCount = 0;

	// strings split 
	
	for( var s = 0; s < g.sides; s ++ ) {
		
		g.convDsgn.push( [] );
		rows = g.dsgn[ s ].length;
		
		if ( rows !== 0  ) {
			
			for( var r = 0; r < g.dsgn[ s ].length; r ++ ) {
				
				charRow = [];
				cols = g.dsgn[ s ][ r ].length;
				
				for( var c = 0; c < cols; c ++ ) {
					
					charRow.push( g.dsgn[ s ][ r ][ c ] );
					
				}
				
				g.convDsgn[ s ].push( charRow );
				
			}
			
		}
		
	}
	
	for( var s = 0; s < g.sides; s ++ ) {
		
		g.binDsgn.push( [] );
		rows = g.convDsgn[ s ].length;
		
		if ( rows !== 0  ) {
			
			// // replace icon '+'
			for( var r = 0; r < g.convDsgn[ s ].length; r ++ ) {
				
				binRow = [];
				cols = g.convDsgn[ s ][ r ].length;
				
				for( var c = 0; c < cols; c ++ ) {
					
					if ( g.convDsgn[ s ][ r ][ c ] === '+' ) g.convDsgn[ s ][ r ][ c ] = convertPlus( s );
					
					binRow.push( toBinary( g.convDsgn[ s ][ r ][ c ] ) ); // convert to binary
					
				}
				
				g.binDsgn[ s ].push( binRow );
				
				// determine  width, height,  depth
				if ( width === undefined && ( s === 0 || s === 1 ) && r === 0 ) { g.w2 = Math.max( g.w2, cols ); }
				if ( height === undefined  && ( s === 2 || s === 3 ) && r === 0 ) { g.h2 = Math.max( g.h2, cols ); }
				if ( depth === undefined && ( s === 4 || s === 5 ) && r === 0 ) { g.d2 = Math.max( g.d2, cols ); }
				
			}
			
			// delete double lines, uses 0bLeftFrontRightBack
			
			for( let r = 1; r < rows; r ++ ) {
				
				cols = g.binDsgn[ s ][ r ].length;
				
				for( let c = 0; c < cols; c ++ ) {
					
					
					g.binDsgn[ s ][ r ][ c ] = ( ( g.binDsgn[ s ][ r - 1 ][ c ] & 0b0001 ) << 2 ) ^ g.binDsgn[ s ][ r ][ c ];
					
				}
				
			}
			
			for( let r = 0; r < rows; r ++ ) {
				
				cols = g.binDsgn[ s ][ r ].length;
				
				for( let c = 1; c < cols; c ++ ) {
					
					g.binDsgn[ s ][ r ][ c ] = ( ( g.binDsgn[ s ][ r ][ c - 1 ] & 0b0010 ) << 2 ) ^ g.binDsgn[ s ][ r ][ c ];
					
				}
				
			}
			
			for( let r = 0; r < rows; r ++ ) {
			
				cols = g.binDsgn[ s ][ r ].length;
				
				for( let c = 0; c < cols; c ++ ) {
					
					bin = g.binDsgn[ s ][ r ][ c ];
					
					g.lineCount += ( ( bin & 0b1000 ) >> 3 ) + ( ( bin & 0b0100 ) >> 2 ) + ( ( bin & 0b0010 ) >> 1 ) + ( bin & 0b0001 );
					
				}
				
			}
			
		}
		
		g.lines.push( g.lineCount ); // cumulative also for empty sides
		
	}
	
	g.w2 = width === undefined ? g.w2 / 2 : width / 2;
	g.h2 = height === undefined ? g.h2 / 2 : height / 2;
	g.d2 = depth === undefined ?  g.d2 / 2 : depth / 2;
	
	g.d2 = g.plane ? 0 : g.d2;
	
	design = [];     //......................
	g.dsgn = [];     //...... DELETE ........
	g.convDsgn = []; //......................
	
	g.buildLineGrid = buildLineGrid;
	g.buildLineGrid();
	
	// detail functions
	
	function getIcon( l, f, r, b ) { 
		
		// left, front, right, back
		
		if ( l && f && r && b ) return 'G';
		if ( l && f && r && !b ) return 'M';
		if ( l && f && !r && b ) return 'C';
		if ( !l && f && r && b ) return '3';
		if ( l && !f && r && b ) return 'U';
		if ( l && !f && r && !b ) return 'H';
		if ( !l && f && !r && b ) return ':';
		if ( l && f && !r && !b ) return 'F';
		if ( !l && f && r && !b ) return '7';
		if ( l && !f && !r && b ) return 'L';
		if ( !l && !f && r && b ) return 'J';
		if ( l && !f && !r && !b ) return 'I';
		if ( !l && !f && r && !b ) return '1';
		if ( !l && f && !r && !b ) return '-';
		if ( !l && !f && !r && b ) return '.';
		if ( !l && !f && !r && !b ) return ' '; // space
		
	}
	
	function convertPlus( s ) {
		
		var left = false;
		var front = false;
		var right = false;
		var back = false;
		
		if( c === 0 ) { left = true } else { if( g.dsgn[ s ][ r ][ c-1 ] !== '+' ) { left = true } };
		if( r === 0 ) { front = true } else { if( g.dsgn[ s ][ r-1 ][ c ] !== '+' ) { front = true } };
		if( c === cols - 1 ) { right = true } else { if( g.dsgn[ s ][ r ][ c+1 ] !== '+' ) { right = true } };
		if( r === rows - 1 ) { back = true } else { if( g.dsgn[ s ][ r+1 ][ c ] !== '+' ) { back = true } };
		
		return getIcon( left, front, right, back );
		
	}
	
	function toBinary( icon ) {
		
		switch ( icon ) {
			
			// bits for left front right back
			case '+': return 0b0000; break; // '+' area limits are determined later
			case 'G': 						// compatible to labyrinth design
			case '#': return 0b1111; break;
			case 'M': return 0b1110; break;
			case 'C': return 0b1101; break;
			case '3': return 0b0111; break;
			case 'U': return 0b1011; break;
			case 'H': return 0b1010; break;
			case ':': return 0b0101; break;
			case 'F': return 0b1100; break;
			case '7': return 0b0110; break;
			case 'L': return 0b1001; break;
			case 'J': return 0b0011; break;
			case 'I': return 0b1000; break;
			case '1': return 0b0010; break;
			case '-': return 0b0100; break;
			case '.': return 0b0001; break;
			case ' ': return 0b0000; break;  // not affected
			
		}
		
	}
	
}

function buildLineGrid( ) {
	
	var rows, cols;
	var bin;
	var sign;
	var horizPos;
	var vertiPos;
	var horizUVs;
	var vertiUVs;
	var posIdx = 0;
	var uvIdx = 0;
	var i0, i1, j0, j1, p0, p1, q0, q1;
	
	g.prevLineCount = 0;
	
	g.positions = new Float32Array( g.lineCount * 6	);
	g.uvs = new Float32Array( g.lineCount * 4 );  // uv's to positions
	g.addAttribute( 'position', new THREE.BufferAttribute( g.positions, 3 ) );
	g.addAttribute( 'uv', new THREE.BufferAttribute( g.uvs, 2 ) );
	
	// create lines
	
	for( var s = 0; s < g.sides; s ++ ) {
		
		if ( g.binDsgn[ s ].length !== 0  ) {
			
			rows = g.binDsgn[ s ].length;
			cols = g.binDsgn[ s ][ 0 ].length;
			
			sign = ( s === 0 || s === 2 || s === 5 ) ? -1 : 1;
			
			for( var r = 0; r < rows; r ++ ) {
				
				for( var c = 0; c < g.binDsgn[ s ][ r ].length; c ++ ) {
					
					bin = g.binDsgn[ s ][ r ][ c ];
					
					if ( bin !== 0b0000 ) {
						
						// positions
						i0 = sign * ( c - cols / 2 );
						i1 = i0 + sign;
						j0 = -r + rows / 2;
						j1 = j0 - 1;
						
						// uv's
						p0 = c / cols;
						p1 = ( c + 1 ) / cols;
						q0 = ( rows - r - 1) / rows;
						q1 = ( rows - r ) / rows;
						
						createLines( bin );
						
					}
					
				}
				
			}
			
			if ( g.multiMaterial === 'side') {
				
				g.addGroup( g.prevLineCount * 2, ( g.lines[ s ] - g.prevLineCount ) * 2, g.plane ? 0 : s );
				g.prevLineCount = g.lines[ s ];
				
			}
			
		}
		
	}
	
	// detail functions
	
	function createLines( bin ) {
		
		horizPos = [];
		vertiPos = [];
		horizUVs = [];
		vertiUVs = [];
		
		if ( ( bin & 0b1000 ) !== 0 ) { left( s ) } 
		if ( ( bin & 0b0100 ) !== 0 ) { front( s ) }
		if ( ( bin & 0b0010 ) !== 0 ) { right( s ) }
		if ( ( bin & 0b0001 ) !== 0 ) { back( s ) }
		
		// copy positions into Buffer // multi material 'align' -> add group  (material 0, 1)
		
		for ( let i = 0; i < horizPos.length; i ++ ) { g.positions[ posIdx + i ] = horizPos[ i ]; }
		
		if ( g.multiMaterial === 'align') { g.addGroup( posIdx / 3, horizPos.length / 3, 0 ); }
		
		posIdx += horizPos.length;
		
		for ( let i = 0; i < vertiPos.length; i ++ ) { g.positions[ posIdx + i ] = vertiPos[ i ]; }
		
		if ( g.multiMaterial === 'align') { g.addGroup( posIdx / 3, vertiPos.length / 3, 1 ); }
		
		posIdx += vertiPos.length;
		
		// copy  uv's into Buffer
		
		for ( let i = 0; i < horizUVs.length; i ++ ) { g.uvs[ uvIdx + i ] = horizUVs[ i ]; }
		
		uvIdx += horizUVs.length;
		
		for ( let i = 0; i < vertiUVs.length; i ++ ) { g.uvs[ uvIdx + i ] = vertiUVs[ i ]; }
		
		uvIdx += vertiUVs.length;
		
	}
	
	function left( s ) {
		switch ( s ) {
			case 0: vertiPos.push( g.w2,j0,i0, g.w2,j1,i0 );   vertiUVs.push( q0,p0,q1,p0 ); break;// px
			case 1: vertiPos.push( -g.w2,j0,i0, -g.w2,j1,i0 ); vertiUVs.push( q0,p0,q1,p0 ); break;// nx
			case 2: vertiPos.push( i0,g.h2,j0, i0,g.h2,j1 );   vertiUVs.push( p0,q0,p0,q1 ); break;// py
			case 3: vertiPos.push( i0,-g.h2,j0, i0,-g.h2,j1 ); vertiUVs.push( p0,q0,p0,q1 ); break;// ny
			case 4: vertiPos.push( i0,j0,g.d2, i0,j1,g.d2 );   vertiUVs.push( p0,q0,p0,q1 ); break;// pz
			case 5: vertiPos.push( i0,j0,-g.d2, i0,j1,-g.d2 ); vertiUVs.push( p0,q0,p0,q1 ); break;// nz
		}
	}
	
	function front( s ) {
		switch ( s ) {
			case 0: horizPos.push( g.w2,j0,i0, g.w2,j0,i1 );   horizUVs.push( q0,p0,q0,p1 ); break;// px
			case 1: horizPos.push( -g.w2,j0,i0, -g.w2,j0,i1 ); horizUVs.push( q0,p0,q0,p1 ); break;// nx
			case 2: horizPos.push( i0,g.h2,j0, i1,g.h2,j0 );   horizUVs.push( p0,q0,p1,q0 ); break;// py
			case 3: horizPos.push( i0,-g.h2,j0, i1,-g.h2,j0 ); horizUVs.push( p0,q0,p1,q0 ); break;// ny
			case 4: horizPos.push( i0,j0,g.d2, i1,j0,g.d2 );   horizUVs.push( p0,q0,p1,q0 ); break;// pz
			case 5: horizPos.push( i0,j0,-g.d2, i1,j0,-g.d2 ); horizUVs.push( p0,q0,p1,q0 ); break;// nz
		}
	}
	
	function right( s ) {
		switch ( s ) {
			case 0: vertiPos.push( g.w2,j0,i1, g.w2,j1,i1 );   vertiUVs.push( q0,p1,q1,p1 ); break;// px
			case 1: vertiPos.push( -g.w2,j0,i1, -g.w2,j1,i1 ); vertiUVs.push( q0,p1,q1,p1 ); break;// nx
			case 2: vertiPos.push( i1,g.h2,j0, i1,g.h2,j1 );   vertiUVs.push( p1,q0,p1,q1 ); break;// py
			case 3: vertiPos.push( i1,-g.h2,j0, i1,-g.h2,j1 ); vertiUVs.push( p1,q0,p1,q1 ); break;// ny
			case 4: vertiPos.push( i1,j0,g.d2, i1,j1,g.d2 );   vertiUVs.push( p1,q0,p1,q1 ); break;// pz
			case 5: vertiPos.push( i1,j0,-g.d2, i1,j1,-g.d2 ); vertiUVs.push( p1,q0,p1,q1 ); break;// nz
		}
	}
	
	function back( s ) {
			switch ( s ) {
			case 0: horizPos.push( g.w2,j1,i0, g.w2,j1,i1 );   horizUVs.push( q1,p0,q1,p1 ); break;// px
			case 1: horizPos.push( -g.w2,j1,i0, -g.w2,j1,i1 ); horizUVs.push( q1,p0,q1,p1 ); break;// nx
			case 2: horizPos.push( i0,g.h2,j1, i1,g.h2,j1 );   horizUVs.push( p0,q1,p1,q1 ); break;// py
			case 3: horizPos.push( i0,-g.h2,j1, i1,-g.h2,j1 ); horizUVs.push( p0,q1,p1,q1 ); break;// ny
			case 4: horizPos.push( i0,j1,g.d2, i1,j1,g.d2 );   horizUVs.push( p0,q1,p1,q1 ); break;// pz
			case 5: horizPos.push( i0,j1,-g.d2, i1,j1,-g.d2 ); horizUVs.push( p0,q1,p1,q1 ); break;// nz
		}
	}
	
}

exports.createLineGrid = createLineGrid;
exports.buildLineGrid = buildLineGrid;

// .............................  ProfiledContourGeometryMM  .........................................

function createProfiledContourMMgeometry( profileShape, contour, contourClosed, openEnded, profileMaterial ) {
											// the last three parameters are optional	
	g = this;  //  THREE.BufferGeometry() - geometry object from three.js
			
	g.profileShape = profileShape;
	g.contour = contour;

	g.contourClosed = contourClosed !== undefined ? contourClosed : true;
	g.openEnded = openEnded !== undefined ? openEnded : false;
	g.openEnded = contourClosed === true ? false : openEnded;
	g.profileMaterial = profileMaterial !== undefined ? profileMaterial : false;
		
	if( g.contourClosed ) g.contour.push( g.contour[ 0 ], g.contour[ 1 ] );
	
	g.buildProfiledContourMMgeometry = buildProfiledContourMMgeometry;
	g.buildProfiledContourMMgeometry();
	
}
	
function buildProfiledContourMMgeometry( ) {
			
	var hs1 = g.contour.length / 2;
	var rs1 = g.profileShape.length / 2;
	var hs = hs1 - 1; // height segments 
	var rs = rs1 - 1; // radius segments
	
	var faceCount = hs * rs * 2 + ( g.openEnded ? 0 : rs * 2 );
	var posCount = hs1 * rs1 + ( g.openEnded ? 0 : 2 );
	
	g.indices = new Uint32Array( faceCount * 3 );  // indexed BufferGeometry
	g.positions = new Float32Array( posCount * 3 );
	
	g.setIndex( new THREE.BufferAttribute( g.indices, 1 ) );
	g.addAttribute( 'position', new THREE.BufferAttribute( g.positions, 3 ) );
	
	var a, b1, c1, b2, c2;
	var i1, i2;
	var xc0, yc0, xc1, yc1, xc2, yc2, xSh, xDiv;
	var dx0, dy0, dx2, dy2;
	var e0x, e0y,e0Length, e2x, e2y, e2Length, ex, ey, eLength;
	var phi, bend;
	var x, y, z;
	var vIdx, posIdx;
	var epsilon = 0.000001;
	var idx = 0;
	
	for ( var i = 0; i < hs; i ++ ) {
		
		if ( g.profileMaterial ) g.addGroup( idx, rs * 6, i ); // MultiMaterial support
		
		i1 = i + 1;
		
		for ( var j = 0; j < rs; j ++ ) {
			
			// 2 faces / segment,  3 vertex indices
			a =  rs1 * i + j;
			c1 = rs1 * i1 + j; // left 
			b1 = c1 + 1;
			//c2 = b1;         // right
			b2 = a + 1;
			
			g.indices[ idx     ] = a; // left 
			g.indices[ idx + 1 ] = b1;
			g.indices[ idx + 2 ] = c1; 
			
			g.indices[ idx + 3 ] = a; // right 
			g.indices[ idx + 4 ] = b2,
			g.indices[ idx + 5 ] = b1; // = c2
			
			if ( !g.profileMaterial ) g.addGroup( idx, 6, j ); // MultiMaterial support
			
			idx += 6;
			
		}
		
	}
	
	if( !g.openEnded ) {
		
		g.addGroup( idx, rs * 3, rs ); // MultiMaterial support
		
		a = hs1 * rs1;
		
		for ( var j = 0; j < rs; j ++ ) {
			
			g.indices[ idx     ] = a; 
			g.indices[ idx + 1 ] = j + 1;
			g.indices[ idx + 2 ] = j;
			
			idx += 3;
			
		}
		
		g.addGroup( idx, rs * 3, rs + 1 ); // MultiMaterial support
		
		a += 1; 
		
		for ( var j = rs1 + 1; j > 1; j -- ) {
			
			g.indices[ idx     ] = a; 
			g.indices[ idx + 1 ] = a - j;
			g.indices[ idx + 2 ] = a - j + 1;
			
			idx += 3;
			
		}
		
	}
	
	for ( var i = 0; i < hs1; i ++ ) {
		
		i2 = 2 * i; 
		 
		xc1 = g.contour[ i2 ];
		yc1 = g.contour[ i2 + 1 ];
				
		if ( i === 0 ) {
			
			xc0 = g.contour[ ( hs - 1 ) * 2 ]; // penultimate point
			yc0 = g.contour[ ( hs - 1 ) * 2 + 1 ];
			
		} else {
					 
			xc0 = g.contour[ i2 - 2 ]; 	// previous point
			yc0 = g.contour[ i2 - 1 ];
			
		}
		
		if ( i === hs ) {
			
			xc2 = g.contour[ 2 ];			// second point
			yc2 = g.contour[ 3 ];
			
		} else {
			 
			xc2 = g.contour[ i2 + 2 ]; 	// next point
			yc2 = g.contour[ i2 + 3 ];
			
		}	
		
		if ( !g.contourClosed ) {
			
			if ( i === 0 ) {
				
				// direction
				dx2 = xc2 - xc1;
				dy2 = yc2 - yc1;
				
				// unit vector
				e2Length = Math.sqrt( dx2 * dx2 + dy2 * dy2 );
				
				e2x = dx2 / e2Length;
				e2y = dy2 / e2Length;
				
				// orthogonal
				ex = e2y;
				ey = -e2x;
				
			}
			
			if ( i === hs ) {
				
				// direction
				
				dx0 = xc1 - xc0;
				dy0 = yc1 - yc0;
				
				// unit vector
				e0Length = Math.sqrt( dx0 * dx0 + dy0 * dy0 );
				
				e0x = dx0 / e0Length;
				e0y = dy0 / e0Length;
				
				// orthogonal
				ex = e0y;
				ey = -e0x;
				
			}
			
			xDiv = 1;
			bend = 1;
			
		}
		
		if ( ( i > 0 && i < hs ) || g.contourClosed ) {
			
			// directions
			
			dx0 = xc0 - xc1;
			dy0 = yc0 - yc1;
			
			dx2 = xc2 - xc1;
			dy2 = yc2 - yc1;
			
			if( Math.abs( ( dy2 / dx2 ) - ( dy0 / dx0 ) ) < epsilon ) { // prevent 0
				
				dy0 += epsilon;
				
			}
			
			if( Math.abs( ( dx2 / dy2 ) - ( dx0 / dy0 ) ) < epsilon ) { // prevent 0
				
				dx0 += epsilon;
				
			}  
			
			// unit vectors
			
			e0Length = Math.sqrt( dx0 * dx0 + dy0 * dy0 );
			
			e0x = dx0 / e0Length;
			e0y = dy0 / e0Length;
			
			e2Length = Math.sqrt( dx2 * dx2 + dy2 * dy2 );
			
			e2x = dx2 / e2Length;
			e2y = dy2 / e2Length;
			
			// direction transformed 
			
			ex = e0x + e2x;
			ey = e0y + e2y;
			
			eLength = Math.sqrt( ex * ex + ey * ey );
			
			ex = ex / eLength;
			ey = ey / eLength;
			
			phi = Math.acos( e2x * e0x + e2y * e0y ) / 2;
			
			bend = Math.sign( dx0 * dy2 - dy0 * dx2 ); // z cross -> curve bending
			
			xDiv = Math.sin( phi );
			
		}
		
		for ( var j = 0; j < rs1; j ++ ) {
			
			xSh = g.profileShape[ j * 2 ];
			
			x = xc1 + xSh / xDiv * bend * ex; 
			y = yc1 + xSh / xDiv * bend * ey;
			z = g.profileShape[ j * 2 + 1 ];	 // ySh
			
			vIdx = rs1 * i + j;
			
			posIdx = vIdx * 3;
			
			g.positions[ posIdx ] = x;
			g.positions[ posIdx + 1 ] = y;
			g.positions[ posIdx + 2 ] = z;
			
		}
		
	}
	
	if( !g.openEnded ) {
		
		g.positions[ hs1 * rs1 * 3 ] = g.contour[ 0 ];
		g.positions[ hs1 * rs1 * 3 + 1 ] = g.contour[ 1 ];
		g.positions[ hs1 * rs1 * 3 + 2 ] = 0;
		
		g.positions[ hs1 * rs1 * 3 + 3 ] = g.contour[ hs * 2 ];
		g.positions[ hs1 * rs1 * 3 + 4 ] = g.contour[ hs * 2 + 1 ];
		g.positions[ hs1 * rs1 * 3 + 5 ] = 0;
		
	}
	
	g.computeVertexNormals( );
	
}	

exports.createProfiledContourMMgeometry = createProfiledContourMMgeometry;
exports.buildProfiledContourMMgeometry = buildProfiledContourMMgeometry;

// .......................................  Road / Wall  ....................................................

function createRoad( curvePoints, lengthSegments, trackDistances ) {
	
	// all parameters optional
	
	g = this;  //  THREE.BufferGeometry() - geometry object from three.js
	
	g.sd = trackDistances !== undefined ?  [ [], trackDistances, [], [] ]  :  [ [], [ -0.5, 0.5 ], [], [] ]  ;
	
	g.wss = [ 0, g.sd[ 1 ].length, 0, 0 ];
	g.ws = [ 0, g.sd[ 1 ].length - 1, 0, 0 ];
	
	g.sides = [ false, true, false, false ];
	
	g.ls = lengthSegments !== undefined ? lengthSegments : 500;
	g.lss = g.ls + 1;
	
	g.cP = curvePoints !== undefined ? curvePoints : [ -10,0,5, 0,1,0, 10,0,5 ];
	
	var pts = [];
	
	for ( var i = 0; i < g.cP.length; i += 3 ) {
		
		pts.push( new THREE.Vector3( g.cP[ i ], g.cP[ i + 1 ], g.cP[ i + 2 ] ) );
		
	}
	
	g.curve = new THREE.CatmullRomCurve3( pts );
	
	g.len = g.curve.getLength( );
	
	g.points = g.curve.getPoints( g.ls );
	g.len = g.curve.getLength( );
	g.lenList = g.curve.getLengths ( g.ls );
	
	g.isWall = false;
	
	g.buildRoadWall = buildRoadWall;
	g.buildRoadWall( );
	 
}

function createWall( curvePoints, lengthSegments, sidesDistances, widthDistance, hightDistance ) {
	
	// all parameters optional
	
	g = this;  //  THREE.BufferGeometry() - geometry object from three.js
	
	g.sd = sidesDistances !== undefined ? sidesDistances : [ [ -1, 1 ], [ -0.5, 0.5 ], [ -1, 1 ], [ -0.5, 0.5 ] ];
	
	
	
	if ( widthDistance !== undefined  ) { 
		
		g.wd = widthDistance;
		
	} else {
		
		g.wd = ( sidesDistances !== undefined && sidesDistances[ 1 ].length > 1 ) ?  g.sd[ 1 ][ g.sd[ 1 ].length - 1 ] - g.sd[ 1 ][ 0 ] : 1;
		
	}
	
		
	if ( hightDistance !== undefined  ) { 
		
		g.hd = hightDistance;
		
	} else {
		
		g.hd = ( sidesDistances !== undefined && sidesDistances[ 0 ].length > 1 ) ?  g.sd[ 0 ][ g.sd[ 0 ].length - 1 ] - g.sd[ 0 ][ 0 ] : 2;
		
	}
	
	g.sides = [ false, false, false, false ];
	
	g.wss = [];
	g.ws = [];
	
	for ( var s = 0; s < 4; s ++ ) {
		
		g.wss[ s ] = g.sd[ s ].length;
		
		if ( g.wss[ s ] !== 0  ) {
			
			g.sides[ s ] = true; g.ws[ s ] = g.wss[ s ] - 1 
			
		} else {
			
			g.ws[ s ] = 0;
			
		}
		
	}
	
	g.ls = lengthSegments !== undefined ? lengthSegments : 100;
	g.lss = g.ls + 1;
	
	g.cP = curvePoints !== undefined ? curvePoints : [ -10,0,5, 0,1,0, 10,0,5 ];
	
	var pts = [];
	
	for ( var i = 0; i < g.cP.length; i += 3 ) {
		
		pts.push( new THREE.Vector3( g.cP[ i ], g.cP[ i + 1 ], g.cP[ i + 2 ] ) );
		
	}
	
	g.curve = new THREE.CatmullRomCurve3( pts );
	
	g.len = g.curve.getLength( );
	
	g.points = g.curve.getPoints( g.ls );
	g.len = g.curve.getLength( );
	g.lenList = g.curve.getLengths ( g.ls );
	
	g.isWall = true;
	
	g.buildRoadWall = buildRoadWall;
	g.buildRoadWall( );

}

function buildRoadWall( ) {
	
	g.faceCount = g.ls * ( g.ws[ 0 ] + g.ws[ 1 ] + g.ws[ 2 ] + g.ws[ 3 ] ) * 2;
	g.vertexCount = g.lss * ( g.wss[ 0 ] + g.wss[ 1 ] + g.wss[ 2 ] + g.wss[ 3 ] );
	
	g.faceIndices = new Uint32Array( g.faceCount * 3 );
	g.vertices = new Float32Array( g.vertexCount * 3 );  
	g.uvs = new Float32Array( g.vertexCount * 2 );
	
	g.setIndex( new THREE.BufferAttribute( g.faceIndices, 1 ) );	
	g.addAttribute( 'position', new THREE.BufferAttribute( g.vertices, 3 ) );
	g.addAttribute( 'uv', new THREE.BufferAttribute( g.uvs, 2 ) );
	
	var a, b1, c1, c2;
	var posIdxCount = 0;
	var offset = 0;
	var mmOffs = 0;
	
	for ( var s = 0; s < 4; s ++ ) {
		
		if ( g.sides[ s ] ) {
			
			for ( var j = 0; j < g.ls; j ++ ) {
				
				for ( var i = 0; i < g.ws[ s ]; i ++ ) {
					
					// 2 faces / segment,  3 vertex indices
					a  = offset + g.wss[ s ] * j + i;
					b1 = offset + g.wss[ s ] * ( j + 1 ) + i;		// right-bottom
					c1 = offset + g.wss[ s ] * ( j + 1 ) + 1 + i;
				// b2 = c1							// left-top
					c2 = offset + g.wss[ s ] * j + 1 + i;
					
					g.faceIndices[ posIdxCount     ] = a; // right-bottom
					g.faceIndices[ posIdxCount + 1 ] = b1;
					g.faceIndices[ posIdxCount + 2 ] = c1; 
					
					g.faceIndices[ posIdxCount + 3 ] = a; // left-top
					g.faceIndices[ posIdxCount + 4 ] = c1; // = b2,
					g.faceIndices[ posIdxCount + 5 ] = c2;
					
					g.addGroup( posIdxCount, 6, mmOffs  + i ); // write groups for multi material
					
					posIdxCount += 6;
					
				}
				
			}
			
			offset += g.lss * g.wss[ s ];
			mmOffs += g.ws[ s ];
			
		}
		
	}
	
	var uvIdxCount = 0;
	
	for ( var s = 0; s < 4; s ++ ) {
		
		if ( g.sides[ s ] ) {
			
			for ( var j = 0; j < g.lss; j ++ ) {
				
				for ( var i = 0; i < g.wss[ s ]; i ++ ) {
					
					g.uvs[ uvIdxCount     ] = g.lenList[ j ] / g.len;
					g.uvs[ uvIdxCount + 1 ] = i / g.ws[ s ];
					
					uvIdxCount += 2;
					
				}
				
			}
			
		}
		
	}
	
	var tangent;
	var normal = new THREE.Vector3( 0, 0, 0 );
	var binormal = new THREE.Vector3( 0, 1, 0 );
	
	g.t = []; // tangents
	g.n = []; // normals
	g.b = []; // binormals
	
	var x, y, z;
	var hd2, wd2;
	var vIdx = 0; // vertex index
	var posIdx;   // position index	
	
	for ( var j = 0; j < g.lss; j ++ ) {  // length
		
		tangent = g.curve.getTangent( j / g.ls ); //  .. / length segments
		g.t.push( tangent.clone( ) );
		
		normal.crossVectors( tangent, binormal );
		
		normal.y = 0;
		
		normal.normalize( );
		g.n.push( normal.clone( ) );
		
		binormal.crossVectors( normal, tangent ); // new binormal
		g.b.push( binormal.clone( ) );
		
	}
	
	for ( var s = 0; s < 4; s ++ ) {
		 
		if ( g.sides[ s ] ) {
			
			if ( s === 1 || s === 3 ) {   //  1 top (road), 2 bottom
				
				if ( g.isWall ) {
					
					hd2 = ( s === 1 ? 1 : -1 ) * g.hd / 2; 
					
				} else {
					
					hd2 = 0;
					
				}
				
				for ( var j = 0; j < g.lss; j ++ ) {  // length
					
					for ( var i = 0; i < g.wss[ s ]; i ++ ) { // width
						
						x = g.points[ j ].x + g.sd[ s ][ i ] * g.n[ j ].x;
						y = g.points[ j ].y + hd2; 
						z = g.points[ j ].z + g.sd[ s ][ i ] * g.n[ j ].z;
						
						xyzSet();
						
						vIdx ++;
						
					}
					
				}
				
			}
			
			if ( s === 0 || s === 2 ) { // wall side 0 left,  2 right 
				
				wd2 = ( s === 0 ? -1 : 1 ) * g.wd / 2; 
				
				for ( var j = 0; j < g.lss; j ++ ) {  // length
					
					for ( var i = 0; i < g.wss[ s ]; i ++ ) { // width	=> height
						
						x = g.points[ j ].x + wd2 * g.n[ j ].x;
						y = g.points[ j ].y + g.sd[ s ][ i ]; 
						z = g.points[ j ].z + wd2 * g.n[ j ].z;
						
						xyzSet();
						
						vIdx ++;
						
					}
					
				}
				
			}
			
		}
	
	}
	
	// set vertex position
	function xyzSet() {
		
		posIdx = vIdx * 3;
		
		g.vertices[ posIdx ]  = x;
		g.vertices[ posIdx + 1 ]  = y;
		g.vertices[ posIdx + 2 ]  = z;
		
	}
	
}

exports.createRoad = createRoad;
exports.createWall = createWall;
exports.buildRoadWall = buildRoadWall;

// ..................................... Sphere Cut.............................................

function createSphereCut( p ) {
	
	/*	parameter overview	--- all parameters are optional
	p = {
		radius,
		equator, // set to divisible by 4 if symmetric (min 8)
		cut, // array, [ px, nx, py, ny, pz, nz ] if symmetric max. 1/2 equator, otherwise equator, non-overlapping
		parts, // array, value 1 for octant, otherwise arbitrary - upper counterclockwise, lower clockwise
		symmetric // default is false
	}	
	*/
	
	if ( p === undefined ) p = {};
	
	g = this;  //  THREE.BufferGeometry() - geometry object from three.js
	
	//............................................................ set defaults
	g.radius =    p.radius !== undefined ? p.radius : 1;
	g.equator =   p.equator !== undefined ? p.equator : 16;
	g.cut =       p.cut !== undefined ? p.cut	: [ 4, 4, 4, 4, 4, 4 ]; // cut px, nx, py, ny, pz, nz
	g.parts =     p.parts !== undefined ? p.parts	: [ 1, 1, 1, 1, 1, 1, 1, 1 ];
	g.symmetric = p.symmetric !== undefined ? p.symmetric : false;
	//..............................................................................................
	
	if ( g.symmetric ) {
		
		g.buildCutSymm = buildCutSymm;
		g.buildCutSymm( );
		
	} else {
	
		g.buildCut = buildCut;
		g.buildCut( );
		
	}
	
}

function buildCutSymm( ) {
	
	g = this;
	
	//set equator to divisible by 4 (min 8)
	g.equator = g.equator > 8 ? ( g.equator + ( 4 - g.equator % 4 ) ) : 8;
	
	const fns = g.equator / 4; // fineness equals 1/4 equator
	const eqt2 = fns * 2; // equals equator / 2
		
	const sumNN = ( n ) => ( n * ( n + 1 ) / 2 );	// Sum natural numbers
	const sumON = ( n ) => ( n * n );				// Sum odd numbers
	const rCirc = ( h ) => ( Math.sqrt( h *( 2 - h ) ) ); // radius cutting circle ( section h )
	
	const pi2 = Math.PI / 2;
	
	let theta, phi, dPhi;
	
	let posIdx = 0;
	let fIdx = 0;
	let uvIdx = 0;
	let a0, a1, b0, b1;	// indices
	let idxOffset;
	
	let signX, signY, signZ, spin;
	
	let faceCount = 0;
	let vertexCount = 0;
	
	let v8Idx = [ 0 ]; // start vertex index of sphere part
	
	let cutX, cutY, cutZ;
	
	const cutIdxX = [ 0, 1, 1, 0 ]; // cut index x per part
	const cutIdxY = [ 2, 3 ]; // cut index y per part
	const cutIdxZ = [ 5, 5, 4, 4 ]; // cut index z per part
	
	g.cutRadius = []; // calculated radius of cut circles px, nx, py, ny, pz, nz - for external use
	g.cutDistance = []; // calculated distance of the cut circles to the center px, nx, py, ny, pz, nz - for external use
	g.cutSegments = []; // segments of the cut circles - for external use
	
	for ( let i = 0; i < 6; i ++ ) {
		
		g.cutSegments[ i ] = 4 * g.cut[ i ];
		
	}
	
	for ( let p = 0; p < 8; p ++ ) { // 8 parts of sphere
		
		if ( g.parts[ p ] === 1 ) {
		
			getCutXYZ( p );
		
			faceCount += 3 * sumON( eqt2 ) + 4 * sumON( fns ) - sumON( cutX ) - sumON( cutY ) - sumON( cutZ );
			vertexCount += 3 * sumNN( eqt2 + 1 ) + 4 * sumNN( fns + 1 ) - sumNN( cutX ) - sumNN( cutY ) - sumNN( cutZ );
			
		}
		
		v8Idx.push( vertexCount );
		
	}
	
	g.faceIndices = new Uint32Array( faceCount * 3 );
	g.vertices = new Float32Array( vertexCount * 3 );
	g.uvs = new Float32Array( vertexCount * 2 );
	g.setIndex( new THREE.BufferAttribute( g.faceIndices, 1 ) );
	g.addAttribute( 'position', new THREE.BufferAttribute( g.vertices, 3 ) );
	g.addAttribute( 'uv', new THREE.BufferAttribute( g.uvs, 2 ) );
	
	for ( let p = 0; p < 8; p ++ ) { // 8 parts of sphere
		
		if ( g.parts[ p ] === 1 ) {
			
			getCutXYZ( p );
			
			indicesPartSphere( p );
			verticesPartSphere( p );
			
		}	
		
	}	
	
	// detail functions
	
	function getCutXYZ( p ) {
		
		cutX = g.cut[ cutIdxX[ p % 4 ] ];
		cutY = g.cut[ cutIdxY[ Math.floor( p / 4 ) ] ];
		cutZ = g.cut[ cutIdxZ[ p % 4 ] ];
		
	}
	
	function indicesPartSphere( p ){
	
		// write groups for multi material
		g.addGroup( fIdx, ( 3 * sumON( eqt2 ) + 4 * sumON( fns ) - sumON( cutX ) - sumON( cutY ) - sumON( cutZ ) ) * 3, p );
		
		idxOffset = v8Idx[ p ];  // start vertex index
		
		spin = ( p === 0 || p === 2 || p === 5 || p === 7 ) ? true : false;
		
		// 7 sections per part
		
		makeIndices( cutX, eqt2 ); 
		idxOffset += sumNN( eqt2 + 1 ) - sumNN( cutX );
		
		makeIndices( cutY, eqt2 );
		idxOffset += sumNN( eqt2 + 1 ) - sumNN( cutY );
		
		makeIndices( cutZ, eqt2 );
		idxOffset += sumNN( eqt2 + 1 ) - sumNN( cutZ );
		
		for ( let m = 0; m < 4; m ++ ) { // make center x, y, z, middle
			
			makeIndices( 0, fns ); 
			idxOffset += sumNN( fns + 1 );
			
		}
		
	}
	
	function verticesPartSphere( p ) {
		
		signX = ( p === 0 || p === 3 || p === 4 || p === 7 ) ? 1 : -1;
		signY = p < 4 ? 1 : -1; 
		signZ = ( p === 2 || p === 3 || p === 6 || p === 7 ) ? 1 : -1;
		
		spin = ( p === 0 || p === 2 || p === 5 || p === 7 ) ? true : false;
		
		g.edgeX = [];
		g.edgeY = [];
		g.edgeZ = [];
		
		g.cEdgeX = [];
		g.cEdgeY = [];
		g.cEdgeZ = [];
		
		calculateVertices( p, 'x', cutX );
		calculateVertices( p, 'y', cutY );
		calculateVertices( p, 'z', cutZ );
		
		calculateCenterVertices( 'x', g.edgeY, g.edgeZ );
		calculateCenterVertices( 'y', g.edgeZ, g.edgeX );
		calculateCenterVertices( 'z', g.edgeX, g.edgeY );
		
		calculateMiddleVertices(  );
	
	}
	
	function makeIndices( begin, end ) {
		
		a0 = idxOffset;
			
		for ( let i = begin; i < end; i ++ ) {
			
			a1 = a0 + 1;
			b0 = a0 + i + 1;
			b1 = b0 + 1;
			
			// each two faces
			
			for ( let j = 0; j < i ; j ++ ) {
				
				g.faceIndices[ fIdx     ] = j + a0;			// left face
				g.faceIndices[ fIdx + 1 ] = j + ( spin ? b1 : b0 );
				g.faceIndices[ fIdx + 2 ] = j + ( spin ? b0 : b1 );
				
				fIdx += 3;
				
				g.faceIndices[ fIdx     ] = j + a0;			// right face
				g.faceIndices[ fIdx + 1 ] = j + ( spin ? a1 : b1 );
				g.faceIndices[ fIdx + 2 ] = j + ( spin ? b1 : a1 );
				
				fIdx += 3;
				
			}
			
			// last face in row ( like a left face )
			
			g.faceIndices[ fIdx     ] = i + a0;
			g.faceIndices[ fIdx + 1 ] = i + ( spin ? b1 : b0 );
			g.faceIndices[ fIdx + 2 ] = i + ( spin ? b0 : b1 );
			
			fIdx += 3;
			
			a0 += i + 1; // next start index
			
		}
		
	}
	
	function calculateVertices( p, axis, cut ) {
		
		let x, y, z, si, cosi, coco;
		
		for ( let i = cut; i <= eqt2; i ++ ) {
			
			theta = Math.PI / 2 * ( 1 -  i / g.equator );
			phi =  0;
			
			for ( let j = 0; j <= i ; j ++ ) {
				
				si  = Math.sin( theta );
				cosi = Math.cos( theta ) * Math.sin( phi );
				coco = Math.cos( theta ) * Math.cos( phi );
				
				if(  axis === 'x' ) {
					
					x = si;
					y = coco;
					z = cosi; 
					
					g.vertices[ posIdx + 0 ] = signX * g.radius * x;
					g.vertices[ posIdx + 1 ] = signY * g.radius * y;
					g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
					
					if ( i === cut && j === 0 ) {
						
						g.cutRadius[ cutIdxX[ p % 4 ] ] = rCirc( 1 - x ) * g.radius; // cut circle radius - for external use
						g.cutDistance[ cutIdxX[ p % 4 ] ] = x * g.radius; // height cap - for external use
						
					}
					
					if ( i === eqt2 ) g.edgeX.push( x, y, z );
					
				}
				
				if(  axis === 'y' ) {
					
					x = cosi; 
					y = si; 
					z = coco; 
					
					g.vertices[ posIdx + 0 ] = signX * g.radius * x;
					g.vertices[ posIdx + 1 ] = signY * g.radius * y;
					g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
					
					if ( i === cut && j === 0 ) {
						
						g.cutRadius[ cutIdxY[ Math.floor( p / 4 ) ] ] = rCirc( 1 - y ) * g.radius; // cut circle radius - for external use
						g.cutDistance[ cutIdxY[ Math.floor( p / 4 )  ] ] = y * g.radius; // height cap - for external use
						
					}
					
					if ( i === eqt2 ) g.edgeY.push( x, y, z );
				
				}
				
				if(  axis === 'z' ) {
					
					x = coco;
					y = cosi;
					z = si;
				
					g.vertices[ posIdx + 0 ] = signX * g.radius * x;
					g.vertices[ posIdx + 1 ] = signY * g.radius * y;
					g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
					
					if ( i === cut && j === 0 ) {
						
						g.cutRadius[ cutIdxZ[ p % 4 ] ] = rCirc( 1 - z ) * g.radius; // cut circle radius - for external use
						g.cutDistance[ cutIdxZ[ p % 4 ] ] = z * g.radius; // height cap - for external use
					
					}
					
					if ( i === eqt2 ) g.edgeZ.push( x, y, z );
					
				}
				
				setUVs( x, y, z );
				
				posIdx += 3;
				
				phi += pi2 / i;
			
			}
			
		}
	
	}
	
	function calculateCenterVertices( axis, edge1, edge2 ) {
		
		let x, y, z, v1x, v1y, v1z, v2x, v2y, v2z, i3, h, R;
		
		// i === 0
		x = edge1[ 0 ];
		y = edge1[ 1 ];
		z = edge1[ 2 ];
		
		g.vertices[ posIdx     ] = signX * g.radius * x;
		g.vertices[ posIdx + 1 ] = signY * g.radius * y;
		g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
		
		setUVs( x, y, z );
		
		// i === 1 
		x = edge2[ eqt2 * 3 - 3 ];
		y = edge2[ eqt2 * 3 - 2 ];
		z = edge2[ eqt2 * 3 - 1 ];
		
		g.vertices[ posIdx + 3 ] = signX * g.radius * x;
		g.vertices[ posIdx + 4 ] = signY * g.radius * y;
		g.vertices[ posIdx + 5 ] = signZ * g.radius * z;
		
		setUVs( x, y, z );
		
		x = edge1[ 3 ];
		y = edge1[ 4 ];
		z = edge1[ 5 ];
		
		g.vertices[ posIdx + 6 ] = signX * g.radius * x;
		g.vertices[ posIdx + 7 ] = signY * g.radius * y;
		g.vertices[ posIdx + 8 ] = signZ * g.radius * z;
		
		setUVs( x, y, z );
		
		posIdx += 9;
		
		for ( let i = 2; i <= fns; i ++ ) {
			
			i3 = i * 3;
			
			v2x = edge2[ eqt2 * 3 - i3 ];
			v2y = edge2[ eqt2 * 3 + 1 - i3 ];
			v2z = edge2[ eqt2 * 3 + 2 - i3 ];
			
			v1x = edge1[ i3 ];
			v1y = edge1[ 1 + i3 ]; 
			v1z = edge1[ 2 + i3 ];
			
			h = 1 - ( axis === 'x' ? v1x : axis === 'y' ? v1y : v1z );
			
			R = rCirc( h );
			
			phi = axis === 'x' ? Math.acos( v2z / R ) : axis === 'y' ? Math.acos( v2x / R ) : Math.acos( v2y / R );
			
			dPhi = ( pi2 - 2 * phi ) / i;
			
			for ( let j = 0; j <= i; j ++ ) {
				
				if ( axis === 'x' ) {
					
					x = v1x; // =  v2x
					y = R * Math.sin( phi );
					z = R * Math.cos( phi );
					
					if ( i === fns ) g.cEdgeX.push(  x, y, z ); 
					
				}
				
				if ( axis === 'y' ) {
				
					x = R * Math.cos( phi );
					y = v1y; // = v2y
					z = R * Math.sin( phi );
					
					if ( i === fns ) g.cEdgeY.push( x, y, z );
					
				}
				
				if ( axis === 'z' ) {
					
					x = R * Math.sin( phi );
					y = R * Math.cos( phi );
					z = v1z; // = v2z 
					
					if ( i === fns ) g.cEdgeZ.push( x, y, z ); 
					
				}
				
				g.vertices[ posIdx     ] = signX * g.radius * x;
				g.vertices[ posIdx + 1 ] = signY * g.radius * y;
				g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
				
				setUVs( x, y, z );
				
				phi += dPhi;
				
				posIdx += 3;
				
			}
			
		}
		
	}
	
	function calculateMiddleVertices(  ) {
		
		let  x, y, z, h, R;
		
		// i === 0 
		x = g.cEdgeY[ 0 ];
		y = g.cEdgeY[ 1 ];
		z = g.cEdgeY[ 2 ];
		
		g.vertices[ posIdx     ] = signX * g.radius * x;
		g.vertices[ posIdx + 1 ] = signY * g.radius * y;
		g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
		
		setUVs( x, y, z );
		
		// i === 1
		x = g.cEdgeZ[ fns * 3 - 3 ];
		y = g.cEdgeZ[ fns * 3 - 2 ];
		z = g.cEdgeZ[ fns * 3 - 1 ];
		
		g.vertices[ posIdx + 3 ] = signX * g.radius * x;
		g.vertices[ posIdx + 4 ] = signY * g.radius * y;
		g.vertices[ posIdx + 5 ] = signZ * g.radius * z;
		
		setUVs( x, y, z );
		
		x = g.cEdgeY[ 3 ];
		y = g.cEdgeY[ 4 ];
		z = g.cEdgeY[ 5 ];
		
		g.vertices[ posIdx + 6 ] = signX * g.radius * x;
		g.vertices[ posIdx + 7 ] = signY * g.radius * y;
		g.vertices[ posIdx + 8 ] = signZ * g.radius * z;
		
		setUVs( x, y, z );
		
		posIdx += 9;
		
		for ( let i = 2; i <= fns; i ++ ) {
		
			h = 1 - g.cEdgeZ[ fns * 3 - i * 3 ]; 
			
			R = rCirc( h );
			
			phi = Math.acos( g.cEdgeZ[ fns * 3 - i * 3 + 2 ] / R );
			
			dPhi = ( pi2 - 2 * phi ) / i;
			
			for ( let j = 0; j <= i; j ++ ) {
				
				x =  g.cEdgeZ[ fns * 3 - i * 3 ];
				y =  R * Math.sin( phi );
				z =  R * Math.cos( phi );
				
				g.vertices[ posIdx     ] = signX * g.radius * x;
				g.vertices[ posIdx + 1 ] = signY * g.radius * y;
				g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
				
				setUVs( x, y, z );
				
				posIdx += 3;
				
				phi += dPhi;
				
			}
			
		}	
			
	}
	
	function setUVs( x, y, z ) {
		
		let uvu;
		
		x += 0.4 * x * ( 1 - Math.cos( pi2 * y ) );
		z += 0.4 * z * ( 1 - Math.cos( pi2 * y ) );
		uvu = ( Math.asin( x ) + Math.acos( z ) ) / 2 / pi2;
		
		g.uvs[ uvIdx ] = spin ? 1 - uvu : uvu ;
		g.uvs[ uvIdx + 1 ] = Math.asin( y ) / pi2;
		
		uvIdx += 2;
		
	}
	
}

function buildCut( ) {
	
	g = this;
	
	const sumNN = ( n ) => ( n * ( n + 1 ) / 2 );	// Sum natural numbers
	const sumON = ( n ) => ( n * n );				// Sum odd numbers
	const scale = ( k ) => ( 0.84 * k * k + 0.16 * k ); // section scale
	const rCirc = ( h ) => ( Math.sqrt( h *( 2 - h ) ) ); // radius cutting circle ( section h )
	
	const pi = Math.PI;
	const pi2 = pi / 2;
	
	let cutT, cutB, cutA; // top, left or right per part
	let phi;
	let iB, iA;
	let a0, a1, b0, b1;	// indices
	let vOff; // vertices offset per row
	let spin;
	
	let posIdx = 0;
	let fIdx = 0;
	let uvIdx = 0;
	
	let faceCount = 0;
	let vertexCount = 0;
	
	let v8Idx = [ 0 ]; // start vertex index of sphere part
	
	const cutIdxT = [ 2, 3 ]; // cut index T top or bottom per part
	const cutIdxB = [ 5, 5, 4, 4 ]; // cut index B left or right per part
	const cutIdxA = [ 0, 1, 1, 0 ]; // cut index A left or right per part
	
	g.cutRadius = []; // calculated radius of cut circles px, nx, py, ny, pz, nz - for external use
	g.cutDistance = []; // calculated distance of the cut circles to the center px, nx, py, ny, pz, nz - for external use
	g.cutSegments = []; // segments of the cut circles  - for external use
	
	for ( let i = 0; i < 6; i ++ ) {
		
		g.cutSegments[ i ] = 4 * g.cut[ i ];
		
	}
	
	for ( let p = 0; p < 8; p ++ ) { // 8 parts of sphere
		
		if ( g.parts[ p ] === 1 ) {
			
			getCutTBA( p );
			
			faceCount += sumON( g.equator ) - sumON( cutT ) - sumON( cutB ) - sumON( cutA );
			vertexCount += sumNN( g.equator + 1 ) - sumNN( cutT ) - sumNN( cutB ) - sumNN( cutA );
			
		}
		
		v8Idx.push( vertexCount );
		
	}
	
	g.faceIndices = new Uint32Array( faceCount * 3 );
	g.vertices = new Float32Array( vertexCount * 3 );
	g.uvs = new Float32Array( vertexCount * 2 );
	g.setIndex( new THREE.BufferAttribute( g.faceIndices, 1 ) );
	g.addAttribute( 'position', new THREE.BufferAttribute( g.vertices, 3 ) );
	g.addAttribute( 'uv', new THREE.BufferAttribute( g.uvs, 2 ) );
	
	for ( let p = 0; p < 8; p ++ ) { // 8 parts of sphere
	
		if ( g.parts[ p ] === 1 ) {
			
			getCutTBA( p );
			
			iB = g.equator - cutB;  // index B
			iA = g.equator - cutA;  // index A
			
			indicesPartSphere( p );
			verticesPartSphere( p );
			
		}	
		
	}
	
	// detail functions
	
	function getCutTBA( p ) {
		
		cutT = g.cut[ cutIdxT[ Math.floor( p / 4 ) ] ];
		cutB = g.cut[ cutIdxB[ p % 4 ] ];
		cutA = g.cut[ cutIdxA[ p % 4 ] ];
		
	}
	
	function indicesPartSphere( p ) {
		
		// write groups for multi material
		g.addGroup( fIdx, ( sumON( g.equator ) - sumON( cutT ) - sumON( cutB ) - sumON( cutA ) ) * 3, p );
		
		a0 = v8Idx[ p ];  // start vertex index
		
		for ( let i = cutT; i < g.equator; i ++ ) {
			
			vOff = i - ( i > iB ? i - iB : 0 ) - ( i > iA ? i - iA : 0 );
			
			a1 = a0 + 1;
			b0 = a0 + vOff + ( i < iB ? 1 : 0 ); // start index - below  
			b1 = b0 + 1;
			
			spin = ( p === 0 || p === 2 || p === 5 || p === 7 ) ? true : false;
			
			// each two faces
			
			for ( let j = 0; j < vOff; j ++ ) {
				
				if ( i < iB || j > 0 ) {
					
					g.faceIndices[ fIdx     ] = j + a0;		// left face
					g.faceIndices[ fIdx + 1 ] = j + ( spin ? b1 : b0 );
					g.faceIndices[ fIdx + 2 ] = j + ( spin ? b0 : b1 );
					
					fIdx += 3;
					
				}
					
				g.faceIndices[ fIdx     ] = j + a0;			// right face
				g.faceIndices[ fIdx + 1 ] = j + ( spin ? a1 : b1 );
				g.faceIndices[ fIdx + 2 ] = j + ( spin ? b1 : a1 );
				
				fIdx += 3;
				
			}
			
			if ( i < iA ) {
				
				// last face in row ( like a left face )
				
				g.faceIndices[ fIdx     ] = vOff + a0;
				g.faceIndices[ fIdx + 1 ] = vOff + ( spin ? b1 : b0 );
				g.faceIndices[ fIdx + 2 ] = vOff + ( spin ? b0 : b1 );
				
				fIdx += 3;
				
			}
		
			a0 += vOff + 1; // next start index
			
		}
		
	}
	
	function verticesPartSphere( p ) {
		
		const signX = ( p === 0 || p === 3 || p === 4 || p === 7 ) ? 1 : -1;
		const signY = p < 4 ? 1 : -1; 
		const signZ = ( p === 2 || p === 3 || p === 6 || p === 7 ) ? 1 : -1;
		
		let spin = ( p === 0 || p === 2 || p === 5 || p === 7 ) ? true : false;
		
		let x, y, z, x0, x1, y0, y1, z0, z1, dx, dy, dz, vCount, t, uvu;
		
		let yB = [];
		let yA = [];
		
		let yT = Math.sin( pi2 * ( 1 - cutT / g.equator ) );	// y top
		
		let hT = 1 - yT;		// height cap T top
		let rT = rCirc( hT );	// is top circle radius ( or bottom for p > 3)
		
		let hB = 1 - Math.sin( pi2 * ( 1 - cutB / g.equator ) ); // height cap B
		let hA = 1 - Math.sin( pi2 * ( 1 - cutA / g.equator ) ); // height cap A
		
		let rB = rCirc( hB ); // is cut circle radius  rB => height
		let rA = rCirc( hA ); // is cut circle radius  rA => height
		
		// cut circle radius [ px, nx, py, ny, pz, nz ] - for external use
		g.cutRadius[ cutIdxT[ Math.floor( p / 4 ) ] ] = rT * g.radius;
		g.cutRadius[ cutIdxB[ p % 4 ] ] = rB * g.radius;
		g.cutRadius[ cutIdxA[ p % 4 ] ] = rA * g.radius;
		
		// distance of the cut circles to the center  [ px, nx, py, ny, pz, nz ] - for external use
		g.cutDistance[ cutIdxT[ Math.floor( p / 4 ) ] ] = ( 1 - hT ) * g.radius;
		g.cutDistance[ cutIdxB[ p % 4 ] ] = ( 1 - hB ) * g.radius;
		g.cutDistance[ cutIdxA[ p % 4 ] ] = ( 1 - hA ) * g.radius;
		
		//   edge B
		
		for ( let i = cutT, k = 0 ; i <= iB ; i ++ , k ++ ) {  
			
			yB[ i ] = yT - ( yT - rB ) * scale( k / (  iB - cutT ) );
			
		}
		
		for ( let i = iB + 1 ; i <= g.equator; i ++ ) { 
			
			yB[ i ] = rB * Math.cos( pi2 * ( i - iB ) / cutB );
			
		}
		
		//  edge A
		
		for ( let i = cutT, k = 0 ; i <= iA ; i ++ , k ++ ) {  
			
			yA[ i ] = yT - ( yT - rA ) * scale( k / (  iA - cutT ) );
			
		}
		
		for ( let i = iA + 1 ; i <= g.equator; i ++ ) { 
			
			yA[ i ] = rA * Math.cos( pi2 * ( i - iA ) / cutA );
			
		}
		
		// positions, uv's
		
		for ( let i = cutT; i <= g.equator; i ++ ) {
			
			if ( i === 0 && cutT === 0 ) {
				
				g.vertices[ posIdx     ] = 0;
				g.vertices[ posIdx + 1 ] = signY * g.radius;
				g.vertices[ posIdx + 2 ] = 0;
				
				posIdx += 3;
				
				g.uvs[ uvIdx ] = 0.5;
				g.uvs[ uvIdx  + 1 ] = 1;
				
				uvIdx += 2;
				
			}
			
			vCount = i + 1 - ( i > iB ? i - iB : 0 ) - ( i > iA ? i - iA : 0 );
			
			if ( i === cutT && cutT !== 0 ) {
				
				phi = 0;
				
				for ( let j = 0; j <= vCount - 1 ; j ++ ) {
					
					x = rT * Math.sin( pi2 * j / ( vCount - 1 ) );
					y = yT;
					z = rT * Math.cos( pi2 * j / ( vCount - 1 ) );
					
					g.vertices[ posIdx     ] = signX * g.radius * x;
					g.vertices[ posIdx + 1 ] = signY * g.radius * y;
					g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
					
					posIdx += 3;
					
					phi +=  pi2 / vCount;
					
					x += 0.4 * x * ( 1 - Math.cos( pi2 * y ) );
					z += 0.4 * z * ( 1 - Math.cos( pi2 * y ) );
					uvu = ( Math.asin( x ) + Math.acos( z ) ) / 2 / pi2;
					
					g.uvs[ uvIdx ] = spin ? 1 - uvu : uvu ;
					g.uvs[ uvIdx + 1 ] = Math.asin( y ) / pi2;
					
					uvIdx += 2;
					
				}
				
			}
			
			if ( i > cutT ) { 
				
				//  ( 0 )
				
				if ( i <= iB ) {
					
					x0 = 0;
					y0 = yB[ i ];
					z0 = Math.sqrt( 1 - yB[ i ] * yB[ i ] );
					
				} else {
					
					x0 = rB * Math.sin( pi2 * ( i - iB ) / cutB  );
					y0 = rB * Math.cos( pi2 * ( i - iB ) / cutB );
					z0 = 1 - hB;
					
				}
				
				//  ( 1 )
				
				if ( i <= iA ) {
					
					x1 = Math.sqrt( 1 - yA[ i ] * yA[ i ] );
					y1 = yA[ i ];
					z1 = 0;
					
				} else {
					
					x1 = 1 - hA; 
					y1 = rA * Math.cos( pi2 * ( i - iA ) / cutA );
					z1 = rA * Math.sin( pi2 * ( i - iA ) / cutA );
					
				}
				
				// row verices - not always horizontal
				
				dx = x1 - x0;
				dy = y1 - y0;
				dz = z1 - z0; 
				
				for ( let j = 0; j <= vCount - 1 ; j ++ ) {	
					
					x = x0 + j / ( vCount - 1 ) * dx;
					y = y0 + j / ( vCount - 1 ) * dy;  
					z = z0 + j / ( vCount - 1 ) * dz; 
					
					t = Math.sqrt( ( 1 - y * y ) / ( x * x + z * z ) ); // to move the point horizontally onto the sphere
					
					x = t * x;
					//y = y;
					z = t * z;
					
					g.vertices[ posIdx     ] = signX * g.radius * x;
					g.vertices[ posIdx + 1 ] = signY * g.radius * y;
					g.vertices[ posIdx + 2 ] = signZ * g.radius * z;
					
					posIdx += 3;
					
					x += 0.4 * x * ( 1 - Math.cos( pi2 * y ) );
					z += 0.4 * z * ( 1 - Math.cos( pi2 * y ) );
					uvu = ( Math.asin( x ) + Math.acos( z ) ) / 2 / pi2;
					
					g.uvs[ uvIdx ] = spin ? 1 - uvu : uvu;
					g.uvs[ uvIdx + 1 ] = Math.asin( y ) / pi2;
					
					uvIdx += 2;
					
				}
				
			}
			
		}
		
	}
	
}

exports.createSphereCut = createSphereCut;
exports.buildCutSymm = buildCutSymm;
exports.buildCut = buildCut;

// ..................................... Helper ...................................................

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

exports.vertexFaceNumbersHelper = vertexFaceNumbersHelper;

// ......................................   -   ..................................................

//#################################################################################################

Object.defineProperty(exports, '__esModule', { value: true });

})));