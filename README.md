<p align="center">
  <a href="https://github.com/Little-Miss-Robot/jsonapi-client">
    <img width="200" src="https://raw.githubusercontent.com/Little-Miss-Robot/jsonapi-client/master/logo.png">
  </a>
</p>

# JSON:API Client
### A lightweight library for seamless JSON API communication, featuring a powerful query builder and intuitive models for effortless data handling.

## Overview

* [Installation](#1-installation)
* [Config](#2-config)
* [Models](#3-models)
  * [Model mapping](#31-model-mapping)
  * [Retrieving model instances](#32-retrieving-model-instances)
  * [Automapping](#33-automapping)
  * [Default macros](#34-default-macros)
  * [Data gating](#35-data-gating)
* [QueryBuilder](#4-querybuilder)
  * [Filtering](#41-filtering)
  * [Sorting](#42-sorting)
  * [Grouping](#43-grouping)
  * [Macros](#44-macros)
  * [Pagination](#45-pagination)
  * [Data gating](#46-data-gating)
  * [Fetching resources](#47-fetching-resources)
* [ResultSet](#5-resultset)
  * [Methods](#51-methods)
  * [Meta data](#52-meta-data)

## 1. Installation

```shell
npm install @littlemissrobot/jsonapi-client
```

## 2. Config
First, set your JSON:API credentials.

```ts
import { Config } from "@littlemissrobot/jsonapi-client";

Config.setAll({
  // The location of JSON:API
  baseUrl: "https://jsonapi.v5tevkp4nowisbi4sic7gv.site",
  
  // The client ID
  clientId: "Hcj7OqJC0KTObYMmMNmVbG3c",
  
  // The client secret
  clientSecret: "Rtqe9lNoXsp9w9blIaVVlEA5",
  
  // Password
  password: "",
  
  // Username
  username: ""
});
```

## 3. Models
Every resource fetched from JSON:API gets mapped to an entity or model. A good way to 
start getting familiar with this package, is by making your first model.

### 3.1 Model mapping
Override the default Model's map-method to provide your 
model with data. In the map-method you'll have a 
generic ResponseModel available that allows for safer object traversal 
through its get-method and various utility functions.
E.g. `responseModel.get('category.title', 'This is a default value')`

#### Example Author model:
```ts
import { Model } from "@littlemissrobot/jsonapi-client";
import type { ResponseModelInterface, DataProperties } from "@littlemissrobot/jsonapi-client";

export class Author extends Model
{
  // Define this model's properties
  id!: string;
  firstName!: string;
  lastName!: string;
  isGilke!: boolean;
  
  // Tell the model how to map from the response data
  async map(responseModel: ResponseModelInterface): Promise<DataProperties<Author>>
  {
    return {
      id: responseModel.get<string>('id', ''),
      firstName: responseModel.get<string>('first_name', ''),
      lastName: responseModel.get<string>('lastName', ''),
      isGilke: responseModel.get<string>('first_name', '') === 'Gilke',
    };
  }
}
```

#### Example BlogPost model:
```ts
export class BlogPost extends Model
{
  // Define the endpoint for this model (not required)
  protected static endpoint: string = 'api/blog_post';
  
  // When defining an endpoint in your Model, you'll have the
  // opportunity to also define which includes to add by default
  protected static include = ['author'];

  // Define this model's properties
  id!: string;
  title!: string;
  author!: Author;
  
  // Tell the model how to map from the response data
  async map(responseModel: ResponseModelInterface): Promise<DataProperties<BlogPost>>
  {
    return {
      id: responseModel.get<string>('id', ''),
      type: responseModel.get<string>('type', ''),
      title: responseModel.get<string>('title', ''),
      author: responseModel.hasOne<Author>('author'),
    };
  }
}
```

#### 3.1.1 Defining relationships

Method | Use case
------ | --------
hasOne | The expected result is 1 instance of a model
hasMany| The expected result is a ResultSet of model instances

In the `map` method in your model:
```ts
return {
  author: responseModel.hasOne<Author>('author'),
  blocks: responseModel.hasMany<Block>('blocks'),
};
```

Both the `hasOne` and `hasMany` methods on ResponseModel take two arguments: first, the property 
on which the data of the relationship can be found. e.g. `responseModel.hasOne('author')`. 
This depends on [Automapping](#automapping). If the type of 'author' (e.g. 'node--author') isn't registered to 
the correct model, the hasOne method will not be able to automatically map it to the right model. In that case you can 
pass a second argument to the method to tell the library to which model you want that specific property to be mapped:
`responseModel.hasOne('author', Author)`. The model passed as second argument will take precedence over automapping.
Read more about [Automapping](#automapping).

### 3.2 Retrieving model instances
Every model provides a static method `query` to retrieve a QueryBuilder 
specifically for fetching instances of this Model.
```ts
const queryBuilder = BlogPost.query();
```
The QueryBuilder provides an easy way to dynamically and programmatically 
build queries. When the QueryBuilder is instantiated through a Model's query-method, 
every result will be an instance of the Model it was called on.
More info on using the QueryBuilder can be found in the section [QueryBuilder](#querybuilder).

### 3.3 Automapping

When you're not creating your query builder from a specific model, or the response 
of your query encounters different types, you can specify how and when the 
query builder resolves these into instances of different models.

First, set a selector which receives the generic response model and a select value and 
returns a boolean which indicates whether we have a match.

Set selector:
```ts
AutoMapper.setSelector((responseModel: ResponseModelInterface, selectValue) => {
  return responseModel.get('type') === selectValue;
});
```

Now, register your select values (in this example drupal node types) with the corresponding model class:
```ts
AutoMapper.register({
  'node--blog-post': BlogPost,
  'node--author': Author,
  'node--blog-category': BlogCategory,
});
```

In this example, when the query builder encounters a resource with any of these types, it will 
automatically resolve it to the corresponding model.

### 3.4 Default macros

The QueryBuilder allows for macros. [More on macros here](#44-macros). 

#### Default macros
The library allows for macros to be executed by default, without explicitly calling the macro on a QueryBuilder instance. This can 
be done by setting the `defaultMacro` property on a model. Whenever the model gets queried, it will now also make sure the macro gets called. 
This can be a good approach when you only want to query published items for example.

```ts
MacroRegistry.registerMacro('published', (qb: QueryBuilder) => {
  qb.where('published', '=', 1);
});
```

```ts
export default class BlogPost extends Model {
  protected static endpoint: string = 'api/blog_post';

  // Set the default macro for this model
  protected static defaultMacro: string = 'published';
}
```

Please note that this macro will only work whenever you query that specific model. That means, whenever the model gets mapped from a query 
of another model (it's encountered as a relationship of another model), it will not be set in effect.

### 3.5 Data gating

You can set a gate directly on a model, everytime the Model gets queried, it will first validate if the result can pass the gate. [More on data gating here](#46-data-gating).

```ts
import { Model } from "@littlemissrobot/jsonapi-client";
import type { ResponseModelInterface, DataProperties } from "@littlemissrobot/jsonapi-client";

export class Author extends Model {
    
  public static gate(responseModel: ResponseModelInterface): boolean {
    return responseModel.get('name', '') === 'Gilke';
  }
}
```

## 4. QueryBuilder
The QueryBuilder provides an easy way to dynamically and programmatically
build queries and provides a safe API to communicate with the JSON:API.

#### Instantiating a new query builder
Although it's more convenient to instantiate your query builder directly from the model, 
it's still possible to create ad-hoc query builders, like so:
```ts
const queryBuilder = new QueryBuilder(new Client(), 'api/my_endpoint', (responseModel) => {
  return {
    id: responseModel.get('id'),
  };
});
```
The default QueryBuilder implementation will also be available by using the built-in Container. It is adviced to use this as construction method 
for your QueryBuilder, this way you always have easy control over your dependencies in your application.
```ts
const queryBuilder = Container.make('QueryBuilderInterface', 'api/my_endpoint', (responseModel) => {
    return responseModel;
});
```

### 4.1 Filtering
Filtering resources is as easy as calling the `where()` method on 
a QueryBuilder instance. This method can be chained.
```ts
BlogPost.query().where('author.name', '=', 'Rein').where('author.age', '>', 34);
```
As with every chaining method on the QueryBuilder, this allows for 
greater flexibility while writing your queries:
```ts
const qb = BlogPost.query().where('author.name', '=', 'Rein');

if (filterByAge) {
  qb.where('age', '>', 34)
}
```
Available operators are:

Operator    | Description
------------|------------
=           | Equal to the given value
<>          | Not equal to the given value
&gt;        | Is greater than the given value
&gt;=       | Is greater than or equal to the given value
&lt;        | Is less than the given value
&lt;=       | Is less than or equal to the given value
STARTS_WITH | Where starts with the given value (string)
CONTAINS    | Where contains the given value (string)
ENDS_WITH   | Where ends with the given value (string)
IN          | Where is in the given values (array)
NOT IN      | Where is not in the given values (array)
BETWEEN     | Where between the given values (array with 2 items)
NOT BETWEEN | Where not between the given values (array with 2 items)
IS NULL     | Where is null (no value given)
IS NOT NULL | Where is not null (no value given)

Some examples:
```ts
qb.where('title', 'IS NULL');
```

```ts
qb.where('title', 'IS NOT NULL');
```

```ts
qb.where('category', 'IN', ['Rondleiding', 'Tentoonstelling', 'Lezing']);
```

```ts
qb.where('name', 'ENDS WITH', 'Van Oyen');
```

For convenience reasons, some of these have an alias method:

```ts
qb.whereIn('category', ['Rondleiding', 'Tentoonstelling', 'Lezing']);
```

```ts
qb.whereNotIn('category', ['Rondleiding', 'Tentoonstelling', 'Lezing']);
```

```ts
qb.whereIsNull('title');
```

```ts
qb.whereIsNotNull('title');
```

### 4.2 Sorting

```ts
BlogPost.query().sort('author.name', 'asc');
```

```ts
BlogPost.query().sort('author.name', 'desc');
```

### 4.3 Grouping
The QueryBuilder provides an easy-to-use (and understand) interface 
for filter-grouping. Possible methods for grouping are `or` & `and`.

OR:
```ts
BlogPost.query().group('or', (qb: QueryBuilder) => {
  qb.where('author.name', '=', 'Rein');
  qb.where('author.name', '=', 'Gilke');
});
```
AND:
```ts
BlogPost.query().group('and', (qb: QueryBuilder) => {
  qb.where('author.name', '=', 'Rein');
  qb.where('age', '>', 34);
});
```
Nested grouping is possible. The underlying library takes care of 
all the complex stuff for you!
```ts
BlogPost.query().group('and', (qb: QueryBuilder) => {
  qb.where('age', '>', 34);
  qb.group('or', (qb: QueryBuilder) => {
    qb.where('author.name', '=', 'Gilke').where('author.name', '=', 'Rein');
  });
});
```

### 4.4 Macros
As parts of your query can become quite long and complicated, it gets 
very cumbersome to retype these again and again. Architecturally 
it's also not the best approach, especially for parts of your query 
that should be reusable (dry).

Because of this, you can abstract away query statements and register 
them as macros, these can then be called on any QueryBuilder instance.

#### Registering macros:
```ts
import { QueryBuilder, MacroRegistry } from "@littlemissrobot/jsonapi-client";

MacroRegistry.registerMacro('filterByAgeAndName', (qb: QueryBuilder, age, names) => {
  qb.group('and', (qb: QueryBuilder) => {
    qb.where('author.age', '>', age);
    qb.group('or', (qb: QueryBuilder) => {
      names.forEach(name => {
        qb.where('author.name', '=', name);
      });
    });
  });
});
```

```ts
MacroRegistry.registerMacro('sortByAuthorAge', (qb: QueryBuilder) => {
  qb.sort('author.age', 'desc');
});
```
#### Macro usage:
```ts
BlogPost.query().macro('filterByAgeAndName', 35, ['Rein', 'Gilke']).macro('sortByAge');
```

### 4.5 Pagination
```ts
BlogPost.query().paginate(1, 10);
```

### 4.6 Data gating

Data gating is the concept of setting prerequisites for data to be considered valid. For the result to end up in the final ResultSet, it must first pass this gate. The gate 
function must return a truthy value for it to be considered passed. In other terms, this is a fancy way of filtering your results.

```ts
Author.query().gate((responseModel) => {
  return responseModel.get('name', '') === 'Gilke';
});
```

In this example the query will only result in authors who have the name "Gilke".

> ⚠️ **Warning**  
> Gate functions do not stack. That means you can only use one gate for a query.

The gate function will be called after fetching and before mapping. The added benefit of using data gating is you can define these on the model itself, so you don't have to call the `gate()` method on
the QueryBuilder each time you want to fetch that resource. [More on defining gates on models here](#35-data-gating).

### 4.7 Fetching resources

On any QueryBuilder instance, you'll have these methods available for fetching 
your resources:

#### get() - Gets all results (paginated) from the query builder
```ts
await BlogPost.query().get();
```

#### find() - Gets one result by its primary key (string or number)
```ts
await BlogPost.query().find('yourid');
```

#### all() - Gets all results, across all pages
```ts
await BlogPost.query().all();
```

#### getRaw() - Gets all results from the query builder but doesn't map the results
```ts
await BlogPost.query().getRaw();
```

## 5. ResultSet
### 5.1 Methods
push, pop, map, forEach, filter, find, reduce, serialize

The ResultSet tries to mimic an array, basic array methods are included. Whenever you want to transform
your ResultSet to primitives (an array of plain objects), you can always call the `serialize` method:

```ts
const primitiveBlogPosts = BlogPost.query().get().serialize();
```

### 5.2 Meta data
How to access meta data of a ResultSet?
```ts
const resultSet = BlogPost.query().get();
const { query, count, performance } = resultSet.meta;
```

Property | Type | Description
-------- | ---- | -----------
query | { url: string, params: TQueryParams} | Holds information about the executed query
performance | { query: number; mapping: number; } | Has benchmarks (duration in ms) for every part of the execution process
count | number | The amount of resulting resources (not taking into account the pagination)
pages | number | The amount of pages
perPage | number | The amount of resources per page

## Todo
* Improved error reporting
* events
  * on specific models (model fetched, relationship loaded, model mapped, ...)
  * query execution (query executed, query failed, ...)
* Debug-mode (Logging requests, auth logging, LoggerInterface (?))
* Nice to have: real lazy relationship fetching (vs includes)
* meta when receiving model instance vs ResultSet?
* Serialize by default option? Also include meta when serializing the ResultSet

## Credits & attribution
<a href="https://www.flaticon.com/free-icons/bee-farming" title="bee farming icons">Bee farming icons created by SBTS2018 - Flaticon</a>
