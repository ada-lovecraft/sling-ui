angular.module('sling.ui.templates')
.run([ '$templateCache', function($templateCache) {
  return $templateCache.put('/sling.ui/templates/sling-table.html', [
'',
'<div ng-show="tablePager">',
'  <ul class="pager">',
'    <li class="previous disabled"><a ng-click="previousPage()" class="sling-interactable">&larr; Previous</a></li>',
'    <li class="next"> <a ng-click="nextPage()" class="sling-interactable">&rarr; Next</a></li>',
'  </ul>',
'</div>',
'<table class="table">',
'  <thead>',
'    <tr>',
'      <th ng-repeat="column in tableConfig.order" ng-click="switchColumn(column)" ng-class="getSortedClass(column)" class="{{tableConfig.display[column].className}} sling-interactable">{{tableConfig.display[column].label}}<span ng-show="sort.column == column">',
'          <div ng-hide="sort.descending" class="glyphicon glyphicon-chevron-up"></div>',
'          <div ng-show="sort.descending" class="glyphicon glyphicon-chevron-down"></div></span></th>',
'    </tr>',
'  </thead>',
'  <tbody>',
'    <tr ng-repeat="data in pagedData">',
'      <td ng-repeat="column in tableConfig.order" ng-class="getSortedClass(column)">{{ data[column] }}</td>',
'    </tr>',
'  </tbody>',
'</table>',''].join("\n"));
}]);
