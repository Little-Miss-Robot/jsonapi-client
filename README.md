# JSON:API Client

## Todo
* Improved error reporting
* Debug-mode (Logging requests, auth logging, LoggerInterface (?))
* Nice to have: ORM with real lazy relationship fetching (vs includes)
* Nice to have: separate Auth and Client

## Installation
* Not yet, this software is in development

## Getting started

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
through its get-method. E.g. `responseModel.get('category.title', 'This is a default title')`

```ts
import Model from "../src/Model";
import {ResponseModelInterface} from "../src/contracts/ResponseModelInterface";

export class BlogCategory extends Model
{
  // Define this model's properties
  id: string;
  title: string;
    
  // Tell the model how to map from the response data
  async map(responseModel: ResponseModelInterface)
  {
    return {
      id: responseModel.get('id', ''),
      type: responseModel.get('type', ''),
    };
  }
}

export class BlogPost extends Model
{
  // Define the endpoint for this model (not required)
  protected static endpoint: string = 'api/blog_post';
  
  // When defining an endpoint in your Model, you'll have the
  // opportunity to also define which includes to add by default
  protected static include = ['category'];

  // Define this model's properties
  id: string;
  title: string;
  category: BlogCategory;
  
  // Tell the model how to map from the response data
  async map(responseModel: ResponseModelInterface)
  {
    return {
      id: responseModel.get('id', ''),
      type: responseModel.get('type', ''),
      title: responseModel.get('title', ''),
      category: responseModel.map('category'),
    };
  }
}
```

#### QueryBuilder

```ts
import QueryBuilder from "./QueryBuilder";

qb.group('or', (query: QueryBuilder) => {
  query.where('name', '=', 'Rein');
  query.where('name', '=', 'Gilke');
});
```
  * Macros
```ts
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