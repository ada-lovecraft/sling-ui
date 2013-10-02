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
      
      scope.pagedData = null;
      scope.sort = {
        column: null,
        descending: false
      };
      
      scope.switchColumn = function(column) {
        var sort;
        sort = scope.sort;
        
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
        
        
        return setPagerState();
      };
      return scope.$watch(scope.model, function(newVal) {
        
        
        if (newVal) {
          
          scope.rawData = angular.copy(newVal);
          scope.totalPages = Math.ceil(scope.rawData.length / scope.itemsPerPage);
          
          return scope.$watch('currentPage', function() {
            
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
      
      
      scope.pagedData = null;
      scope.sort = {
        column: null,
        descending: false
      };
      
      scope.switchColumn = function(column) {
        var sort;
        sort = scope.sort;
        
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
        
        scope.pagedData = $filter('slice')($filter('filter')(angular.copy(scope.rawData), scope.slingSearch), start, end);
        
        angular.forEach(scope.pagedData, function(val, index, collection) {
          return angular.forEach(val, function(v, i, c) {
            if (angular.isDefined(scope.tableConfig.display[i].format)) {
              
              return collection[index][i] = scope.tableConfig.display[i].format(scope.pagedData[index][i], scope.pagedData[index]);
            }
          });
        }, scope.pagedData);
        return ;
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