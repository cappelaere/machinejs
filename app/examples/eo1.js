
function EO1($scope, $http, $q) {	
	this.scope			= $scope;
	this.http			= $http;
	this.q				= $q;
}

EO1.meta = {
	title: 			"EO-1 Behavior Tree",
	description: 	"",
	image: 			"",
	url:   			""
}

EO1.tree = {
	identifier: "goal", strategy: 	"sequential",
	children: 	[
		{ identifier: "getScene", strategy: "prioritised",
		  children: [
				{ identifier: "getFromArchives"},
				{ identifier: "task", strategy: "sequential",
					children: [
						{ identifier: "getFeasibilities"},
						{ identifier: "submitTask"}
					]
				}
			]
		},
		{ identifier: "process" },
		{ identifier: "download"}
	]
}

EO1.states = {
	
	getFromArchives: function(data) {
		var scope = this.scope;
		
		scope.ctx.activity = "Find";
		var deferred 	= this.q.defer();
		
		setTimeout(function() {
			scope.$apply( function() {
				// we cannot find any scene
				//console.log("scenes not found");
				//deferred.reject({ errormsg: "No scene"});				
				console.log("scene found");
				data['scene'] = "EO1A0210392010177110KF"
				deferred.resolve(data);	
			})
		}, 1000);

		return deferred.promise;
	},
	
	canGetFromArchives: function() { 
		return true;
	},
	
	getFeasibilities: function(data) {
		var scope = this.scope;
		scope.ctx.activity = "Get Feasibilities";
		var deferred 	= this.q.defer();
		setTimeout(function() {
			scope.$apply( function() {
				data['scene'] = "EO1A0210392010177110KF";
				deferred.resolve(data)			
				console.log("got feasibilities");
			})
		}, 1000);

		return deferred.promise;
	},
	
	canGetFeasibilities: function() {
		return true;
	},
	
	canTask: function() {
		return true;
	},
	
	submitTask: function(data) {
		var scope = this.scope;
		scope.ctx.activity = "Submit Task at ";
		var deferred 	= this.q.defer();
		setTimeout(function() {
			scope.$apply( function() {
				data['date']= new Date()
				deferred.resolve(data)			
				console.log("Task Submitted");
			});
		}, 1000);

		return deferred.promise;
	},
	
	canSubmitTask: function() {
		return true;
	},
	
	process: function(data) {
		var scope = this.scope;
		var scene = data.scene
		scope.ctx.activity 	= "Process Scene:"+scene;
		var deferred 		= this.q.defer();
		setTimeout(function() {
			scope.$apply( function() {
				data['link']= "http://www.example.com/myProduct"
				deferred.resolve(data)			
				console.log("Task Processed");
			})
		}, 1000);

		return deferred.promise;
	},
	
	canProcess: function() {
		return true;
	},
	
	download: function(data) {
		var scope	= this.scope;
		var link 	= data.link
		scope.ctx.activity 	= "Download Data from "+ link;
		var deferred 		= this.q.defer();
		setTimeout(function() {
			scope.$apply( function() {
				data['status'] = "Done"
				deferred.resolve(data)			
				console.log("Data Downloaded");
			});
		}, 1000);

		return deferred.promise;
	},
	
	canDownload: function() {
		return true;
	}
}