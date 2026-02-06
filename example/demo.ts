import EventBus from '../src/EventBus';
import { on } from '../src/facades/events';
import query from '../src/facades/query';
import { JsonApi } from '../src/index';

JsonApi.init({
    baseUrl: '',
    clientId: '',
    clientSecret: '',
});

// on('paramAdded', e => console.log('paramAdded', e));
on('preFetch', _e => console.log('preFetch'));
// on('postFetch', e => console.log('postFetch', e));
// on('preFind', e => console.log('preFind', e));
// on('postFind', e => console.log('postFind', e));

const eventBus = new EventBus();

eventBus.on('paramAdded', (_e) => {
    // console.log(e.);
});

on('authTokenGenerated', (e) => {
    console.log(e);
});

const data = await query('api/detail-page')
    .setLocale('en')
    .where('status', '=', '1')
    .all();

console.log(data);

const _data2 = await query('api/detail-page')
    .setLocale('en')
    .where('status', '=', '1')
    .get();

const _data3 = await query('api/detail-page')
    .setLocale('en')
    .where('status', '=', '1')
    .get();

const _data4 = await query('api/detail-page')
    .setLocale('en')
    .where('status', '=', '1')
    .get();

const _data5 = await query('api/detail-page')
    .setLocale('en')
    .where('status', '=', '1')
    .get();

const _data6 = await query('api/detail-page')
    .setLocale('en')
    .where('status', '=', '1')
    .get();

console.log(_data6);
