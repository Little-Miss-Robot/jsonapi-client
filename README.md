## JSON:API Client

### Installation
* Not yet, this software is in development

### Todo / ideas / roadmap
#### General
* Improved error reporting
* Debug-mode (Logging requests, auth logging, LoggerInterface (?))
* Nice to have: separate Auth and Client
#### AutoMapper
* Types = mappers = models
  * Shadow fields / dynamic fields
  * Nice to have: ORM with real time relationship fetching
#### QueryBuilder
  * Grouping: OR | AND
  * Rename "filter" methods to "where" to follow query language paradigm
```js
qb.group('OR', (query) => {
  query.where('name', '=', 'Rein');
  query.where('name', '=', 'Gilke');
});
```
  * Macros
```js
qb.registerMacro('filterByName', (names) => {
  qb.group('OR', (query) => {
    names.forEach(name => {
      query.where('name', '=', name);
    });
  });
});
```
```js
qb.macro('filterByName', ['Rein', 'Gilke']);
```