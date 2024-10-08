# JSON:API Client

## Installation
* Not yet, this software is in development

## Usage

### Config
First, set your JSON:API credentials.

```ts
import Config from "../src/Config";

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

### Models
Every resource fetched from JSON:API gets mapped to an entity or model. A good way to 
start getting familiar with this package, is by making your first model.

#### Model mapping 
Override the default Model's map-method to provide your 
model with data. In the map-method you'll have a 
generic ResponseModel available that allows for safer object traversal 
through its get-method and various utility functions.
E.g. `responseModel.get('category.title', 'This is a default title')`

Example Author model:
```ts
import Model from "../src/Model";
import {ResponseModelInterface} from "../src/contracts/ResponseModelInterface";

export class Author extends Model
{
  // Define this model's properties
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isGilke: boolean;
  
  // Tell the model how to map from the response data
  async map(responseModel: ResponseModelInterface)
  {
    return {
      id: responseModel.get('id', ''),
      firstName: responseModel.get('first_name', ''),
      lastName: responseModel.get('lastName', ''),
      fullName: responseModel.join(' ', 'firstName', 'lastName'),
      isGilke: responseModel.custom('firstName', value => value === 'Gilke'),
    };
  }
}
```

Example BlogPost model:
```ts
export class BlogPost extends Model
{
  // Define the endpoint for this model (not required)
  protected static endpoint: string = 'api/blog_post';
  
  // When defining an endpoint in your Model, you'll have the
  // opportunity to also define which includes to add by default
  protected static include = ['author'];

  // Define this model's properties
  id: string;
  title: string;
  author: Author;
  
  // Tell the model how to map from the response data
  async map(responseModel: ResponseModelInterface)
  {
    return {
      id: responseModel.get('id', ''),
      type: responseModel.get('type', ''),
      title: responseModel.get('title', ''),
      author: responseModel.map('author'),
    };
  }
}
```

#### Retrieving model instances
Every model provides a static method `query` to retrieve a QueryBuilder 
specifically for fetching instances of this Model.
```ts
const queryBuilder = BlogPost.query<BlogPost>();
```
The QueryBuilder provides an easy way to dynamically and programmatically 
build queries. When the QueryBuilder is instantiated through a specific
Model's query-method, every result will be an instance of that specific Model.
For more info on using the QueryBuilder can be found in the section [QueryBuilder](#querybuilder).

#### Automapping

Set selector
```ts
AutoMapper.setSelector((responseModel: ResponseModelInterface, selectValue) => {
  return responseModel.get('type') === selectValue;
});
```

Register your models
```ts
AutoMapper.register({
  'node--blog-post': BlogPost,
  'node--author': Author,
  'node--blog-category': BlogCategory,
});
```

### QueryBuilder
The QueryBuilder provides an easy way to dynamically and programmatically
build queries and provides a safe API to communicate with the JSON:API.

#### Filtering
Filtering resources is as easy as calling the `where()` method on 
a QueryBuilder instance. This method can be chained.
```ts
qb.where('author.name', '=', 'Rein').where('author.age', '>', 34);
```
As with every chaining method on the QueryBuilder, this allows for 
greater flexibility while writing your queries:
```ts
qb.where('author.name', '=', 'Rein');

if (filterByAge) {
  qb.where('age', '>', 34)
}
```

#### Sorting

```ts
qb.sort('author.name', '=', 'Rein');
```

#### Grouping
The QueryBuilder provides an easy-to-use (and understand) interface 
for filter-grouping. Possible methods for grouping are `or` & `and`.

OR:
```ts
qb.group('or', (qb: QueryBuilder) => {
  qb.where('author.name', '=', 'Rein');
  qb.where('author.name', '=', 'Gilke');
});
```
AND:
```ts
qb.group('and', (qb: QueryBuilder) => {
  qb.where('author.name', '=', 'Rein');
  qb.where('age', '>', 34);
});
```
Nested grouping is possible. The underlying library takes care of 
all the complex stuff for you!
```ts
qb.group('and', (qb: QueryBuilder) => {
  qb.where('age', '>', 34);
  qb.group('or', (qb: QueryBuilder) => {
    qb.where('author.name', '=', 'Gilke').where('author.name', '=', 'Rein');
  });
});
```

#### Taking it a step further: macros
As parts of your query can become quite long and complicated, it gets 
very cumbersome to retype these again and again. Architecturally 
it's also not the best approach, especially for parts of your query 
that should be reusable (dry).

Because of this, you can abstract away query statements and register 
them as macros, these can then be called on any QueryBuilder instance.

Registering macros:

```ts
import QueryBuilder from "./QueryBuilder";
import MacroRegistry from "./MacroRegistry";

MacroRegistry.registerMacro('filterByName', (qb: QueryBuilder, age, names) => {
  qb.group('and', (qb: QueryBuilder) => {
    qb.where('age', '>', age);
    qb.group('or', (qb: QueryBuilder) => {
      names.forEach(name => {
        qb.where('author.name', '=', name);
      });
    });
  });
});
```

```ts
MacroRegistry.registerMacro('sortByAge', (qb: QueryBuilder) => {
  qb.sort('age', 'desc');
});
```
Macro usage:
```js
qb.macro('filterByName', 35, ['Rein', 'Gilke']).macro('sortByAge');
```

## Todo
* Improved error reporting
* Debug-mode (Logging requests, auth logging, LoggerInterface (?))
* Nice to have: real lazy relationship fetching (vs includes)
* Nice to have: separate Auth and Client