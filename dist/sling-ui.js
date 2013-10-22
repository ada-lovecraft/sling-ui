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
        return ;
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
        var _this = this;
        if (this.searchTimeout) {
          $timeout.cancel(this.searchTimeout);
          this.searchTimeout = null;
        }
        return this.searchTimeout = $timeout(function() {
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

;angular.module('sling.ui').directive('slingTable', function($templateCache, $filter, $timeout, $compile) {
  return {
    restrict: 'ACE',
    scope: true,
    controller: function($scope) {
      this.changePage = function(page) {
        return $scope.currentPage = page;
      };
      this.firstPageLabel = function() {
        return $scope.firstPageLabel;
      };
      this.lastPageLabel = function() {
        return $scope.lastPageLabel;
      };
      this.getCurrentPage = function() {
        return $scope.currentPage;
      };
      this.getTotalPages = function() {
        return $scope.totalPages;
      };
      this.sort = function(field, childNum) {
        var sort;
        sort = $scope.sort;
        if (sort.field === field) {
          
          sort.descending = !sort.descending;
        } else {
          sort.field = field;
          sort.descending = false;
        }
        $scope.currentPage = 1;
        $scope.highlightChildNum = childNum;
        $scope.sortTable();
        return $scope.$broadcast('sling:sortChanged', $scope.sort);
      };
      return this.getSort = function(field) {
        return $scope.sort;
      };
    },
    link: function(scope, elem, attrs) {
      var setPagerState, setupPagers;
      
      scope.model = attrs.slingModel || 'data';
      scope.itemsPerPage = attrs.itemsPerPage || 10;
      scope.currentPage = 1;
      scope.paged = attrs.paged;
      scope.tableSearch = attrs.search;
      scope.pages = [];
      scope.pagesToShow = attrs.pagesToShow || 5;
      scope.firstPageLabel = attrs.firstPageLabel || 'First';
      scope.lastPageLabel = attrs.lastPageLabel || 'Last';
      if (scope.tableSearch) {
        elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-search.html').trim())(scope));
      }
      if (scope.simplePager) {
        elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-pager.html').trim())(scope));
      }
      if (scope.paged) {
        elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-pagination.html').trim())(scope));
      }
      scope.pagedData = null;
      scope.sort = {
        field: null,
        descending: false
      };
      scope.sortTable = function() {
        var end, sort, start;
        sort = scope.sort;
        scope.rawData = $filter('orderBy')(scope.rawData, sort.field, sort.descending);
        if (!_.isArray(scope.rawData)) {
          scope.rawData = [scope.rawData];
        }
        start = (scope.currentPage - 1) * scope.itemsPerPage;
        end = start + scope.itemsPerPage;
        if (scope.paged) {
          scope.slingData = $filter('slice')($filter('filter')(angular.copy(scope.rawData), scope.slingSearch), start, end);
        } else {
          scope.slingData = $filter('filter')(angular.copy(scope.rawData), scope.slingSearch);
        }
        
        if (scope.highlightChildNum) {
          return $timeout(function() {
            return $(elem).find('td:nth-child(' + scope.highlightChildNum + ')').addClass('sling-sorted');
          }, 50);
        }
      };
      scope.pager = {
        showPager: function() {
          return scope.totalPages > 1 && scope.paged;
        }
      };
      scope.search = function() {
        scope.currentPage = 1;
        return scope.sortTable();
      };
      setPagerState = function() {
        
        if (scope.currentPage < 1) {
          scope.currentPage = 1;
        }
        if (scope.currentPage > scope.totalPages) {
          return scope.currentPage = scope.totalPages;
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
            var i, lowPage, mid, _i, _j, _k, _ref, _ref1, _ref2, _ref3;
            
            scope.pages = [];
            if (scope.currentPage < scope.pagesToShow) {
              for (i = _i = 1, _ref = scope.pagesToShow; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
                
                scope.pages.push(i);
              }
            } else if (scope.currentPage > scope.totalPages - (scope.pagesToShow - 1)) {
              
              lowPage = scope.totalPages - (scope.pagesToShow - 1);
              for (i = _j = lowPage, _ref1 = scope.totalPages; lowPage <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = lowPage <= _ref1 ? ++_j : --_j) {
                scope.pages.push(i);
              }
            } else {
              if (scope.pagesToShow % 2 === 1) {
                mid = Math.floor(scope.pagesToShow / 2);
                for (i = _k = _ref2 = scope.currentPage - mid, _ref3 = scope.currentPage + mid; _ref2 <= _ref3 ? _k <= _ref3 : _k >= _ref3; i = _ref2 <= _ref3 ? ++_k : --_k) {
                  scope.pages.push(i);
                }
              }
            }
            scope.sortTable();
            return $timeout(setupPagers, 0);
          });
        }
      });
    }
  };
}).directive('slingPage', function() {
  return {
    restrict: 'A',
    scope: {
      targetPage: '='
    },
    require: '^slingTable',
    replace: true,
    template: '<li ng-click="turnPage()" ng-class="getPageClass()"><a>{{targetPage}}</a></li>',
    link: function(scope, element, attrs, controller) {
      scope.getPageClass = function() {
        if (scope.targetPage === controller.getCurrentPage()) {
          return 'active';
        } else if (scope.targetPage > controller.getTotalPages()) {
          return 'disabled';
        } else {
          return '';
        }
      };
      return scope.turnPage = function() {
        
        return controller.changePage(scope.targetPage);
      };
    }
  };
}).directive('slingSort', function() {
  return {
    restrict: 'A',
    scope: {
      sortField: '@'
    },
    require: '^slingTable',
    replace: false,
    transclude: true,
    /*
    ng-class="getSortedClass(column)", class="{{tableConfig.display[column].className}} sling-interactable"){{tableConfig.display[column].label}}
            span(ng-show="sort.column == column")
              .glyphicon.glyphicon-chevron-up(ng-hide="sort.descending")
              .glyphicon.glyphicon-chevron-down(ng-show="sort.descending")
    */

    template: '<div ng-click="sort()" class="sling-interactable">\n  <span ng-transclude="ng-transclude"></span>\n  <span ng-show="sorted.field == sortField">\n    <span class="glyphicon glyphicon-chevron-up" ng-hide="sorted.descending"></span>\n    <span class="glyphicon glyphicon-chevron-down" ng-show="sorted.descending"></span\n  </span>\n</div>',
    link: function(scope, element, attrs, controller) {
      var $element, $parent, $table, children, i, _i, _ref;
      $table = $(element.parent().parent().parent());
      $parent = $(element.parent());
      $element = $(element);
      children = $parent.children();
      
      for (i = _i = 0, _ref = children.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (children[i] === $element[0]) {
          scope.childNumber = i + 1;
        }
      }
      scope.$on('sling:sortChanged', function(evt, args) {
        if (args) {
          scope.sorted = args;
          if (scope.sortField === scope.sorted.field) {
            return element.addClass('sling-sorted');
          } else {
            return element.removeClass('sling-sorted');
          }
        }
      });
      return scope.sort = function() {
        return controller.sort(scope.sortField, scope.childNumber);
      };
    }
  };
});

;