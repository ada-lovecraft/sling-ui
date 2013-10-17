angular.module('sling.ui.templates', []);

angular.module('sling.ui', ['sling.ui.templates', 'ngSanitize']);

;angular.module('sling.ui').directive('slingahead', function($timeout) {
  return {
    restrict: 'ACE',
    transclude: true,
    replace: true,
    templateUrl: '/sling.ui/templates/sling-ahead.html',
    scope: {
      search: '&',
      select: '&',
      items: '=',
      term: '=',
      placeholder: '@'
    },
    controller: function($scope) {
      $scope.items = [];
      $scope.hide = false;
      this.searchTimeout = null;
      this.activate = function(item) {
        $scope.active = item;
        return console.log('activated', $scope.active);
      };
      this.activateNextItem = function() {
        var index;
        index = _.indexOf($scope.items, $scope.active);
        return this.activate($scope.items[(index + 1) % $scope.items.length]);
      };
      this.activatePreviousItem = function() {
        var index;
        index = _.indexOf($scope.items, $scope.active);
        if (index === 0) {
          index = $scope.items.length - 1;
        } else {
          index -= 1;
        }
        return this.activate($scope.items[index]);
      };
      this.isActive = function(item) {
        return $scope.active === item;
      };
      this.select = function() {
        if ($scope.active) {
          console.log('controller selected:', $scope.active);
          $scope.hide = true;
          $scope.focused = false;
          $scope.select({
            item: $scope.active
          });
          return $scope.active = null;
        }
      };
      this.selectActive = function() {
        return this.select($scope.active);
      };
      $scope.isVisible = function() {
        return !$scope.hide && ($scope.focused || $scope.mousedOver);
      };
      return $scope.query = function() {
        var $searchTimeout,
          _this = this;
        if ($searchTimeout) {
          $timout.cancel($searchTimeout);
          $searchTimeout = null;
        }
        return $searchTimeout = $timeout(function() {
          $scope.hide = false;
          return $scope.search({
            term: $scope.term
          });
        }, 300);
      };
    },
    link: function(scope, element, attrs, controller) {
      var $input, $list;
      $input = element.find('form > input');
      $list = element.find('> div');
      $input.on('focus', function() {
        return scope.$apply(function() {
          return scope.focused = true;
        });
      });
      $input.on('blur', function() {
        return scope.$apply(function() {
          return scope.mousedOver = true;
        });
      });
      $input.on('keyup', function(e) {
        if (e.keyCode === 9 || e.keyCode === 13) {
          scope.$apply(function() {
            return controller.selectActive();
          });
        }
        if (e.keyCode === 27) {
          return scope.$apply(function() {
            return scope.hide = true;
          });
        }
      });
      $input.on('keydown', function(e) {
        if (e.keyCode === 9 || e.keyCode === 13 || e.keydown === 27) {
          e.preventDefault();
        }
        if (e.keyCode === 40) {
          e.preventDefault();
          scope.$apply(function() {
            return controller.activateNextItem();
          });
        }
        if (e.keyCode === 38) {
          e.preventDefault();
          return scope.$apply(function() {
            return controller.activatePreviousItem();
          });
        }
      });
      $list.on('mouseover', function() {
        return scope.$apply(function() {
          return scope.mousedOver = true;
        });
      });
      $list.on('mouseleave', function() {
        return scope.$apply(function() {
          return scope.mousedOver = false;
        });
      });
      scope.$watch('items', function(items) {
        if (items != null ? items.length : void 0) {
          return controller.activate(items[0]);
        } else {
          return controller.activate(null);
        }
      });
      scope.$watch('focused', function(focused) {
        if (focused) {
          return $timeout(function() {
            return $input.focus();
          }, 0, false);
        }
      });
      return scope.$watch('isVisible()', function(visible) {
        var height, pos;
        if (visible) {
          pos = $input.position();
          height = $input[0].offsetHeight;
          return $list.css({
            top: pos.top + height,
            left: pos.left,
            position: 'absolute',
            display: 'block'
          });
        } else {
          return $list.css('display', 'none');
        }
      });
    }
  };
}).directive('slingaheadItem', function() {
  return {
    require: '^slingahead',
    link: function(scope, element, attrs, controller) {
      var item;
      item = scope.$eval(attrs.slingaheadItem);
      scope.$watch(function() {
        return controller.isActive(item);
      }, function(active) {
        if (active) {
          return element.addClass('active');
        } else {
          return element.removeClass('active');
        }
      });
      element.bind('mouseenter', function(e) {
        return scope.$apply(function() {
          return controller.activate(item);
        });
      });
      return element.bind('click', function(e) {
        return scope.$apply(function() {
          return controller.select(item);
        });
      });
    }
  };
});

;angular.module('sling.ui').filter('slice', function() {
  return function(arr, start, end) {
    return arr.slice(start, end);
  };
});

;angular.module('sling.ui').directive('slingPowerTable', function($templateCache, $filter, $timeout, $compile) {
  return {
    restrict: 'ACE',
    scope: true,
    link: function(scope, elem, attrs) {
      var setPagerState, setupPagers;
      console.log('sling power table recognized');
      scope.model = attrs.slingModel || 'data';
      scope.itemsPerPage = attrs.itemsPerPage || 10;
      scope.currentPage = 1;
      scope.paged = attrs.paged;
      scope.tableSearch = attrs.search;
      if (scope.tableSearch) {
        elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-search.html').trim())(scope));
      }
      if (scope.paged) {
        elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-pager.html').trim())(scope));
      }
      scope.pager = {
        nextPage: function() {
          console.log('next page!');
          if (scope.currentPage < scope.totalPages) {
            scope.currentPage++;
          }
          return setPagerState();
        },
        previousPage: function() {
          if (scope.currentPage > 1) {
            scope.currentPage--;
          }
          return setPagerState();
        }
      };
      console.log(scope.tableOrder);
      scope.pagedData = null;
      scope.sort = {
        column: null,
        descending: false
      };
      console.log(scope.sort);
      scope.switchColumn = function(column) {
        var sort;
        sort = scope.sort;
        console.log('sorting table:', column);
        if (sort.column === column) {
          sort.descending = !sort.descending;
        } else {
          sort.column = column;
          sort.descending = false;
        }
        scope.currentPage = 1;
        return scope.sortTable();
      };
      scope.sortTable = function() {
        var end, sort, start;
        sort = scope.sort;
        scope.rawData = $filter('orderBy')(scope.rawData, sort.column, sort.descending);
        if (!_.isArray(scope.rawData)) {
          scope.rawData = [scope.rawData];
        }
        start = (scope.currentPage - 1) * scope.itemsPerPage;
        end = start + scope.itemsPerPage;
        if (scope.paged) {
          return scope.slingData = $filter('slice')($filter('filter')(angular.copy(scope.rawData), scope.slingSearch), start, end);
        } else {
          return scope.slingData = $filter('filter')(angular.copy(scope.rawData), scope.slingSearch);
        }
      };
      scope.pager.showPager = function() {
        return scope.totalPages > 1 && scope.paged;
      };
      scope.search = function() {
        scope.currentPage = 1;
        return scope.sortTable();
      };
      scope.getSortedClass = function(column) {
        var sort;
        sort = scope.sort;
        if (column === sort.column) {
          return 'sling-sorted';
        } else {
          return '';
        }
      };
      setPagerState = function() {
        console.log('currentPage:', scope.currentPage);
        if (scope.currentPage === scope.totalPages) {
          $(elem).parent().find('.next').addClass('disabled');
        } else {
          $(elem).parent().find('.next').removeClass('disabled');
        }
        if (scope.currentPage === 1) {
          return $(elem).parent().find('.previous').addClass('disabled');
        } else {
          return $(elem).parent().find('.previous').removeClass('disabled');
        }
      };
      setupPagers = function() {
        console.log('setting up pagers');
        console.log('next:', $(elem).parent().find('.next'));
        return setPagerState();
      };
      return scope.$watch(scope.model, function(newVal) {
        console.log('watch:', newVal);
        console.log('scope:', scope);
        if (newVal) {
          console.log('added Pager');
          scope.rawData = angular.copy(newVal);
          scope.totalPages = Math.ceil(scope.rawData.length / scope.itemsPerPage);
          console.log('total pages:', scope.rawData.length, scope.itemsPerPage, scope.totalPages);
          return scope.$watch('currentPage', function() {
            console.log('current page changed');
            scope.sortTable();
            return $timeout(setupPagers, 0);
          });
        }
      });
    }
  };
});

;angular.module('sling.ui').directive('slingTable', function($filter) {
  return {
    restrict: 'ACE',
    scope: {
      tableData: '=',
      tableConfig: '=',
      tablePager: '=',
      tableSearch: '=',
      itemsPerPage: '=',
      tableClass: '@'
    },
    templateUrl: '/sling.ui/templates/sling-table.html',
    transclude: true,
    link: function(scope, elem, attrs) {
      var setPagerState;
      scope.currentPage = 1;
      console.log('slingTable recognized');
      console.log(scope.tableOrder);
      scope.pagedData = null;
      scope.sort = {
        column: null,
        descending: false
      };
      console.log(scope.sort);
      scope.switchColumn = function(column) {
        var sort;
        sort = scope.sort;
        console.log('sorting table:', column);
        if (sort.column === column) {
          sort.descending = !sort.descending;
        } else {
          sort.column = column;
          sort.descending = false;
        }
        scope.currentPage = 1;
        return scope.sortTable();
      };
      scope.sortTable = function() {
        var end, sort, start;
        sort = scope.sort;
        scope.rawData = $filter('orderBy')(scope.rawData, sort.column, sort.descending);
        if (!_.isArray(scope.rawData)) {
          scope.rawData = [scope.rawData];
        }
        start = (scope.currentPage - 1) * scope.itemsPerPage;
        end = start + scope.itemsPerPage;
        console.log('start:', start, 'end:', end);
        scope.pagedData = $filter('slice')($filter('filter')(angular.copy(scope.rawData), scope.slingSearch), start, end);
        console.log('pagedData:', scope.pagedData);
        angular.forEach(scope.pagedData, function(val, index, collection) {
          return angular.forEach(val, function(v, i, c) {
            if (_.has(scope.tableConfig.display[i], 'format')) {
              console.log('found format function');
              return collection[index][i] = scope.tableConfig.display[i].format(scope.pagedData[index][i], scope.pagedData[index]);
            } else if (collection[index][i] !== null) {
              return collection[index][i] = collection[index][i].toString();
            } else {
              return null;
            }
          });
        }, scope.pagedData);
        return console.log('pagedData:', scope.pagedData);
      };
      scope.pager = {
        showPager: function() {
          return scope.totalPages > 1 && scope.tablePager;
        },
        nextPage: function() {
          if (scope.currentPage < scope.totalPages) {
            scope.currentPage++;
          }
          return setPagerState();
        },
        previousPage: function() {
          if (scope.currentPage > 1) {
            scope.currentPage--;
          }
          return setPagerState();
        }
      };
      setPagerState = function() {
        console.log('currentPage:', scope.currentPage);
        if (scope.currentPage === scope.totalPages) {
          $(elem).find('.next').addClass('disabled');
        } else {
          $(elem).find('.next').removeClass('disabled');
        }
        if (scope.currentPage === 1) {
          return $(elem).find('.previous').addClass('disabled');
        } else {
          return $(elem).find('.previous').removeClass('disabled');
        }
      };
      scope.search = function() {
        scope.currentPage = 1;
        return scope.sortTable();
      };
      scope.getSortedClass = function(column) {
        var sort;
        sort = scope.sort;
        if (column === sort.column) {
          return 'sling-sorted';
        } else {
          return '';
        }
      };
      return scope.$watch('tableData', function(newVal) {
        if (newVal) {
          scope.rawData = angular.copy(newVal);
          scope.totalPages = Math.ceil(scope.rawData.length / scope.itemsPerPage);
          console.log('total pages:', scope.rawData.length, scope.itemsPerPage, scope.totalPages);
          return scope.$watch('currentPage', function() {
            scope.sortTable();
            return setPagerState();
          });
        }
      });
    }
  };
});

;