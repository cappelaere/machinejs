//
// Sequential selectors with filtering
//

function Radarsat2($scope, $http, $q) {	
	this.scope			= $scope;
	this.http			= $http;
	this.q				= $q;
}

Radarsat2.meta = {
	title: 			"Radarsat2 Behavior Tree",
	description: 	"",
	image: 			"",
	url:   			""
}

Radarsat2.tree = {
	identifier: "goal", strategy: 	"sequential",
	children: 	[
		{ identifier: "find" },		
		{ identifier: "process" },
		{ identifier: "download", test: "t1" }
	]	
}

Radarsat2.states = {
	
	'find': function(data) {
		var scope 			= this.scope;
		scope.ctx.activity 	= "Radarsat2 Find Scene";
		var deferred 		= this.q.defer();
		console.log("finding...")
		setTimeout(function() {
			scope.$apply( function() {		
				console.log("Found scene");
				data['scene'] = "E09ON10";
				deferred.resolve(data);	
			})
		}, 1000);

		return deferred.promise;
	},
	
	process: function(data) {
		var scope			= this.scope;
		var scene 			= data.scene;
		scope.ctx.activity 	= "Processing Scene: "+ scene;
		var deferred 		= this.q.defer();
		console.log("Processing...");
		
		setTimeout(function() {
			scope.$apply( function() {
				data['link'] = "http://example.com/myScene"
				data['size'] = 1200000;
					
				deferred.resolve(data)			
				scope.ctx.activity 	= "Processed.";
				console.log("Processed.");
			});
		}, 2000);

		return deferred.promise;
	},
	
	download: function(data) {
		var scope			= this.scope;
		var link 			= data.link;
		scope.ctx.activity 	= "Download from: "+ link;
		var deferred 		= this.q.defer();
		setTimeout(function() {
			scope.$apply( function() {
				data['status'] = "Done";
				deferred.resolve(data)			
				console.log("Data Downloaded");
				scope.ctx.activity 	= "Done.";
			});
		}, 2000);

		return deferred.promise;
	},
	
	t1: function(data) {
		console.log( "canDownload "+JSON.stringify(data));
		if( data.size > 100000) {
			console.log("file too large")
			this.scope.ctx.activity 	= "File too large to download";
			this.scope.$apply();
			return false;
		} else {
			console.log("File size ok:"+data.size)
			return true;
		}
	}
}