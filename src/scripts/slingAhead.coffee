angular.module('sling.ui')
.directive 'slingahead', ($timeout) ->
	return {
		restrict: 'ACE'
		transclude: true
		replace: true
		templateUrl: '/sling.ui/templates/sling-ahead.html'
		scope: 
			search: '&'
			select: '&'
			items: '='
			term: '='
			placeholder: '@'

		controller: ($scope) ->
			$scope.items = []
			$scope.hide = false
			
			@activate = (item) ->
				$scope.active = item
				console.log 'activated', $scope.active

			@activateNextItem = ->
				index = _.indexOf $scope.items, $scope.active
				@activate $scope.items[(index + 1) % $scope.items.length]

			@activatePreviousItem = ->
				index = _.indexOf $scope.items, $scope.active
				if index == 0
					index = $scope.items.length - 1
				else
					index -= 1

				@activate $scope.items[index]				

			@isActive = (item) ->
				$scope.active == item


			@select = ->
				if $scope.active
					console.log 'controller selected:', $scope.active
					$scope.hide = true
					$scope.focused = false
					$scope.select({item: $scope.active})
					$scope.active = null

			@selectActive = ->
				@select $scope.active

			$scope.isVisible = ->
				return !$scope.hide && ($scope.focused || $scope.mousedOver)

			$scope.query = ->
				console.log 'SEARCHING:', $scope.term
				$scope.hide = false
				$scope.search({term: $scope.term})

		link: (scope, element, attrs, controller) ->
			$input = element.find 'form > input'
			$list = element.find '> div'

			$input.on 'focus', ->
				scope.$apply ->
					scope.focused = true

			$input.on 'blur', ->
				scope.$apply ->
					scope.mousedOver = true

			$input.on 'keyup', (e) ->
				if e.keyCode == 9 || e.keyCode == 13
					scope.$apply ->
						controller.selectActive()


				if e.keyCode == 27
					scope.$apply ->
						scope.hide = true

			$input.on 'keydown', (e) ->
				if e.keyCode == 9 || e.keyCode == 13 || e.keydown == 27
					e.preventDefault()

				if e.keyCode == 40
					e.preventDefault()
					scope.$apply ->
						controller.activateNextItem()

				if e.keyCode == 38 
					e.preventDefault()
					scope.$apply ->
						controller.activatePreviousItem()


			$list.on 'mouseover', ->
				scope.$apply ->
					scope.mousedOver = true

			$list.on 'mouseleave', ->
				scope.$apply ->
					scope.mousedOver = false

			scope.$watch 'items', (items) ->
				if items?.length
					controller.activate items[0]
				else
					controller.activate null

			scope.$watch 'focused', (focused) ->
				if focused
					$timeout ->
						$input.focus()
					, 0, false

			scope.$watch 'isVisible()', (visible) ->
				if visible
					pos = $input.position()
					height = $input[0].offsetHeight

					$list.css 
						top: pos.top + height
						left: pos.left
						position: 'absolute'
						display: 'block'
				else
					$list.css 'display', 'none'
	}

.directive 'slingaheadItem', ->
	return {
		require: '^slingahead'
		link: (scope, element, attrs, controller) ->
			item = scope.$eval(attrs.slingaheadItem)
			
			scope.$watch ->
				return controller.isActive item
			, (active) ->
				if active
					element.addClass 'active'
				else
					element.removeClass 'active'

			element.bind 'mouseenter', (e) ->
				scope.$apply ->
					controller.activate item

			element.bind 'click', (e) ->
				scope.$apply ->
					controller.select item 


                
	}