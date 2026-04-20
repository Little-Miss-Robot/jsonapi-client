import * as process from 'node:process';
import { client, events, JsonApi } from '../src/index';
import NewsArticle from './NewsArticle';

JsonApi.init({
    baseUrl: process.env.API_URL,
    clientId: process.env.API_CLIENT_ID,
    clientSecret: process.env.API_CLIENT_SECRET,
    retryDelay: 1000,
    maxRetries: 3,
});

events().on('retry', (e) => {
    console.log('-> RETRYING', e);
});

events().on('generatingAuthToken', () => {
    console.log('-> GENERATING TOKEN!');
});

const newsArticles = await NewsArticle.query().get();
console.log(newsArticles);

const response = await client().get(`api/webform/blabla`, {});
console.log(response);

/*
const data = await query('api/project')
    .setLocale('en')
    .include(['hero'])
    .where('status', '=', '1')
    .all();

console.log(data);
 */

/*
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
*/
