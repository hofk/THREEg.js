// THREEg.js ( rev 90.0 )

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

// ..................................... Magic Box ............................................

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
		
			for ( var f = g.fCornersIdx[ part ]; f < g.fCornersIdx[ part ] + sm * sm ; f ++ ) {
				
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
			
// ..................................... MagicSphere ..........................................

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
		pointX,			// normally interval 0 to PI / 2
		pointY,			// normallyinterval 0 to 1
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

// ..................................... Helper ...............................................

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

exports.createMagicBox = createMagicBox;
exports.buildMagicBox = buildMagicBox;
exports.morphVerticesMagicBox =	morphVerticesMagicBox;

exports.createMagicSphere = createMagicSphere;
exports.buildMagicSphere = buildMagicSphere;
exports.morphVerticesMagicSphere =	morphVerticesMagicSphere;

exports.vertexFaceNumbersHelper = vertexFaceNumbersHelper;

Object.defineProperty(exports, '__esModule', { value: true });

})));