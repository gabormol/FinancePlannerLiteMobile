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

.controller('TimesheetController', ['$scope', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', '$ionicModal', 'timesheetFactory', 'userSettingsFactory', function ($scope, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast, $ionicModal, timesheetFactory, userSettingsFactory) {
  $scope.showLoading = true;

  $scope.currencyCodeForExpense = '';

  userSettingsFactory.query(
          function (response) {
              $scope.currencyCodeForExpense = response[0].currencySymbol;
          },
          function (response) {
              $scope.message = "Error: " + response.status + " " + response.statusText;
          }
      );

  $scope.newItemName = "";
  $scope.newItemPlanned = 0;
  $scope.newItemAmount = 0;

  $scope.resetNewItemProps = function(){

    $scope.newItemName = "";
    $scope.newItemPlanned = 0;
    $scope.newItemAmount = 0;

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
  var createAndShowDeleteItemModal = function(){
    $ionicModal.fromTemplateUrl('templates/deleteitemconfirm.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.deleteitemconfirm = modal;
        $scope.deleteitemconfirm.show();
      });
    }

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

      var amountPaidForDelete;
      var timesheetIdForDelete;
      var itemIdForDelete;

      $scope.deleteItem = function(amountPaid, timesheetId, itemId){
        createAndShowDeleteItemModal();
        amountPaidForDelete = amountPaid;
        timesheetIdForDelete = timesheetId;
        itemIdForDelete = itemId;
      }

      $scope.doDeleteItem = function() {

          //$scope.deleteexpenseconfirm.show();
          if(amountPaidForDelete === 0){
          timesheetFactory.delete({id:timesheetIdForDelete, itemId:itemIdForDelete}).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                $scope.closeDeleteConfirmModal();
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
        $scope.resetNewItemProps();
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
        $scope.addnewitemmodal.hide();
        $scope.addnewitemmodal.remove();
      }

      $scope.closeModifyModal = function(){
        $scope.modifyitemmodal.hide();
        $scope.modifyitemmodal.remove();
      }

      $scope.closeDeleteConfirmModal = function(){
        $scope.deleteitemconfirm.hide();
        $scope.deleteitemconfirm.remove();
      }

      $scope.backToActoins = function(){
          $state.go('app.actions');
      }

}])

.controller('BalanceController', ['$scope', '$ionicModal', '$timeout', 'statisticsFactory', 'userSettingsFactory', function ($scope, $ionicModal, $timeout, statisticsFactory, userSettingsFactory) {

$scope.showLoading = true;

$scope.currencyCodeForExpense = '';

userSettingsFactory.query(
        function (response) {
            $scope.currencyCodeForExpense = response[0].currencySymbol;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

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

.controller('UserSettingsController', ['$scope', 'userSettingsFactory', '$ionicPlatform', '$ionicModal', function ($scope, userSettingsFactory, $ionicPlatform, $ionicModal) {

$scope.showLoading = true;

// Create the modiusersettings modal that we will use later
var createAndShowModifyUserSettingsModal = function(){

  $ionicModal.fromTemplateUrl('templates/modifyuserparam.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modifyusersettingsmodal = modal;
      $scope.modifyusersettingsmodal.show();
    });
  }

  var closeModifyUserSettingsModal = function(){
    $scope.modifyusersettingsmodal.hide();
    $scope.modifyusersettingsmodal.remove();
  }

    $scope.userSettings = {
        currencyDecimals : '',
        currencySymbol : '',
        lastname : '',
        firstname : ''
    };

    userSettingsFactory.query(
            function (response) {
                $scope.showLoading = false;
                $scope.userSettings.currencyDecimals = response[0].currencyDecimals;
                $scope.userSettings.currencySymbol = response[0].currencySymbol;
                $scope.userSettings.lastname = response[0].lastname;
                $scope.userSettings.firstname = response[0].firstname;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );

      $scope.modifyUserSettings = function(){
          createAndShowModifyUserSettingsModal();
        }

    $scope.doModifyUserSettings = function() {
        userSettingsFactory.update($scope.userSettings).$promise.then(
                            function (response) {
                                $scope.showLoading = false;
                                closeModifyUserSettingsModal();

                            },
                            function (response) {
                                $scope.message = "Error: " + response.status + " " + response.statusText;
                                $scope.showLoading = false;
                            });
    };

    /*$scope.cancelNgDialogue = function() {
        ngDialog.close();
    };*/

}])

.filter('duetomonthfilter', function() {
  return function(input /*, param1, param2*/) {

    if (typeof input !== 'undefined'){
        var aYear = parseInt(input.toString().substring(0, 4));
        var aMonth = parseInt(input.toString().substring(4, 6));

        var out = aMonth.toString().concat(" / ").concat(aYear.toString());

        return out;
    } else {
        return " - ";
    }
  };
})

.filter('customcurrencyfilter', function() {
  return function(input, currCode) {

      if (typeof input !== 'undefined' && typeof currCode !== 'undefined'){

          console.log("Price and input defined: " );

          var price = input.toString();
          var pointsNeeded = Math.floor((price.length-1)/3);
          console.log("points needed: " + pointsNeeded);

		  if (pointsNeeded > 0){
			var priceFormatted = price.split("");
			console.log("priceFormatted: " + priceFormatted.toString() + " " + priceFormatted.length);

			switch (pointsNeeded){
				case 1: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); break;
				case 2: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); break;
				case 3: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); break;
				case 4: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); priceFormatted.splice( (priceFormatted.length-15), 0, "." ); break;
				case 5: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); priceFormatted.splice( (priceFormatted.length-15), 0, "." ); break; priceFormatted.splice( (priceFormatted.length-19), 0, "." ); break;
			}

			console.log("priceFormatted new: " + priceFormatted.toString());

			price = priceFormatted.join('');

			console.log("new price string: " + price);
		  }


          var out = price.concat(" ").concat(currCode.toString());
          return out;
      } else {
          return " - ";
      }

  };
})


.controller('ExpenseController', ['$scope', '$state', 'baseURL', 'expenseFactory', '$ionicModal', 'userSettingsFactory', function ($scope, $state, baseURL, expenseFactory, $ionicModal, userSettingsFactory) {

$scope.showLoading = true;

$scope.newExpensename = "expense name";
$scope.newExpenseAmount = 0;

$scope.currencyCodeForExpense = '';

userSettingsFactory.query(
        function (response) {
            $scope.currencyCodeForExpense = response[0].currencySymbol;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

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
var createAndShowDeleteExpenseConfirmModal = function(){
    $ionicModal.fromTemplateUrl('templates/deleteexpenseconfirm.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.deleteexpenseconfirm = modal;
      $scope.deleteexpenseconfirm.show();
    });
};

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

    var objectIdToDelete;

    $scope.deleteExpense = function(objectId){
      objectIdToDelete = objectId;
      createAndShowDeleteExpenseConfirmModal();
    }

    $scope.doDeleteExpense = function() {

        //$scope.deleteexpenseconfirm.show();
        expenseFactory.delete({id: objectIdToDelete}).$promise.then(
                          function (response) {
                              $scope.showLoading = false;
                              $scope.closeDeleteConfirmModal();
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
      $scope.deleteexpenseconfirm.remove();
    }

    $scope.backToActoins = function(){
        $state.go('app.actions');
    }

}])

;
