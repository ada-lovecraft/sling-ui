angular.module('sling.ui.templates', []);

angular.module('sling.ui', ['sling.ui.templates', 'ngSanitize']);

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
        start = (scope.currentPage - 1) * scope.itemsPerPage;
        end = start + scope.itemsPerPage;
        if (scope.paged) {
          return scope.slingData = $filter('slice')($filter('filter')(angular.copy(scope.rawData), scope.slingSearch), start, end);
        } else {
          return scope.slingData = $filter('filter')(angular.copy(scope.rawData), scope.slingSearch);
        }
      };
      scope.pager.showPager = function() {
        return scope.totalPages >= 1 && scope.paged;
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
      itemsPerPage: '='
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
          return scope.totalPages >= 1 && scope.tablePager;
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