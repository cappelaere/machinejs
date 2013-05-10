function Modis($scope, $http, $q) {	
	this.scope			= $scope;
	this.http			= $http;
	this.q				= $q;
}

Modis.meta = {
	title: 			"Modis Behavior Tree",
	description: 	"",
	image: 			"",
	url:   			""
}

Modis.tree = {
	identifier: "start", strategy: 	"sequential",
	children: 	[
		{ identifier: "find" },
		{ identifier: "download"}
	]	
}

Modis.states = {
	
	find: function(data) {
		var scope 			= this.scope;
		scope.ctx.activity 	= "MODIS Find Scene";
		var deferred 		= this.q.defer();
		
		setTimeout(function() {
			scope.$apply( function() {		
				console.log("Found scene");
				data['scene'] = "E09ON10";
				deferred.resolve(data);	
			})
		}, 1000);

		return deferred.promise;
	},
	
	download: function(data) {
		var scope			= this.scope;
		var scene 			= data.scene;
		scope.ctx.activity 	= "Download Data For Scene: "+ scene;
		var deferred 		= this.q.defer();
		setTimeout(function() {
			scope.$apply( function() {
				data['download']= "Done";
				deferred.resolve(data)			
				console.log("Data Downloaded");
				scope.ctx.activity 	= "Done.";
			});
		}, 2000);

		return deferred.promise;
	}
}