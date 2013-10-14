angular.module('sling.ui')
.directive 'slingTable', ($filter) ->
	return {
		restrict: 'ACE'
		scope: {
			tableData: '='
			tableConfig: '='
			tablePager: '='
			tableSearch: '='
			itemsPerPage: '='
			tableClass: '@'
		}
		templateUrl: '/sling.ui/templates/sling-table.html'
		transclude: true
		link: (scope, elem, attrs) ->

			scope.currentPage = 1

			console.log 'slingTable recognized'
			
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
				start = (scope.currentPage-1) * scope.itemsPerPage
				end =  start + scope.itemsPerPage 
				console.log 'start:', start, 'end:', end
				scope.pagedData = $filter('slice')($filter('filter')(angular.copy(scope.rawData),scope.slingSearch), start, end)
				console.log 'pagedData:', scope.pagedData
				angular.forEach(scope.pagedData, (val,index,collection) ->
					angular.forEach val, (v, i, c) ->
						if _.has(scope.tableConfig.display[i],'format')
							console.log 'found format function'
							collection[index][i] = scope.tableConfig.display[i].format(scope.pagedData[index][i],scope.pagedData[index])
						else if collection[index][i] != null
							collection[index][i] = collection[index][i].toString()
						else
							return null
				,scope.pagedData)
				console.log 'pagedData:', scope.pagedData


			scope.pager =
				showPager: ->
					return scope.totalPages > 1 && scope.tablePager
				nextPage: ->
					scope.currentPage++ if scope.currentPage < scope.totalPages
					setPagerState()
				previousPage: ->
					scope.currentPage-- if scope.currentPage > 1
					setPagerState()


			setPagerState = ->
				console.log 'currentPage:', scope.currentPage
				if scope.currentPage == scope.totalPages
						$(elem).find('.next').addClass('disabled')
					else
						$(elem).find('.next').removeClass('disabled')

					if scope.currentPage == 1
						$(elem).find('.previous').addClass('disabled')
					else
						$(elem).find('.previous').removeClass('disabled')

			scope.search = ->
				scope.currentPage = 1
				scope.sortTable()

			scope.getSortedClass = (column) ->
				sort = scope.sort
				if column == sort.column
					return 'sling-sorted'
				else
					return ''

			

			scope.$watch 'tableData', (newVal) ->
				if newVal
					scope.rawData = angular.copy(newVal)

					scope.totalPages = Math.ceil(scope.rawData.length / scope.itemsPerPage)
					console.log 'total pages:', scope.rawData.length, scope.itemsPerPage, scope.totalPages
					scope.$watch 'currentPage', ->
						scope.sortTable()
						setPagerState()

	}