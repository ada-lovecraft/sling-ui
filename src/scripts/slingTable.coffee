angular.module('sling.ui')
.directive 'slingTable', ($filter) ->
	return {
		restrict: 'ACE'
		scope: {
			tableData: '='
			tableConfig: '='
			tablePager: '='
			itemsPerPage: '='
		}
		templateUrl: '/sling.ui/templates/sling-table.html'
		transclude: true
		link: (scope, elem, attrs) ->

			scope.currentPage = 0

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

				scope.currentPage = 0
				scope.sortTable()

			scope.sortTable = ->
				sort = scope.sort
				scope.rawData = $filter('orderBy')(scope.rawData,sort.column,sort.descending)
				start = scope.currentPage * scope.itemsPerPage
				end =  start + scope.itemsPerPage 
				console.log 'start:', start, 'end:', end
				scope.pagedData = $filter('slice')(angular.copy(scope.rawData), start, end)
				console.log 'pagedData:', scope.pagedData
				angular.forEach(scope.pagedData, (val,index,collection) ->
					angular.forEach val, (v, i, c) ->
						if angular.isDefined(scope.tableConfig.display[i].format)
							console.log 'found format function'
							collection[index][i] = scope.tableConfig.display[i].format(scope.pagedData[index][i])
				,scope.pagedData)
				console.log 'pagedData:', scope.pagedData


			scope.getSortedClass = (column) ->
				sort = scope.sort
				if column == sort.column
					return 'sling-sorted'
				else
					return ''

			scope.nextPage = ->
				scope.currentPage++ if scope.currentPage < scope.totalPages
				setPagerState()
				


			scope.previousPage = ->
				scope.currentPage-- if scope.currentPage > 0
				setPagerState()


			setPagerState = ->
				if scope.currentPage == scope.totalPages
						$(elem).find('.next').addClass('disabled')
					else
						$(elem).find('.next').removeClass('disabled')

					if scope.currentPage == 0
						$(elem).find('.previous').addClass('disabled')
					else
						$(elem).find('.previous').removeClass('disabled')

			scope.$watch 'tableData', (newVal) ->
				if newVal
					scope.rawData = angular.copy(newVal)

					scope.totalPages = Math.ceil(scope.rawData.length / scope.itemsPerPage) - 1
					scope.$watch 'currentPage', ->
						scope.sortTable()

	}