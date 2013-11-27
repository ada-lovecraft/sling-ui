angular.module('sling.ui.templates')
.run([ '$templateCache', function($templateCache) {
  return $templateCache.put('/sling.ui/templates/sling-pager.html', [
'',
'<div ng-show="pager.showPager()" class="sling-pager">',
'  <ul class="pager">',
'    <li class="previous disabled"><a ng-click="pager.previousPage()" class="sling-interactable">&larr; Previous</a></li>',
'    <li class="next disabled"> <a ng-click="pager.nextPage()" class="sling-interactable">&rarr; Next</a></li>',
'  </ul>',
'</div>',''].join("\n"));
}])
.run([ '$templateCache', function($templateCache) {
  return $templateCache.put('/sling.ui/templates/sling-ahead.html', [
'',
'<div class="sling-ahead">',
'  <form>',
'    <input type="text" ng-model="term" autocomplete="off" ng-change="query()" placeholder="{{placeholder}}" class="form-control">',
'  </form>',
'  <div ng-transclude></div>',
'</div>',''].join("\n"));
}])
.run([ '$templateCache', function($templateCache) {
  return $templateCache.put('/sling.ui/templates/sling-pagination.html', [
'',
'<div ng-show="pager.showPager()" class="sling-pagination">',
'  <ul class="pagination">',
'    <li ng-click="currentPage = 1" ng-class="{disabled: currentPage == 1}" class="sling-interactable"> <a>{{firstPageLabel}}</a></li>',
'    <li ng-click="currentPage = currentPage - 1" ng-class="{disabled: currentPage == 1}" class="sling-interactable"> <a>&laquo;</a></li>',
'    <li ng-repeat="page in pages track by $index" sling-page target-page="page" class="sling-interactable"></li>',
'    <li ng-click="currentPage = currentPage + 1" ng-class="{disabled: currentPage == totalPages}" class="sling-interactable"> <a>&raquo;</a></li>',
'    <li ng-click="currentPage = totalPages" ng-class="{disabled: currentPage == totalPages}" class="sling-interactable"><a>{{lastPageLabel}}</a></li>',
'  </ul>',
'</div>',''].join("\n"));
}])
.run([ '$templateCache', function($templateCache) {
  return $templateCache.put('/sling.ui/templates/sling-search.html', [
'',
'<div ng-show="tableSearch" class="sling-search">',
'  <form class="form-inline">',
'    <div class="input-group"><span class="input-group-addon">',
'        <div class="glyphicon glyphicon-search"></div></span>',
'      <input type="search" ng-keyup="search()" ng-model="slingSearch" placeholder="Search Table..." class="form-control sling-table-search">',
'    </div>',
'  </form>',
'</div>',''].join("\n"));
}])
.run([ '$templateCache', function($templateCache) {
  return $templateCache.put('/sling.ui/templates/sling-table.html', [
'',
'<div class="sling-table">',
'  <div ng-show="pager.showPager()" class="sling-pager">',
'    <ul class="pager">',
'      <li class="previous disabled"><a ng-click="pager.previousPage()" class="sling-interactable">&larr; Previous</a></li>',
'      <li class="next disabled"> <a ng-click="pager.nextPage()" class="sling-interactable">&rarr; Next</a></li>',
'    </ul>',
'  </div>',
'  <div ng-show="tableSearch" class="sling-search">',
'    <form class="form-inline">',
'      <div class="input-group"><span class="input-group-addon">',
'          <div class="glyphicon glyphicon-search"></div></span>',
'        <input type="search" ng-keyup="search()" ng-model="slingSearch" placeholder="Search Table..." class="form-control sling-table-search">',
'      </div>',
'    </form>',
'  </div>',
'  <table ng-class="tableClass" class="table">',
'    <thead>',
'      <tr>',
'        <th ng-repeat="column in tableConfig.order" ng-click="switchColumn(column)" ng-class="getSortedClass(column)" class="{{tableConfig.display[column].className}} sling-interactable">{{tableConfig.display[column].label}}<span ng-show="sort.column == column">',
'            <div ng-hide="sort.descending" class="glyphicon glyphicon-chevron-up"></div>',
'            <div ng-show="sort.descending" class="glyphicon glyphicon-chevron-down"></div></span></th>',
'      </tr>',
'    </thead>',
'    <tbody>',
'      <tr ng-repeat="data in pagedData">',
'        <td ng-repeat="column in tableConfig.order" ng-class="getSortedClass(column)" ng-bind-html="data[column]"></td>',
'      </tr>',
'    </tbody>',
'  </table>',
'</div>',''].join("\n"));
}]);
