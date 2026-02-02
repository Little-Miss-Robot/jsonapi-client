import query from "../src/facades/query";
import { on } from "../src/facades/events";
import { JsonApi } from "../src/index";

JsonApi.init({
    baseUrl: "",
    clientId: "",
    clientSecret: ""
});

on('paramAdded', e => console.log(e));
on('preFetch', e => console.log(e));
on('postFetch', e => console.log(e));

const data = await query('api/landing_page').param('jsonapi_auto_include', 1).get();

console.log(data);