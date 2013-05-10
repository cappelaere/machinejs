function TestPar($scope, $http, $q) {	
	this.scope			= $scope;
	this.http			= $http;
	this.q				= $q;
}

TestPar.meta = {
	title: 			"TestPar",
	description: 	"",
	image: 			"",
	url:   			""
}

TestPar.tree = {
	identifier: "goal", strategy: 	"sequential",
	children: 	[
		{ identifier: "find", strategy: "concurrent",
			children: 	[
				{ identifier: "getProduct1" },
				{ identifier: "getProduct2" },
				{ identifier: "getProduct3"}
			]		
		 },		
		{ identifier: "download" }
	]
	

}

TestPar.states = {
	'getProduct1': function(data) {
		var scope 			= this.scope;
		var deferred 		= this.q.defer();
		console.log("Getting Product 1...")
		setTimeout(function() {
			scope.$apply( function() {		
				scope.ctx.activity = "Got Product 1";
				data['product1'] = "E18OS10"
				deferred.resolve(data);	
			})
		}, 1000);

		return deferred.promise;
	},
	'getProduct2': function(data) {
		var scope 			= this.scope;
		var deferred 		= this.q.defer();
		console.log("Getting Product 2...")
		setTimeout(function() {
			scope.$apply( function() {		
				scope.ctx.activity = "Got Product 2";
				data['product2'] = "E28OS10"
				deferred.resolve(data);	
			})
		}, 2000);

		return deferred.promise;
	},
	'getProduct3': function(data) {
		var scope 			= this.scope;
		var deferred 		= this.q.defer();
		console.log("Getting Product 3...")
		setTimeout(function() {
			scope.$apply( function() {		
				//scope.ctx.activity = "Got Product 3";
				//data['product3'] = "E38OS10"
				//deferred.approve(data);	

				deferred.reject({errorCode:301, errorMsg:"Error getting product 3"});	
			})
		}, 2000);

		return deferred.promise;
	},
	'download': function(data) {
		var scope 			= this.scope;
		var deferred 		= this.q.defer();
		console.log("Downloading Products..."+JSON.stringify(data))
		setTimeout(function() {
			scope.$apply( function() {		
				scope.ctx.activity = "Download All Products";
				data['download'] = "Done."
				deferred.resolve(data);	
			})
		}, 1000);

		return deferred.promise;
	},
}