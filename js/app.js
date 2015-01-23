// function MyController($scope) {

// }

angular.module("myApp", [])
  .controller('MyNameController',
    function($scope) {
      $scope.person = {
        name: "Ari"
      }
    })
  .controller('MyController',
    function($scope) {
      $scope.clock = {
        now: new Date()
      };
      var updateClock = function() {
        $scope.clock.now = new Date();
      };
      setInterval(function() {
        $scope.$apply(updateClock);
      }, 1000);
      updateClock();
    })
  .run(function($rootScope) {
    $rootScope.name = "World"
  })
  .controller("AddController",
    function($scope) {
      $scope.counter = 0;
      $scope.add = function(amount) { $scope.counter += amount; };
      $scope.subtract = function(amount) { $scope.counter -= amount; }
    })
  .controller("ParseController",
    function($scope, $parse) {
      $scope.$watch('expr', function(newVal, oldVal, scope) {
        if(newVal !== oldVal) {
          var parseFun = $parse(newVal);
          $scope.parsedValue = parseFun(scope);
        }
      })
    })
  .controller("InterpolateController",
    function($scope, $interpolate) {
      $scope.$watch('emailBody', function(body) {
        if(body) {
          var template = $interpolate(body);
          $scope.previewText = template({ to: $scope.to });
        }
      })
    })