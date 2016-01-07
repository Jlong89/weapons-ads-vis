angular.module('elastic', ['elasticsearch'])
    .service('client', function (esFactory) {
      return esFactory({
        host: 'http://localhost:9200',
        apiVersion: '2.1',
        log: 'trace'
      });
    })
    .controller('queryContrl', function ($scope, client, esFactory) {
    //var isBusy = false;

    $scope.isLoading = isLoading;
    $scope.isBusy = false;
    $scope.errorMessage = '';
    $scope.hasError = hasError;
    $scope.session = '';
    $scope.queryA = queryA;
    $scope.queryB = queryB;
    $scope.queryC = queryC;
    $scope.queryD = queryD;
    /*
    $scope.queryOther = queryOther;
    $scope.queryOther2 = queryOther2;)*/
    $scope.listA = listA;
    $scope.listB = listB;
    $scope.statesList = statesList;
    $scope.weaponsTypeList = weaponsTypeList;
    $scope.listC = listC;
    $scope.listD = listD;

    reset();

    function isLoading() {
        return $scope.isBusy == true;
    }

    function reset() {
        $scope.isBusy = false;
        $scope.session = '';
    }

    function queryA() {
        if (listA.length != 0) listA = [];
        $scope.isBusy = true;
        $scope.session = 'queryA';
        requestA($scope, client);
    }

    function queryB() {
        
        $scope.isBusy = true;
        $scope.session = 'queryB';
        getStates($scope, client);
        doQueryB($scope, client);
    }


    
    function queryC() {
        if (listC["name"] != undefined) listC = {};
        $scope.isBusy = true;
        $scope.session = 'queryC';
        getWeaponTypes($scope, client);
        requestC($scope, client);
    }

    function queryD() {
        if (listD.length != 0) listD = [];
        $scope.isBusy = true;
        $scope.session = 'queryD';
        requestD($scope, client);
    }

    function hasError() {
        return $scope.errorMessage != '';
    }

    function setError(errorInfo, status, id) {
        reset();
        if (status == 401) {
            $scope.errorMessage = "Authorization failed."
        } else {
            $scope.errorMessage = errorInfo.message;
        }
    }
});