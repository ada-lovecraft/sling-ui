angular.module('sling.ui').directive 'slingTable', ($templateCache, $filter,$timeout, $compile) ->
  return {
    restrict: 'ACE'
    scope: true
    controller: ($scope) ->
      return {
        changePage: (page) ->
          $scope.currentPage = page
        firstPageLabel:  ->
          return $scope.firstPageLabel
        lastPageLabel:  ->
          return $scope.lastPageLabel
        getCurrentPage:  ->
          return $scope.currentPage
        getTotalPages:  ->
          return $scope.totalPages
        sort: (field, childNum) ->
          sort = $scope.sort
          if sort.field == field
            console.log 'switching to descending'
            sort.descending = !sort.descending
          else
            sort.field = field
            sort.descending = false
          
          $scope.currentPage = 1
          $scope.highlightChildNum = childNum
          $scope.sortTable()
          $scope.$broadcast('sling:sortChanged',$scope.sort)
          
        getSort:  (field) ->
          $scope.sort
      }

      
    link: (scope, elem, attrs) ->
      console.log 'sling power table recognized'
      scope.model = attrs.slingModel || 'data'
      scope.itemsPerPage = parseInt(attrs.itemsPerPage) || 10
      scope.currentPage = 1
      scope.paged = attrs.paged 
      scope.tableSearch = attrs.search
      scope.pages = []
      scope.pagesToShow = parseInt(attrs.pagesToShow) || 5
      scope.firstPageLabel = attrs.firstPageLabel || 'First'
      scope.lastPageLabel = attrs.lastPageLabel || 'Last'

      elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-search.html').trim())(scope)) if scope.tableSearch
      elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-pager.html').trim())(scope)) if scope.simplePager
      elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-pagination.html').trim())(scope)) if scope.paged

      scope.pagedData = null
      scope.sort =
        field: null
        descending: false

      scope.sortTable = ->
        sort = scope.sort

        scope.rawData = $filter('orderBy')(scope.rawData,sort.field,sort.descending)
        if !_.isArray(scope.rawData)
          scope.rawData = [scope.rawData]
        start = (scope.currentPage-1) * scope.itemsPerPage
        end =  start + scope.itemsPerPage 
        if scope.paged 
          scope.slingData = $filter('slice')($filter('filter')(angular.copy(scope.rawData),scope.slingSearch), start, end)
        else 
          scope.slingData = $filter('filter')(angular.copy(scope.rawData),scope.slingSearch)
        console.log 'scope.highlightChildNum', scope.highlightChildNum
        if scope.highlightChildNum
          $timeout ->
            $(elem).find('td:nth-child(' + scope.highlightChildNum + ')').addClass('sling-sorted')
          , 50

      scope.pager =
        showPager: ->
          return scope.totalPages > 1 && scope.paged

      scope.search = ->
        scope.currentPage = 1
        scope.sortTable()

      setPagerState = ->
        console.log 'currentPage:', scope.currentPage
        scope.currentPage = 1 if scope.currentPage < 1
        scope.currentPage = scope.totalPages if scope.currentPage > scope.totalPages
          
      setupPagers = ->
        console.log 'setting up pagers'
        console.log 'next:', $(elem).parent().find('.next')
        setPagerState()

      scope.$watch scope.model, (newVal) ->
        console.log 'watch:', newVal
        console.log 'scope:', scope

        if newVal
          
          console.log 'added Pager'
          scope.rawData = angular.copy(newVal)

          scope.totalPages = Math.ceil(scope.rawData.length / scope.itemsPerPage)
          console.log 'total pages:', scope.rawData.length, scope.itemsPerPage, scope.totalPages
          scope.$watch 'currentPage', ->
            console.log 'current page changed'
            scope.pages = []
            if scope.currentPage < scope.pagesToShow
              for i in [1..scope.pagesToShow]
                console.log 'i:', i
                scope.pages.push i
            else if scope.currentPage > scope.totalPages - (scope.pagesToShow - 1)
              console.log scope.currentPage, (scope.totalPages - scope.pagesToShow)
              lowPage = (scope.totalPages - (scope.pagesToShow - 1) )
              for i in [lowPage..scope.totalPages]
                scope.pages.push i
            else 
              if scope.pagesToShow % 2 == 1
                mid = Math.floor(scope.pagesToShow / 2)
                for i in [scope.currentPage - mid..scope.currentPage + mid]
                  scope.pages.push i
            scope.sortTable()

            $timeout( setupPagers, 0)
  }

.directive 'slingPage', ->
  restrict: 'A'
  scope: 
    targetPage: '='
  require: '^slingTable'
  replace: true
  template: '<li ng-click="turnPage()" ng-class="getPageClass()"><a>{{targetPage}}</a></li>'
  link: (scope, element, attrs, controller) ->
    scope.getPageClass = ->
      if scope.targetPage == controller.getCurrentPage()
        return 'active'
      else if scope.targetPage > controller.getTotalPages()
        return 'disabled'
      else
        return ''

    scope.turnPage = ->
      console.log 'turning page'
      controller.changePage(scope.targetPage)
.directive 'slingSort', ->
  restrict: 'A'
  scope: 
    sortField: '@'
  require: '^slingTable'
  replace: false
  transclude: true
  ###
  ng-class="getSortedClass(column)", class="{{tableConfig.display[column].className}} sling-interactable"){{tableConfig.display[column].label}}
          span(ng-show="sort.column == column")
            .glyphicon.glyphicon-chevron-up(ng-hide="sort.descending")
            .glyphicon.glyphicon-chevron-down(ng-show="sort.descending")
  ###
  template:'''
  <div ng-click="sort()" class="sling-interactable">
    <span ng-transclude="ng-transclude"></span>
    <span ng-show="sorted.field == sortField">
      <span class="glyphicon glyphicon-chevron-up" ng-hide="sorted.descending"></span>
      <span class="glyphicon glyphicon-chevron-down" ng-show="sorted.descending"></span
    </span>
  </div>
  '''
  link: (scope, element, attrs, controller) ->
    $table = $(element.parent().parent().parent())
    $parent = $(element.parent())
    $element = $(element)
    children = $parent.children()
    console.log 'children:', children
    for i in [0...children.length]
      if children[i] == $element[0]
        scope.childNumber = i+1
    scope.$on 'sling:sortChanged', (evt, args) ->
      if args
        scope.sorted = args
        if scope.sortField == scope.sorted.field
          element.addClass('sling-sorted')
        else
          element.removeClass('sling-sorted')

    scope.sort = ->
      controller.sort(scope.sortField, scope.childNumber)



