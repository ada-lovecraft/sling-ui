angular.module 'sling.ui'
.filter 'slice', ->
	return (arr, start, end) ->
		return arr.slice(start, end)