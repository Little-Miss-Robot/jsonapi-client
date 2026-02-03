import query from "../src/facades/query";
import { on } from "../src/facades/events";
import { JsonApi } from "../src/index";
import EventBus from "../src/EventBus";

JsonApi.init({
    baseUrl: "",
    clientId: "",
    clientSecret: ""
});

//on('paramAdded', e => console.log('paramAdded', e));
on('preFetch', e => console.log('preFetch'));
//on('postFetch', e => console.log('postFetch', e));
//on('preFind', e => console.log('preFind', e));
//on('postFind', e => console.log('postFind', e));

const eventBus = new EventBus();

eventBus.on('paramAdded', (e) => {
    //console.log(e.);
});

const data = await query('api/project')
    .setLocale('en')
    .include(['hero'])
    .where('status', '=', '1')
    .get();

console.log(data);

const data2 = await query('api/project')
    .setLocale('en')
    .include(['hero'])
    .where('status', '=', '1')
    .get();

console.log(data2);

const data3 = await query('api/project')
    .setLocale('en')
    .include(['hero'])
    .where('status', '=', '1')
    .get();

console.log(data3);

const data4 = await query('api/project')
    .setLocale('en')
    .include(['hero'])
    .where('status', '=', '1')
    .get();

console.log(data4);

const data5 = await query('api/project')
    .setLocale('en')
    .include(['hero'])
    .where('status', '=', '1')
    .get();

console.log(data5);

const data6 = await query('api/project')
    .setLocale('en')
    .include(['hero'])
    .where('status', '=', '1')
    .get();

console.log(data6);