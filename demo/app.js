var App = angular.module('App', ['ng-highlight']);

App.controller('highlightDemo', function($scope)
{
  $scope.searchDone = function(found)
  {
    if (!found)
    {
      alert('Not found!');
    }
  };
});