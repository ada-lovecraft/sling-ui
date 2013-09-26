angular.module('sling.ui.templates', []);

angular.module('sling.ui', ['sling.ui.templates']);

angular.module('sling.ui').filter('slice', function() {
  return function(arr, start, end) {
    return arr.slice(start, end);
  };
});

angular.module('sling.ui').directive('slingTable', function($filter) {
  return {
    restrict: 'ACE',
    scope: {
      tableData: '=',
      tableConfig: '=',
      tablePager: '=',
      itemsPerPage: '='
    },
    templateUrl: '/sling.ui/templates/sling-table.html',
    transclude: true,
    link: function(scope, elem, attrs) {
      var setPagerState;
      scope.currentPage = 0;
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
        scope.currentPage = 0;
        return scope.sortTable();
      };
      scope.sortTable = function() {
        var end, sort, start;
        sort = scope.sort;
        scope.rawData = $filter('orderBy')(scope.rawData, sort.column, sort.descending);
        start = scope.currentPage * scope.itemsPerPage;
        end = start + scope.itemsPerPage;
        console.log('start:', start, 'end:', end);
        scope.pagedData = $filter('slice')(angular.copy(scope.rawData), start, end);
        console.log('pagedData:', scope.pagedData);
        angular.forEach(scope.pagedData, function(val, index, collection) {
          return angular.forEach(val, function(v, i, c) {
            if (angular.isDefined(scope.tableConfig.display[i].format)) {
              console.log('found format function');
              return collection[index][i] = scope.tableConfig.display[i].format(scope.pagedData[index][i]);
            }
          });
        }, scope.pagedData);
        return console.log('pagedData:', scope.pagedData);
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
      scope.nextPage = function() {
        if (scope.currentPage < scope.totalPages) {
          scope.currentPage++;
        }
        return setPagerState();
      };
      scope.previousPage = function() {
        if (scope.currentPage > 0) {
          scope.currentPage--;
        }
        return setPagerState();
      };
      setPagerState = function() {
        if (scope.currentPage === scope.totalPages) {
          $(elem).find('.next').addClass('disabled');
        } else {
          $(elem).find('.next').removeClass('disabled');
        }
        if (scope.currentPage === 0) {
          return $(elem).find('.previous').addClass('disabled');
        } else {
          return $(elem).find('.previous').removeClass('disabled');
        }
      };
      return scope.$watch('tableData', function(newVal) {
        if (newVal) {
          scope.rawData = angular.copy(newVal);
          scope.totalPages = Math.ceil(scope.rawData.length / scope.itemsPerPage) - 1;
          return scope.$watch('currentPage', function() {
            return scope.sortTable();
          });
        }
      });
    }
  };
});

