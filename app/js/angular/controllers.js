'use strict';

/* Controllers */

var controllers = angular.module('btApp.controllers', [])
.controller('MyCtrl1', function($scope, $http, $q, $log) {
	var scope 	= $scope;
	var http  	= $http;
	var q		= $q;
	var log		= $log;
	
	scope.ctx = {};
	
	scope.go = function() {
		var actor  			= new scope.ctx.actor(scope, http, q);
		scope.ctx.activity 	= "started..."+scope.ctx.actor.meta.title;
		
		var tree	= scope.ctx.actor.tree;
		var states	= scope.ctx.actor.states;
		var machine = new Machine(q, log);
		var state 	= machine.generateTree( tree, actor, states);
		var result;
		
		log.log("Start.."+new Date());
		
		var timerid;
		var count = 0
		try {
			var step = function() {
				console.log("Tick.."+new Date());
				[state, result] = state.tick();
				count = count + 1
				if( state === null) {
					log.log("** Done result:"+JSON.stringify(result))
					scope.ctx.activity 	= "Done.";
					scope.ctx.result 	= JSON.stringify(result, null, '\t');
					scope.showResults 	= true;
					scope.$apply();
					clearInterval(timerid);
				}
			}
			timerid = setInterval(step, 1000);
		} catch(e) {
			log.error("try exception:"+e);
		}	
		
	} // end of go fucntoon
	
	//scope.ctx.actor 	= actor;
	scope.ctx.activity 	= "ready";
	scope.showGenerate 	= true;
});
