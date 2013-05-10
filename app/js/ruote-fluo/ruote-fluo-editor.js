/*
 * Copyright (c) 2005-2012, John Mettraux, jmettraux@gmail.com
 *
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

/*
 *  This piece of hack was created during the RubyKaigi2008,
 *  between Tsukuba and Akihabara.
 */

/*
 * depends on jQuery
 *
 * http://jquery.com
 *
 * minified versions of this file available / can generated at
 *
 * https://github.com/jmettraux/ruote-fluo
 */


//
// RuoteFluoEditor
//
var RuoteFluoEditor = function() {

  var TEXTS = {
    add_child_expression: 'add a child expression',
    cut_expression: 'cut expression',
    moveup_expression: 'move expression up',
    movedown_expression: 'move expression down',
    paste_expression: 'paste expression here'
  };

  var ExpressionHead = function() {

    function createButton(rfeClass, tooltip, callback) {

      var i = document.createElement('a');
      i.callback = callback;
      i.className = 'rfe_button ' + rfeClass;
      i.setAttribute('href', '');
      i.setAttribute('title', tooltip);
      i.setAttribute('onclick', 'this.callback(); return false;');
      return i;
    }

    function addHeadButtons(expdiv) {

      var outOpacity = 0.0;

      var buttons = document.createElement('span');
      buttons.className = 'rfe_buttons';
      buttons.style.opacity = outOpacity;

      var root = findRfeRoot(expdiv);

      expdiv.onmouseover = function() {
        buttons.style.opacity = 1.0;
        if (root.onOver) root.onOver(computeExpId(expdiv.parentNode));
      };
      expdiv.onmouseout = function() {
        buttons.style.opacity = outOpacity;
        if (root.onOver) root.onOver(null);
      };

      buttons.appendChild(createButton(
        'rfe_add',
        RuoteFluoEditor.TEXTS.add_child_expression,
        function() {
          RuoteFluoEditor.addExpression(expdiv.parentNode, [ '---', {}, [] ]);
        }));

      if (expdiv.parentNode.parentNode != root) {

        buttons.appendChild(createButton(
          'rfe_cut',
          RuoteFluoEditor.TEXTS.cut_expression,
          function() {
            RuoteFluoEditor.removeExpression(expdiv.parentNode);
          }));
        buttons.appendChild(createButton(
          'rfe_moveup',
          RuoteFluoEditor.TEXTS.moveup_expression,
          function() {
            RuoteFluoEditor.moveExpression(expdiv.parentNode, -1);
            buttons.style.opacity = outOpacity;
          }));
        buttons.appendChild(createButton(
          'rfe_movedown',
          RuoteFluoEditor.TEXTS.movedown_expression,
          function() {
            RuoteFluoEditor.moveExpression(expdiv.parentNode, +1);
            buttons.style.opacity = outOpacity;
          }));
        buttons.appendChild(createButton(
          'rfe_paste',
          RuoteFluoEditor.TEXTS.paste_expression,
          function() {
            var clip = document._rfe_clipboard;
            if (clip) RuoteFluoEditor.insertExpression(expdiv.parentNode, clip);
          }));
      }

      expdiv.appendChild(buttons);
    }

    return {

      render: function(node, exp) {

        var expname = exp[0];

        var text = '';
        if ((typeof exp[2][0]) == 'string') text = exp[2].shift();

        var atts = John.stringify(exp[1]);
        if (atts == '{}') atts = '';
        else atts = atts.slice(1, -1);
        atts = atts.trim();

        var d = document.createElement('div');
        d.setAttribute('class', 'rfe_exp');
        node.appendChild(d);

        var sen = document.createElement('span');
        sen.setAttribute('class', 'rfe_exp_span rfe_expression_name');
        sen.appendChild(document.createTextNode(expname));
        d.appendChild(sen);

        var sea = document.createElement('span');
        sea.setAttribute('class', 'rfe_exp_span rfe_expression_atts');
        sea.appendChild(document.createTextNode(' ' + atts));
        d.appendChild(sea);

        addHeadButtons(d);

        var onblur = function() {

          var p = d.parentNode;
          var pp = p.parentNode;

          var exp = ExpressionHead.parse(this.value);

          if (exp) {
            p.replaceChild(ExpressionHead.render(p, exp), d);
            triggerChange(p);
          }
          else {
            pp.removeChild(p);
            triggerChange(pp);
          }
        };

        // blurring on "enter"
        //
        var onkeyup = function(evt) {

          var e = evt || window.event;
          var c = e.charCode || e.keyCode;
          //console.log(e.shiftKey);
          if (c == 13) this.blur();

          return false;
        }

        // preventing propagation of "enter"
        //
        var onkeypress = function(evt) {

          var e = evt || window.event;
          var c = e.charCode || e.keyCode;

          return (c != 13);
        }

        var onclick = function() {

          d.removeChild(sen);
          var input = document.createElement('input');
          input.setAttribute('type', 'text');
          input.value = expname + ' ' + atts;
          if (text != '') input.value = expname + ' ' + text + ' ' + atts;
          d.replaceChild(input, sea);
          input.onblur = onblur;
          input.onkeyup = onkeyup;
          input.onkeypress = onkeypress;
          input.focus();
        };

        sen.onclick = onclick;
        sea.onclick = onclick;

        return d;
      },

      parse: function(s) {

        var m = s.match(/^(\S+)(.*)$/);

        if (m == null || m[1].match(/^-+$/)) return null;

        return [ m[1], John.parse('{' + m[2] + '}'), [] ];
      },

      toExp: function(node) {

        node = node.firstChild;

        var name = node.childNodes[0].firstChild.nodeValue;
        var atts = node.childNodes[1].firstChild.nodeValue;

        return [ name, John.parse('{' + atts + '}'), [] ];
      }
    };
  }();

  function asJson(node) {

    if ((typeof node) == 'string') node = document.getElementById(node);

    return JSON.stringify(toTree(node));
  }


function getChildren(children) {
	var json = [];
	
	children.forEach( function(child) {
		var id	= child[0];
		var test = undefined;
		var tree = toBTree( child, test)
	
		json.push(tree);
	})

	return json;
}

function _if( node ) {
	for( var k in node[1] ) var test = k
	return toBTree( node[2][0], test )
}

function strategy(strategy, node, test ) {
	for( var k in node[1] ) var name = k
	var children   = node[2]
	
	var seqChildren = getChildren( children ) 
	
	var json = { identifier: name, 
					strategy: strategy, test: test,
					children: seqChildren }
	return json;
}

function toBTree(node, test) {
	var id = node[0];
	if( id === 'sequence' ) {
		return strategy( 'sequential', node, test );
	} else if (id === 'concurrence'){
		return strategy( 'parallel', node, test );
	} else if( id === 'selector ') {
		return strategy( 'prioritised', node, test );		
	} else if( id === 'if') {
		return _if( node )
	} else {
		var json = { identifier: id, test:test }
		return json;
	}
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// return the Behavior Tree JSON representation
function asBTree(node) {
	if ((typeof node) == 'string') 
		node = document.getElementById(node);

    var json 	= toTree(node);

	// skip the define
	for( var key in json[1]) var name = key
	
	var elt 	= json[2]
	var btree	= toBTree(elt.shift(), undefined)
	
	var result = {
		behavior: name,
		tree: btree
	}
	return syntaxHighlight(result)
}

  function renderEnding(node, exp) {

    var ending = document.createElement('div');
    ending.className = 'rfe_text';
    if (exp[2].length > 0) ending.appendChild(document.createTextNode('end'));
    node.appendChild(ending);
  }

  function addExpression(parentExpNode, exp) {

    var end = parentExpNode.lastChild;
    var node = renderExpression(parentExpNode, exp);
    parentExpNode.replaceChild(node, end);
    parentExpNode.appendChild(end);

    if (end.childNodes.length == 0)
      end.appendChild(document.createTextNode('end'));

    triggerChange(parentExpNode);
  }

  function removeExpression(expNode) {

    var p = expNode.parentNode;
    p.removeChild(expNode);

    if (p.childNodes.length == 2)
      p.lastChild.removeChild(p.lastChild.firstChild);

    document._rfe_clipboard = toTree(expNode);

    triggerChange(p);
  }

  function renderExpression(parentNode, exp, isRootExp) {

    //
    // draw expression

    var node = document.createElement('div');
    node.className = 'rfe_expression';

    if ( ! isRootExp)
      node.setAttribute('style', 'margin-left: 14px;');

    parentNode.appendChild(node);

    if ( ! (exp instanceof Array)) {
      renderExpressionString(node, exp.toString());
      return;
    }

    ExpressionHead.render(node, exp);

    //
    // draw children

    for (var i=0; i < exp[2].length; i++) renderExpression(node, exp[2][i]);

    //
    // over

    renderEnding(node, exp);

    return node;
  }

  function render(parentNode, flow) {

    if ((typeof parentNode) == 'string') {
      parentNode = document.getElementById(parentNode);
    }

    parentNode.className = 'rfe_root';

    while(parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }

    renderExpression(parentNode, flow, true);

    parentNode.stack = []; // the undo stack
    parentNode.currentTree = flow;
  }

  function moveExpression(elt, delta) {

    var p = elt.parentNode;

    if (delta == -1) { // move up
      if (elt.previousSibling.className != 'rfe_expression') return;
      p.insertBefore(elt, elt.previousSibling);
    }
    else { // move down
      if (elt.nextSibling.className != 'rfe_expression') return;
      p.insertBefore(elt, elt.nextSibling.nextSibling);
    }

    RuoteFluoEditor.triggerChange(p);
  }

  function insertExpression(before, exp) {

    var newNode = renderExpression(before.parentNode, exp);

    before.parentNode.insertBefore(newNode, before);

    RuoteFluoEditor.triggerChange(before.parentNode);
  }

  function triggerChange(elt) {

    var rfeRoot = findRfeRoot(elt);
    var tree = toTree(rfeRoot);

    stack(rfeRoot, tree);

    if (rfeRoot.onChange) rfeRoot.onChange(tree);
  }

  function stack(root, tree) {
    root.stack.push(root.currentTree);
    root.currentTree = tree;
  }

  function undo(root) {

    if ((typeof root) == 'string') root = document.getElementById(root);
    if (root.stack.length < 1) return;

    while (root.firstChild != null) root.removeChild(root.firstChild);

    var tree = root.stack.pop();

    root.currentTree = tree;
    renderExpression(root, tree, true);

    if (root.onChange) root.onChange(tree);
  }

  function findRfeRoot(node) {

      if (node.className == 'rfe_root') return node;
      return findRfeRoot(node.parentNode);
  }

  function computeExpId(node, from, expid) {

    if (from == null) {
      from = findRfeRoot(node);
      expid = '';
    }
    if (from == node) return expid.substring(1, expid.length);

    var divs = from.childNodes;
    var childid = -1;

    for (var i=0; i<divs.length; i++) {
      var e = divs[i];
      if (e.nodeType != 1) continue;
      if (e.className != 'rfe_expression') continue;
      childid += 1;
      var ei = computeExpId(node, e, expid + '_' + childid);
      if (ei != null) return ei;
    }

    return null;
  }

  function toTree(node) {

    var $node = $(node);

    $node.focus(); // making sure all the input boxes get blurred...

    if ( ! $node.hasClass('rfe_expression')) {
      $node = $node.children('.rfe_expression').first();
    }

    var exp = ExpressionHead.toExp($node[0]);

    $node.children('.rfe_expression').each(function(i, c) {
      exp[2].push(toTree(c));
    });

    return exp;
  }

  //
  // public methods
  //
  return {

    TEXTS: TEXTS,

    ExpressionHead: ExpressionHead,

    render: render,
    addExpression: addExpression,
    removeExpression: removeExpression,
    moveExpression: moveExpression,
    insertExpression: insertExpression,
    triggerChange: triggerChange,
    undo: undo,
    asJson: asJson,
    asBTree: asBTree,
	syntaxHighlight: syntaxHighlight
  };
}();

var FluoEditor = RuoteFluoEditor; // for backward compatibility

