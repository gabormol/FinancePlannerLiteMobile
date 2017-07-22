angular.module('FPLite.controllers', [])

.controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaImagePicker, AuthFactory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.registration = {};
    $scope.loggedIn = false;

    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        $scope.closeLogin();
    };

    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };

    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/reserve.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.reserveform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeReserve = function () {
        $scope.reserveform.hide();
    };

    // Open the login modal
    $scope.reserve = function () {
        $scope.reserveform.show();
    };

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {

        $scope.loginData.username = $scope.registration.username;
        $scope.loginData.password = $scope.registration.password;

        AuthFactory.register($scope.registration);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };

    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $localStorage.storeObject('userinfo',$scope.loginData);
    });

})

.controller('TimesheetController', ['$scope', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', '$ionicModal', 'timesheetFactory', 'currencyFilter', function ($scope, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast, $ionicModal, timesheetFactory, currencyFilter) {
  console.log("Timesheet Controller called...");
  $scope.showLoading = true;

  $scope.newItemName = "";
  $scope.newItemPlanned = 0;
  $scope.newItemAmount = 0;

  $scope.resetNewItemProps = function(){
    console.log('RESET newItem properties...');
    $scope.newItemName = "";
    $scope.newItemPlanned = 0;
    $scope.newItemAmount = 0;
    console.log('newItemName: ' + $scope.newItemName);
    console.log('newItemPlanned: ' + $scope.newItemPlanned);
    console.log('newItemAmount: ' + $scope.newItemAmount);
  }


  // Create the modifyexpense modal that we will use later
  var createAndShowModifyItemModal = function(){
    $ionicModal.fromTemplateUrl('templates/modifyitem.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modifyitemmodal = modal;
        $scope.modifyitemmodal.show();
      });
    }

  // Create the addnewexpense modal that we will use later
 var createAndShowAddNewItemModal = function(){
    $ionicModal.fromTemplateUrl('templates/addnewitem.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.addnewitemmodal = modal;
        $scope.addnewitemmodal.show();
      });
    }

  // Create the deleteconfirm modal
  $ionicModal.fromTemplateUrl('templates/deleteitemconfirm.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.deleteitemconfirm = modal;
  });

    $scope.timeshet = {};

      $scope.getTimesheet = function(){
        timesheetFactory.query(
              function (response) {
                  $scope.timesheet = response;
                  $scope.timesheetId = $scope.timesheet[0]._id;
                  $scope.timesheetItems = $scope.timesheet[0].items;
                  $scope.showLoading = false;
              },
              function (response) {
                  $scope.message = "Error: " + response.status + " " + response.statusText;
              }
          );
        }

      $scope.getTimesheet();

      $scope.doAddItem = function(itemName, itemPlanned, itemPaid, timesheetId) {
          console.log('Adding new item called... ' + itemName + " " + itemPlanned + " " + itemPaid);

          $scope.newItem = {
          itemName: itemName,
          amountPlanned: itemPlanned,
          amountPaid: itemPaid,
          paid: false
      }
          timesheetFactory.save({id:timesheetId},$scope.newItem).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                $scope.getTimesheet();
                                $scope.resetNewItemProps();
                                console.log("Item added!!!");
                                $scope.closeAddModal();
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });


      };

      $scope.doModifyItem = function(modItemName,modItemPlanned,modItemAmount,modItemId,timesheetId) {

        $scope.modItem = {
        itemName: modItemName,
        amountPlanned: modItemPlanned,
        amountPaid: modItemAmount,
        paid: false
        }
          timesheetFactory.update({id: timesheetId, itemId:modItemId}, $scope.modItem).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                $scope.getTimesheet();
                                $scope.closeModifyModal();
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });

      };

      $scope.doDeleteItem = function(amountPaid, timesheetId, itemId) {

          //$scope.deleteexpenseconfirm.show();
          if(amountPaid === 0){
          timesheetFactory.delete({id:timesheetId, itemId:itemId}).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                $scope.getTimesheet();
                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
                          } else {
                            console.log("Can't delete paid item!");
                          }
      };

      $scope.addNewItem = function() {
        console.log('Opening add nem item modal...');
        $scope.resetNewItemProps();
        console.log('Showing modal...');
        createAndShowAddNewItemModal();
        //$scope.addnewitemmodal.show();

      }

      $scope.editItem = function(itemName, itemPlanned, itemAmount, timesheetId, itemId) {

        $scope.modItemName = itemName;
        $scope.modItemPlanned = itemPlanned;
        $scope.modItemAmount = itemAmount;
        $scope.timesheetId = timesheetId;
        $scope.modItemId = itemId;

        //$scope.modifyitemmodal.show();
        createAndShowModifyItemModal();

      }

      $scope.closeAddModal = function(){
        console.log('Closing add modal...');
        $scope.addnewitemmodal.hide();
        $scope.addnewitemmodal.remove();
      }

      $scope.closeModifyModal = function(){
        $scope.modifyitemmodal.hide();
        $scope.modifyitemmodal.remove();
      }

      $scope.closeDeleteConfirmModal = function(){
        $scope.deleteitemconfirm.hide();
      }

      $scope.backToActoins = function(){
          $state.go('app.actions');
      }

}])

.controller('BalanceController', ['$scope', '$ionicModal', '$timeout', 'statisticsFactory', function ($scope, $ionicModal, $timeout, statisticsFactory) {

$scope.showLoading = true;

$scope.getStatistics = function(){
  statisticsFactory.query(
        function (response) {
            $scope.balance = response;
            $scope.showLoading = false;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );
  }

  $scope.getStatistics();



}])

// implement the IndexController and About Controller here

.controller('HomeController', ['$scope', 'baseURL', function ($scope, $state, baseURL) {




}])

.controller('UserSettingsController', ['$scope', 'baseURL', function ($scope, $state, baseURL) {




}])


.controller('ExpenseController', ['$scope', '$state', 'baseURL', 'expenseFactory', '$ionicModal', function ($scope, $state, baseURL, expenseFactory, $ionicModal) {

$scope.showLoading = true;

$scope.newExpensename = "expense name";
$scope.newExpenseAmount = 0;


// Create the modifyexpense modal that we will use later
$ionicModal.fromTemplateUrl('templates/modifyexpense.html', {
    scope: $scope
}).then(function (modal) {
    $scope.modifyexpmodal = modal;
});

// Create the addnewexpense modal that we will use later
$ionicModal.fromTemplateUrl('templates/addnewexpense.html', {
    scope: $scope
}).then(function (modal) {
    $scope.addnewexpmodal = modal;
});

// Create the deleteconfirm modal
$ionicModal.fromTemplateUrl('templates/deleteexpenseconfirm.html', {
    scope: $scope
}).then(function (modal) {
    $scope.deleteexpenseconfirm = modal;
});

  $scope.expenses = [];

    $scope.getExpenses = function(){
      expenseFactory.query(
            function (response) {
                $scope.expenses = response;
                console.log(JSON.stringify($scope.expenses));
                $scope.showLoading = false;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
      }

      $scope.getExpenses();

    $scope.doAddExpense = function(expName, expAmount) {

        $scope.newExpense = {
        expensename: expName,
        amount: expAmount,
        frequency: 12,
        createdate: new Date()
    }
        expenseFactory.save($scope.newExpense).$promise.then(
                          function (response) {
                              $scope.showLoading = false;
                              $scope.getExpenses();
                          },
                          function (response) {
                              $scope.message = "Error: " + response.status + " " + response.statusText;
                              $scope.showLoading = false;
                          });
        $scope.closeAddModal();

    };

    $scope.doModifyExpense = function(newName, newAmount, objectId) {

        var modExpense = {
        expensename: newName,
        amount: newAmount,
        frequency: 12,
        createdate: new Date()
    }
        expenseFactory.update({id: objectId}, modExpense).$promise.then(
                          function (response) {
                              $scope.showLoading = false;
                              $scope.getExpenses();
                          },
                          function (response) {
                              $scope.message = "Error: " + response.status + " " + response.statusText;
                              $scope.showLoading = false;
                          });
        $scope.closeModifyModal();

    };

    $scope.doDeleteExpense = function(objectId) {

        //$scope.deleteexpenseconfirm.show();
        expenseFactory.delete({id: objectId}).$promise.then(
                          function (response) {
                              $scope.showLoading = false;
                              $scope.getExpenses();
                          },
                          function (response) {
                              $scope.message = "Error: " + response.status + " " + response.statusText;
                              $scope.showLoading = false;
                          });
    };

    $scope.addNewExpense = function() {

      $scope.addnewexpmodal.show();

    }

    $scope.editExpense = function(expName, expAmount, expId) {

      $scope.modExpenseName = expName;
      $scope.modExpenseAmount = expAmount;
      $scope.modExpenseId = expId;

      $scope.modifyexpmodal.show();

    }

    $scope.closeAddModal = function(){
      $scope.addnewexpmodal.hide();
    }

    $scope.closeModifyModal = function(){
      $scope.modifyexpmodal.hide();
    }

    $scope.closeDeleteConfirmModal = function(){
      $scope.deleteexpenseconfirm.hide();
    }

    $scope.backToActoins = function(){
        $state.go('app.actions');
    }

}])

;
