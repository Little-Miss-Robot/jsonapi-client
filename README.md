<p align="center">
  <a href="https://github.com/Little-Miss-Robot/jsonapi-client">
    <img width="200" src="https://raw.githubusercontent.com/Little-Miss-Robot/jsonapi-client/master/logo.png">
  </a>
</p>

# JSON:API Client
### A lightweight library for seamless JSON API communication, featuring a powerful query builder and intuitive models for effortless data handling.

## Overview

* [Installation](#1-installation)
* [Initialization](#2-initialization)
* [Events](#3-events)
* [Models](#4-models)
  * [Model mapping](#41-model-mapping)
  * [Retrieving model instances](#42-retrieving-model-instances)
  * [Automapping](#43-automapping)
  * [Default macros](#44-default-macros)
  * [Data gating](#45-data-gating)
* [QueryBuilder](#5-querybuilder)
  * [Filtering](#51-filtering)
  * [Sorting](#52-sorting)
  * [Grouping](#53-grouping)
  * [Macros](#54-macros)
  * [Pagination](#55-pagination)
  * [Data gating](#56-data-gating)
  * [Fetching resources](#57-fetching-resources)
  * [Locale, HTTP cache, and all batch size](#58-locale-http-cache-and-all-batch-size)
* [ResultSet](#6-resultset)
  * [Methods](#61-methods)
  * [Meta data](#62-meta-data)

## 1. Installation

```shell
npm install @littlemissrobot/jsonapi-client
```

The package is **ESM-first** (`import`); Node can also load it via CommonJS (`require`) using the conditional `exports` entry in `package.json`.

## 2. Initialization

Call **`JsonApi.init`** once at startup with your JSON:API credentials and optional 
tuning. This registers the internal service container (`config`, `client`, `auth`, `events`, `macros`, 
`fetch policy`, and the `query` factory used by models).

```ts
import { JsonApi } from "@littlemissrobot/jsonapi-client";

JsonApi.init({
  baseUrl: process.env.API_URL!,
  clientId: process.env.API_CLIENT_ID!,
  clientSecret: process.env.API_CLIENT_SECRET!,

  // Optional — defaults below are merged for you when omitted:
  tokenExpirySafetyWindow: 60000, // ms before token expiry to refresh proactively (default: 60000)
  retryDelay: 1000,               // ms between retries (default: 1000)
  maxRetries: 3,                  // amount of retries to attempt, 0 disables retries (default: 2)
});
```

After initialization you can read values through the **`config()`** facade when needed (for example in custom wiring).

## 3. Events

The library emits lifecycle events through an **`EventBus`**. Access it with **`events()`**, or 
use **`on(event, listener)`** / **`off(listenerId)`** from the package root.

| Event | Payload | Description |
| ----- | ------- | ----------- |
| `paramAdded` | `{ queryBuilder, name, value }` | A query parameter was added |
| `preFetch` | `{ method, path, ... }` plus `url` | Before an HTTP request |
| `postFetch` | Same shape as `preFetch` | After an HTTP response |
| `retry` | `{ request, attempt }` | A failed request is being retried |
| `preFind` | `{ queryBuilder, uuid }` | Before resolving a resource by id |
| `postFind` | `{ queryBuilder, uuid, result }` | After resolving by id |
| `generatingAuthToken` | `null` | OAuth token refresh starting |
| `authTokenGenerated` | `{ token, expiryTime }` | New token obtained |



## 4. Models
Every resource fetched from JSON:API gets mapped to an entity or model. A good way to 
start getting familiar with this package, is by making your first model.

### 4.1 Model mapping
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
      id: responseModel.get('id', ''),
      firstName: responseModel.get('first_name', ''),
      lastName: responseModel.get('lastName', ''),
      isGilke: responseModel.get('first_name', '') === 'Gilke',
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
      id: responseModel.get('id', ''),
      type: responseModel.get('type', ''),
      title: responseModel.get('title', ''),
      author: await responseModel.hasOne<Author>('author'),
    };
  }
}
```

#### 4.1.1 Defining relationships

Method | Use case
------ | --------
hasOne | The expected result is 1 instance of a model
hasMany| The expected result is an array of model instances

In the `map` method in your model, **`hasOne` and `hasMany` return promises** — await them:

```ts
return {
  author: await responseModel.hasOne<Author>('author'),
  blocks: await responseModel.hasMany<Block>('blocks'),
};
```

Both the `hasOne` and `hasMany` methods on ResponseModel take two arguments: first, the property 
on which the data of the relationship can be found. e.g. `await responseModel.hasOne('author')`. 
This depends on [Automapping](#43-automapping). If the type of 'author' (e.g. 'node--author') isn't registered to 
the correct model, the hasOne method will not be able to automatically map it to the right model. In that case you can 
pass a second argument to the method to tell the library to which model you want that specific property to be mapped:
`await responseModel.hasOne('author', Author)`. The model passed as second argument will take precedence over automapping.
Read more about [Automapping](#43-automapping).

### 4.2 Retrieving model instances
Every model provides a static method `query` to retrieve a QueryBuilder 
specifically for fetching instances of this Model.
```ts
const queryBuilder = BlogPost.query();
```
The QueryBuilder provides an easy way to dynamically and programmatically 
build queries. When the QueryBuilder is instantiated through a Model's query-method, 
every result will be an instance of the Model it was called on.
More info on using the QueryBuilder can be found in the section [QueryBuilder](#5-querybuilder).

### 4.3 Automapping

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

### 4.4 Default macros

The QueryBuilder allows for macros. [More on macros here](#54-macros). 

#### Default macros
The library allows for macros to be executed by default, without explicitly calling the macro on a QueryBuilder instance. This can 
be done by setting the `defaultMacro` property on a model. Whenever the model gets queried, it will now also make sure the macro gets called. 
This can be a good approach when you only want to query published items for example.

Register macros after **`JsonApi.init`** using the **`macros()`** facade (the same registry the container uses):

```ts
import { macros, QueryBuilder } from "@littlemissrobot/jsonapi-client";

macros().register('published', (qb: QueryBuilder) => {
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

### 4.5 Data gating

You can set a gate directly on a model, everytime the Model gets queried, it will first validate if the result can pass the gate. [More on data gating here](#56-data-gating).

```ts
import { Model } from "@littlemissrobot/jsonapi-client";
import type { ResponseModelInterface, DataProperties } from "@littlemissrobot/jsonapi-client";

export class Author extends Model {
    
  public static gate(responseModel: ResponseModelInterface): boolean {
    return responseModel.get('name', '') === 'Gilke';
  }
}
```

## 5. QueryBuilder
The QueryBuilder provides an easy way to dynamically and programmatically
build queries and provides a safe API to communicate with the JSON:API.

#### Instantiating a new query builder
Although it's more convenient to instantiate your query builder directly from the model, 
it's still possible to create ad-hoc query builders after **`JsonApi.init`**.

Recommended — use the **`query()`** facade (same factory `Model.query` uses internally):

```ts
import { query } from "@littlemissrobot/jsonapi-client";

const queryBuilder = query('api/my_endpoint', (responseModel) => {
  return {
    id: responseModel.get('id'),
  };
});
```

Alternatively, construct **`QueryBuilder`** explicitly with client, event bus, and macro registry:

```ts
import { QueryBuilder, client, events, macros } from "@littlemissrobot/jsonapi-client";

const queryBuilder = new QueryBuilder(client(), events(), macros(), 'api/my_endpoint', (responseModel) => {
  return {
    id: responseModel.get('id'),
  };
});
```

You can also resolve the query binding from the container:

```ts
import { container } from "@littlemissrobot/jsonapi-client";

const queryBuilder = container().make('query', 'api/my_endpoint', (responseModel) => {
    return responseModel;
});
```

### 5.1 Filtering
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
qb.where('name', 'ENDS_WITH', 'Van Oyen');
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

### 5.2 Sorting

```ts
BlogPost.query().sort('author.name', 'asc');
```

```ts
BlogPost.query().sort('author.name', 'desc');
```

### 5.3 Grouping
The QueryBuilder provides an easy-to-use interface 
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

### 5.4 Macros
As parts of your query can become quite long and complicated, it gets 
very cumbersome to retype these again and again. Architecturally 
it's also not the best approach, especially for parts of your query 
that should be reusable (dry) on other queries.

Because of this, you can abstract away query statements and register 
them as macros, these can then be called on any QueryBuilder instance.

#### Registering macros:
```ts
import { QueryBuilder, macros } from "@littlemissrobot/jsonapi-client";

macros().register('filterByAgeAndName', (qb: QueryBuilder, age, names) => {
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
macros().register('sortByAuthorAge', (qb: QueryBuilder) => {
  qb.sort('author.age', 'desc');
});
```
#### Macro usage:
```ts
BlogPost.query().macro('filterByAgeAndName', 35, ['Rein', 'Gilke']).macro('sortByAuthorAge');
```

### 5.5 Pagination
```ts
BlogPost.query().paginate(1, 10);
```

### 5.6 Data gating

Data gating is the concept of setting prerequisites for data to be considered valid. For the result to end up in the final ResultSet, it must first pass this gate. The gate 
function must return a truthy value for it to be considered passed. In other terms, this is a fancy way of filtering your results.

```ts
const gilkes = await Author.query()
  .gate((responseModel) => {
    return responseModel.get('name', '') === 'Gilke';
  })
  .get();
```

In this example the query will only result in authors who have the name "Gilke".

> ⚠️ **Warning**  
> Gate functions do not stack. That means you can only use one gate for a query.

The gate function will be called after fetching and before mapping. The added benefit of using data gating is you can define these 
on the model itself, so you don't have to call the `gate()` method on the QueryBuilder each time you want to fetch that 
resource. [More on defining gates on models here](#45-data-gating).

### 5.7 Fetching resources

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

Optional **`batchSize`** (default `50`) controls how many items are requested per page when walking all pages:
```ts
await BlogPost.query().all(25); // Uses a batchSize of 25
```

#### getRaw() - Gets all results from the query builder but doesn't map the results
```ts
await BlogPost.query().getRaw();
```

### 5.8 Locale, HTTP cache, and all batch size

```ts
await BlogPost.query().setLocale('en').include(['hero']).where('status', '=', '1').all();
```

```ts
await BlogPost.query().noCache().get();
```

```ts
// Fetch everything in smaller page sizes when the API supports it
await BlogPost.query().all(25);
```

## 6. ResultSet
### 6.1 Methods
push, pop, map, forEach, filter, find, reduce, serialize, sort, toArray, concat

The ResultSet tries to mimic an array; basic array methods are included. Whenever you want to transform
your ResultSet to primitives (an array of plain objects), call **`serialize()`** on the **`ResultSet`** instance after **`await`**ing **`get()`** (or another fetch):

```ts
const resultSet = await BlogPost.query().get();
const primitiveBlogPosts = resultSet.serialize();
```

### 6.2 Meta data
How to access meta data of a ResultSet?
```ts
const resultSet = await BlogPost.query().get();
const { query, count, performance, excludedByGate } = resultSet.meta!;
```

Property | Type | Description
-------- | ---- | -----------
query | { url: string, params: TQueryParams} | Holds information about the executed query
performance | { query: number; mapping: number; } | Has benchmarks (duration in ms) for every part of the execution process
count | number | The amount of resulting resources (not taking into account the pagination)
pages | number | The amount of pages
perPage | number | The amount of resources per page
excludedByGate | number | Count of resources removed because they failed the active gate

## Roadmap

* Debug-mode (logging requests, auth logging, optional logger abstraction)
* Meta shape when receiving a single model instance versus a ResultSet
* Serialize-by-default options; optional inclusion of meta when serializing a ResultSet

## Credits & attribution
<a href="https://www.flaticon.com/free-icons/bee-farming" title="bee farming icons">Bee farming icons created by SBTS2018 - Flaticon</a>
