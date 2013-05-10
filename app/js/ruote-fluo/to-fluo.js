/*
 * Copyright (c) 2013 Pat Cappelaere  pat@cappelaere.com
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* Conversion of Behavior Tree to ruby fluo syntax */

function strategy( str ) {
	if( str === 'sequential') {
		str = 'sequence'
	} else if( str === 'prioritised') {
		str = 'selector';
	} else if( str === 'concurrent') {
		str = 'concurrence';
	} else {
		str = 'invalid';
	}
	return str;
}

function childrentoFluo( children ) {
	var arr = [];
	if( children ) {
		for( child in children ) {
			var e 				= children[child];
			var identifier 		= e.identifier;
			var strat			= e.strategy;
			var moreChildren 	= childrentoFluo(e.children);
			var body 			= {}
			var test			= e.test;
			if( test ) {
				body[test] = null;
				moreChildren = [[ identifier, {}, []]];
				arr.push(['if', body, moreChildren]);
			} else if( strat === 'sequential' || strat === 'prioritised' || strat === 'concurrent') {
				body[identifier] = null;
				
				arr.push( [strategy(strat), body, moreChildren ])
			} else {
				arr.push( [identifier, body, moreChildren ])
			}
		}
	}
	return arr;
}

// from machinejs to ruote-fluo
function toFluo( json ) {
	var def  		= json.behavior
	var tree 		= json.tree
	
	var strat		= json.tree.strategy;
	var identifier	= json.tree.identifier;
	var body 		= {}
	body[def] 		= null;
	var id			= {}
	id[identifier]  = null
	var children 	= [[strategy(strat), id, childrentoFluo(tree.children) ]];
	
	var result 		= ['define', body, children ];	
	return result;
}