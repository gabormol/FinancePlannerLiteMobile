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

  var createAndShowAddPaidAmountModal = function(){
      $ionicModal.fromTemplateUrl('templates/addpaidamount.html', {
          scope: $scope
        }).then(function (modal) {
          $scope.addpaidamount = modal;
          $scope.addpaidamount.show();
        });
      }

    $scope.paidAmountToAdd = 0;

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
        if (amountPaid === 0){
          createAndShowDeleteItemModal();
          amountPaidForDelete = amountPaid;
          timesheetIdForDelete = timesheetId;
          itemIdForDelete = itemId;
        } else {
          console.log("Can't delete paid item!");
        }
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

      //$scope.addPaymentToItem(item.itemName,item.amountPlanned,paidAmountToAdd,timesheetId,item._id)
      $scope.addPaymentToItem = function(itemName, amountPlanned, paidAmountPaidYet, timesheetId, itemId){
        $scope.modItemName = itemName;
        $scope.modItemPlanned = amountPlanned;
        $scope.modItemAmount = paidAmountPaidYet;
        $scope.timesheetId = timesheetId;
        $scope.modItemId = itemId;
          createAndShowAddPaidAmountModal();
      }

      $scope.doAddPaymentToItem = function(addAmount){
        var modItemAmount = parseInt($scope.modItemAmount);
        var amountToAdd = parseInt(addAmount);
        var newPaidAmount = modItemAmount + amountToAdd;
        $scope.doModifyItem($scope.modItemName, $scope.modItemPlanned, newPaidAmount, $scope.modItemId, $scope.timesheetId);
        $scope.closeAddPaidAmountModal();
      }

      $scope.doSetItemTotallyPaid = function(itemName, amountPlanned, amountPaid, timesheetId, itemId){

        if (amountPaid > 0){
          console.log('Can\'t set paid already paid item!');
        } else {
          console.log('Setting paid amount === planned...');
          $scope.doModifyItem(itemName,amountPlanned, amountPlanned, itemId, timesheetId);
        }
        // item.itemName,item.amountPlanned,item.amountPaid,timesheetId,item._id

      }

      $scope.closeAddModal = function(){
        $scope.addnewitemmodal.hide();
        $scope.addnewitemmodal.remove();
      }

      $scope.closeModifyModal = function(){
        if(typeof $scope.modifyitemmodal !== 'undefined'){
          $scope.modifyitemmodal.hide();
          $scope.modifyitemmodal.remove();
        }
      }

      $scope.closeDeleteConfirmModal = function(){
        $scope.deleteitemconfirm.hide();
        $scope.deleteitemconfirm.remove();
      }

      $scope.closeAddPaidAmountModal = function(){
        $scope.addpaidamount.hide();
        $scope.addpaidamount.remove();
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

.controller('UserGuideController', ['$scope', '$ionicPlatform', '$ionicModal', function ($scope, $ionicPlatform, $ionicModal) {

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


          var price = input.toString();
          var pointsNeeded = Math.floor((price.length-1)/3);

		  if (pointsNeeded > 0){
			var priceFormatted = price.split("");

			switch (pointsNeeded){
				case 1: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); break;
				case 2: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); break;
				case 3: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); break;
				case 4: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); priceFormatted.splice( (priceFormatted.length-15), 0, "." ); break;
				case 5: priceFormatted.splice( (priceFormatted.length-3), 0, "." ); priceFormatted.splice( (priceFormatted.length-7), 0, "." ); priceFormatted.splice( (priceFormatted.length-11), 0, "." ); priceFormatted.splice( (priceFormatted.length-15), 0, "." ); break; priceFormatted.splice( (priceFormatted.length-19), 0, "." ); break;
			}

			price = priceFormatted.join('');

		  }


          var out = price.concat(" ").concat(currCode.toString());
          return out;
      } else {
          return " - ";
      }

  };
})

.directive('freqnotallowed', [ '$state', function($state) {
    return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {
          var blacklist = attr.freqnotallowed.split(',');

          //For DOM -> model validation
          ngModel.$parsers.unshift(function(value) {
             var valid = blacklist.indexOf(value) === -1;
             ngModel.$setValidity('freqnotallowed', valid);
             return valid ? value : 12;
          });

          //For model -> DOM validation
          ngModel.$formatters.unshift(function(value) {
             ngModel.$setValidity('freqnotallowed', blacklist.indexOf(value) === -1);
             return value;
          });
      }
   };
}])


.controller('ExpenseController', ['$scope', '$state', 'baseURL', 'expenseFactory', '$ionicModal', 'userSettingsFactory', function ($scope, $state, baseURL, expenseFactory, $ionicModal, userSettingsFactory) {

$scope.showLoading = true;

$scope.newExpensename = "expense name";
$scope.newExpenseAmount = 0;
var currentYear = parseInt(new Date().getFullYear());
var currentMonth = parseInt(new Date().getMonth());

var newDate = new Date();
var nextMonth = (parseInt(newDate.getMonth()) + 2);

if (nextMonth > 12){
  nextMonth = nextMonth - 12;
}

$scope.newExpenseFrequency = 12;
$scope.newExpenseNextMonth = nextMonth;

$scope.dueToMonthYear = new Date(currentYear+2, currentMonth +2, 1);

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
var createAndShowModifyExpenseModal = function(){
  $ionicModal.fromTemplateUrl('templates/modifyexpense.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modifyexpmodal = modal;
      $scope.modifyexpmodal.show();
    });
  }

// Create the addnewexpense modal that we will use later
var createAndShowAddNewExpenseModal = function(){
  $ionicModal.fromTemplateUrl('templates/addnewexpense.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.addnewexpmodal = modal;
      $scope.addnewexpmodal.show();
    });
  }

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

    $scope.doAddExpense = function(expName, expAmount, expenseFreq, expenseNextM, dueToMonth) {

      var date = new Date(dueToMonth);
        var aYear = date.getFullYear().toString();
        var aMonth = (date.getMonth()+1).toString();
        var reqMonthString = aYear.concat(aMonth);


      console.log("NEW EXPENSE: " + expName + " " + " " + expAmount + " " + expenseFreq + " " + expenseNextM + " " + dueToMonth);
    $scope.newExpense = {
        expensename: expName,
        amount: expAmount,
        frequency: expenseFreq,
        createdate: newDate,
        nextmonth: expenseNextM,
        duetomonth: reqMonthString
    }

    console.log("NEW EXPENSE: " + $scope.newExpense);
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

    $scope.doModifyExpense = function(newName, newAmount, objectId,newFrequency,newNextMonth,newDueTo) {

      var newDate = new Date(newDueTo);
      var newYear = newDate.getFullYear().toString();
      var newMonth = (newDate.getMonth()+1).toString();
      var reqMonthString = newYear.concat(newMonth);

      var modExpense = {
        expensename: newName,
        amount: newAmount,
        frequency: newFrequency,
        nextmonth: newNextMonth,
        duetomonth: reqMonthString
    }

    if (typeof $scope.duetomonth !== 'undefined'){
        var aYear = parseInt($scope.duetomonth.toString().substring(0, 4));
        var aMonth = parseInt($scope.duetomonth.toString().substring(4, 6));
        $scope.duetoMonthForMP = new Date(aYear, aMonth-1, 1);
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

      createAndShowAddNewExpenseModal();

    }

    $scope.editExpense = function(expName, expAmount, expId, expFreq, expNextMonth, expDueTo) {

      $scope.modExpenseName = expName;
      $scope.modExpenseAmount = expAmount;
      $scope.modExpenseId = expId;
      $scope.modExpenseFrequency = expFreq;
      $scope.modExpenseNextMonth = expNextMonth;
      console.log("expDueTo: " + expDueTo);
      if (typeof expDueTo !== 'undefined'){
        var aYear = parseInt(expDueTo.toString().substring(0, 4));
        var aMonth = parseInt(expDueTo.toString().substring(4, 6));
        $scope.modExpenseDueTo = new Date(aYear, aMonth-1, 1);
      } else {
        $scope.modExpenseDueTo = undefined;
      }

      createAndShowModifyExpenseModal();

    }

    $scope.closeAddModal = function(){
      $scope.addnewexpmodal.hide();
      $scope.addnewexpmodal.remove();
    }

    $scope.closeModifyModal = function(){
      $scope.modifyexpmodal.hide();
      $scope.modifyexpmodal.remove();
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
