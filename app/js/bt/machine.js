/*
  Machine.js
  by mary rose cook
  http://github.com/maryrosecook/machinejs

  Make behaviour trees in JavaScript.
  See index.html for an example.

  Uses Base.js by Dean Edwards.  Thanks, Dean.
*/

// PGC Activity status
var PASSED 	= 1;
var FAILED 	= -1;
var PENDING = 0;

var q;		// promises library
var log;	// selected logging library

(function() {
  /*
    The tree generator.  Instantiate and then call generateTree(),
    passing the JSON definition of the tree and the object the tree controls.
  */
  var Machine = Base.extend({
    constructor: function($q, $log) { q = $q; log = $log; },	

    // makes behaviour tree from passed json and returns the root node
    generateTree: function(treeJson, actor, states) {
      states = states || actor;
      return this.read(treeJson, null, actor, states);
    },

    // reads in all nodes in passed json, constructing a tree of nodes as it goes
    read: function(subTreeJson, parent, actor, states) {
      var node = null;
      if (subTreeJson.pointer == true)
        node = new Pointer(subTreeJson.identifier,
                           subTreeJson.test,
                           subTreeJson.strategy,
                           parent,
                           actor,
                           states);
      else
        node = new State(subTreeJson.identifier,
                         subTreeJson.test,
                         subTreeJson.strategy,
                         parent,
                         actor,
                         states);

      node.report = subTreeJson.report;

      if(subTreeJson.children !== undefined)
        for (var i = 0; i < subTreeJson.children.length; i++)
          node.children[node.children.length] = this.read(subTreeJson.children[i],
                                                          node, actor, states);

      return node;
    }
  }, {
    getClassName: function() {
      return "Machine";
    }
  });

  // EXPORT
  window['Machine'] = Machine;

  /*
    The object for nodes in the tree.
  */
  var Node = Base.extend({
    identifier: null,
    test: null,
    strategy: null,
    parent: null,
    children: null,
    actor: null,
    states: null,
    report: null,

    constructor: function(identifier, test, strategy, parent, actor, states) {
      this.identifier 	= identifier;
      this.test 		= test;
      this.strategy 	= strategy;
      this.parent 		= parent;
      this.actor 		= actor;
      this.states 		= states;
      this.children 	= [];

		// PGC Activity status and result
		this.status		= undefined;
		this.result		= {errorCode: 200, errorMsg:"OK"}
    },

    // A tick of the clock.  Returns the next state.
	tick: function() {
		if (this.isAction()) { // run an actual action
			if( this.status === undefined ) {
				log.log("Run "+this.identifier);
				try {
					this.run();	
				} catch( e ) {
					log.log("Run exception:"+e)
					return [null, {errorCode:500, errorMsg:"Run Exception "+e}];
				}
			}
			
			switch( this.status) {				
				case FAILED:
					log.log(this.identifier+" tick failed");
					break;
					
				case PASSED:
					log.log(this.identifier+" tick passed");
					break;
				
			 	case PENDING: // let's wait then
					log.log(this.identifier+" still pending...");
					return [this, this.result];
			}
			log.log("tick going to next state...");
		}
		
		// figure out what to do next
		var actualNextState 	= null;
		
		var potentialNextState 	= this.nextState();
		if (potentialNextState !== null) {
			log.log("Transition: "+potentialNextState.identifier)
			actualNextState = potentialNextState.transition();
			log.log("To: "+actualNextState.identifier)
		} else if (this.can(this.result)) // no child state, try and stay in this one
			actualNextState = this;
		else // can't stay in this one, so back up the tree
			actualNextState = this.nearestRunnableAncestor().transition();

		log.log("tick next is:"+actualNextState.identifier+ " with "+JSON.stringify(this.result))

		if(actualNextState.status != PENDING && actualNextState.parent === null ) {
			log.log("Found goal!")
			return [null, this.result];	// we are done
		}
		
		// pass the results as well
		actualNextState.result = this.result;
		return [actualNextState, actualNextState.result];
    },

    // gets next state that would be moved to from current state
    nextState: function() {
      var strategy = this.strategy;
      if (strategy === undefined) {
        var ancestor = this.nearestAncestorWithStrategy();
        if (ancestor !== null)
          strategy = ancestor.strategy;
      }
		log.log("strategy:"+strategy)
      if (strategy !== null)
        return this[strategy].call(this);
      else
        return null;
    },

    isTransition: function() {
      return this.children.length > 0 || this instanceof Pointer;
    },

    isAction: function() {
      return !this.isTransition();
    },

    // returns true if actor allowed to enter this state
	can: function(data) {
		var functionName = this.test; // can specify custom test function name
		if (functionName === undefined) // no override so go with default function name
		functionName = "can" + this.identifier[0].toUpperCase() + this.identifier.substring(1, this.identifier.length);

		var result = true;
		if (this.states[functionName] !== undefined) {
			result = this.states[functionName].call(this.actor, data);
			if( result == false ) {
				log.log("Can failed")
				this.status = FAILED;
				this.result = { errorCode:12, errorMsg:"Failed can"}
			}
		} 
		return result
	},

    // switches state to direct child of root state with passed identifier
    // use very sparingly - really only for important events that
    // require machine to temporarily relinquish control over actor
    // e.g. a soldier who is mostly autonomous, but occasionally receives orders
    warp: function(identifier) {
      var rootNodeChildren = this.getRootNode().children;
      for(var i = 0; i < rootNodeChildren.length; i++)
        if(rootNodeChildren[i].identifier == identifier)
          return rootNodeChildren[i];

      return this; // couldn't find node - stay in current state
    },

    // gets next runnable node in passed list
    nextRunnable: function(nodes) {
      for (var i = 0; i < nodes.length; i++)
        if (nodes[i].status === undefined && nodes[i].can(this.result))
          return nodes[i];

      return null;
    },

	// PGC Added to support sequential
	nextSibling: function(leaf) {
		var foundThis = false;
		for (var i = 0; i < leaf.parent.children.length; i++) {
			var sibling = leaf.parent.children[i];
			if (leaf.identifier == sibling.identifier) foundThis = true;
			else if (foundThis && sibling.can(leaf.result)) {
				return sibling;
			}
		}
		return null;
	},
	
	// Sequence Selector:  Do all children one at a time, if one fails, return fail
	// Prioritised Selector: Do all children one at a time, return on first one that passes
	// Concurrent Selector: Do all children in parallel
	//
    // runs all runnable children in order, then kicks up to children's closest runnable ancestor
	sequential: function() {
		log.log("Sequential next? "+this.identifier)
		var nextState = null;
		if (this.isAction()) { // want to get next runnable child or go back up to grandparent
			var status = this.status;
			if( status === FAILED ) {
				// not good
				var parent 		= this.parent;
				parent.status 	= FAILED;
				parent.result 	= this.result;				// pass result to next child
				return parent;
			}
			var sibling = this.nextSibling(this);
			if( sibling ) {
				sibling.result = this.result;
				return sibling;
			}
		} else { // at a sequential parent so try to run first runnable child
			var firstRunnableChild = this.nextRunnable(this.children);
			if (firstRunnableChild !== null) {
				firstRunnableChild.result = this.result;	// pass result to next child
				return firstRunnableChild;
			}
		}

      return this.nearestRunnableAncestor(); // no more runnable children in the sequence so return first runnable ancestor
    },

	//
    // Returns for first child that can run successfully
	//
    prioritised: function() {
 		log.log("prioritised next? "+this.identifier)
		if( this.isAction()) {
			if( this.status === PASSED ) {
				var parent = this.parent;
				parent.status = PASSED;
				parent.result = this.result;
				
				parent = parent.parent;
				log.log("prioritised returns "+ parent.identifier);
				return parent;
			}
		}
     	return this.nextRunnable(this.children);
    },

	// execute all children in parallel
	// return fail if anyone of them fails or PASS if they all pass
    concurrent: function() {
 		log.log("concurrence "+this.identifier)
		if( this.children.length == 0 ) return null;
	
		if( this.promises === undefined ) {
			this.promises = [];
			for( child in this.children ) {
				var node = this.children[child];
				if( node.isAction()) {
					try {
						node.run();
						this.promises.push(node.promise)
					} catch(e) {
						log.log("Error running child "+ node.identifier)
						this.status = FAILED;
					}
				}
			}
			
			this.status = PENDING;
			
			var activity = this;
			var combinedPromise = q.all(this.promises);
			combinedPromise.then(function(result) {
				log.log(activity.identifier + " run passed:"+JSON.stringify(result));
				activity.status = PASSED;
				for( var r in result ) {
					activity.result = MergeRecursive(activity.result, result[r]);
				}
			}, function(reason) {
				log.log(activity.identifier+ " run failed:"+JSON.stringify(reason))
				activity.status = FAILED;
				activity.result = reason;
			})
		}	
		
		if( this.status === PASSED || this.status === FAILED) {
			log.log("Activity "+ this.status)
			//var next = this.nearestRunnableAncestor(); // no more runnable children in the sequence so return first runnable ancestor
			//log.log("next:"+ JSON.stringify(next))
		//	var sibling = this.nextSibling(this);
		//	if( sibling && sibling.can(this.result)) {
		//		return sibling
		//	}
			var next 	= this.parent;
			next.status = this.status;
			return next;
		}
		return this;
	},

    // returns first namesake forebear encountered when going directly up tree
    nearestAncestor: function(test) {
      if (this.parent === null)
        return null;
      else if (test.call(this.parent) === true)
        return this.parent;
      else
        return this.parent.nearestAncestor(test);
    },

    // returns root node of whole tree
    getRootNode: function() {
      if(this.parent === null)
        return this;
      else
        return this.parent.getRootNode();
    },

    nearestAncestorWithStrategy: function() {
      return this.nearestAncestor(function() {
        return this.strategy !== undefined && this.strategy !== null;
      });
    },

    // returns nearest ancestor that can run
    nearestRunnableAncestor: function() {
      return this.nearestAncestor(function() {
        return this.can(this.result);
      });
    },

    nearestNamesakeAncestor: function(identifier) {
      return this.nearestAncestor(function() {
        return this.identifier == identifier;
      });
    }
  }, {
    getClassName: function() {
      return "Node";
    }
  });

// http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
	function MergeRecursive(obj1, obj2) {
		//log.log("Merging "+JSON.stringify(obj2)+ " into "+JSON.stringify(obj1));
		
		for (var p in obj2) {
			try {
				// Property in destination object set; update its value.
				if ( obj2[p].constructor==Object ) {
					obj1[p] = MergeRecursive(obj1[p], obj2[p]);
				} else {
					obj1[p] = obj2[p];
				}
			} catch(e) {
				// Property in destination object not set; create it and set its value.
				//log.log("Merge error:"+e)
				obj1[p] = obj2[p];
			}
		}
		return obj1;
	}
	
  /*
    A normal state in the tree.
  */
  var State = Node.extend({
    transition: function() {
      return this;
    },

    // run the activity associated with this state
	run: function() {

		log.log("running "+this.identifier);
		this.promise 	= this.states[this.identifier].call(this.actor, this.result); // run the action
		
		// save activity to have it available in callback
		var activity 	= this;
		this.promise.then(function(result) {
			log.log(activity.identifier + " run passed:"+JSON.stringify(result));
			activity.status = PASSED;
			activity.result = result;
		}, function(reason) {
			log.log(activity.identifier+ " run failed:"+JSON.stringify(reason))
			activity.status = FAILED;
			activity.result = reason; 
		})			
	
		this.result = undefined;
		this.status = PENDING;
    }
  }, {
    getClassName: function() {
      return "State";
    }
  });

  /*
    A pointer state in the tree.  Directs the actor to a synonymous state
    further up the tree.  Which synonymous state the actor transitions to
    is dependent on the pointer's strategy.
  */
  var Pointer = Node.extend({
    // transition out of this state using the state's strategy
    transition: function() {
      return this[this.strategy].call(this);
    },

    // a strategy that moves to the first synonymous ancestor
    hereditory: function() {
      return this.nearestNamesakeAncestor(this.identifier);
    }
  }, {
    getClassName: function() {
      return "Pointer";
    }
  });
})();