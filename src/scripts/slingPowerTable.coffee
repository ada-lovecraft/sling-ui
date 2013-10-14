angular.module('sling.ui').directive 'slingPowerTable', ($templateCache, $filter,$timeout, $compile) ->
  return {
    restrict: 'ACE'
    scope: true
    link: (scope, elem, attrs) ->
      console.log 'sling power table recognized'
      scope.model = attrs.slingModel || 'data'
      scope.itemsPerPage = attrs.itemsPerPage || 10
      scope.currentPage = 1
      scope.paged = attrs.paged 
      scope.tableSearch = attrs.search

      elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-search.html').trim())(scope)) if scope.tableSearch
      elem.prepend($compile($templateCache.get('/sling.ui/templates/sling-pager.html').trim())(scope)) if scope.paged
      scope.pager = 
        nextPage: ->
          console.log 'next page!'
          scope.currentPage++ if scope.currentPage < scope.totalPages
          setPagerState()
        previousPage: ->
          scope.currentPage-- if scope.currentPage > 1
          setPagerState()
      
      console.log scope.tableOrder
      scope.pagedData = null
      scope.sort =
        column: null
        descending: false

      console.log scope.sort

      scope.switchColumn = (column) ->
        sort = scope.sort
        console.log 'sorting table:', column
        if sort.column == column
          sort.descending = !sort.descending
        else
          sort.column = column
          sort.descending = false

        scope.currentPage = 1
        scope.sortTable()

      scope.sortTable = ->
        sort = scope.sort
        scope.rawData = $filter('orderBy')(scope.rawData,sort.column,sort.descending)
        if typeof scope.rawData == 'object'
          scope.rawData = [scope.rawData]
        start = (scope.currentPage-1) * scope.itemsPerPage
        end =  start + scope.itemsPerPage 
        if scope.paged 
          scope.slingData = $filter('slice')($filter('filter')(angular.copy(scope.rawData),scope.slingSearch), start, end)
        else 
          scope.slingData = $filter('filter')(angular.copy(scope.rawData),scope.slingSearch)

      scope.pager.showPager = ->
        return scope.totalPages > 1 && scope.paged

      scope.search = ->
        scope.currentPage = 1
        scope.sortTable()

      scope.getSortedClass = (column) ->
        sort = scope.sort
        if column == sort.column
          return 'sling-sorted'
        else
          return ''


      setPagerState = ->
        console.log 'currentPage:', scope.currentPage
        if scope.currentPage == scope.totalPages
            $(elem).parent().find('.next').addClass('disabled')
        else
          $(elem).parent().find('.next').removeClass('disabled')

        if scope.currentPage == 1
          $(elem).parent().find('.previous').addClass('disabled')
        else
          $(elem).parent().find('.previous').removeClass('disabled')

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
            scope.sortTable()
            $timeout( setupPagers, 0)
  } 