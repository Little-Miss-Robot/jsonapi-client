import { ResponseModel, AutoMapper, Model } from '../src/index';

class Page extends Model {}

class Event extends Model {}

function initAutoMapper() {
	AutoMapper.register({
		'page': Page,
		'event': Event
	});

	AutoMapper.setSelector((responseModel, selectValue) => {
		return (responseModel.get('type') === selectValue);
	});
}

it('automaps to the correct model instances', async () => {

	initAutoMapper();

	const event = await AutoMapper.map(new ResponseModel({
		type: 'event',
		title: 'This is an event'
	}));

	const page = await AutoMapper.map(new ResponseModel({
		type: 'page',
		title: 'This is a page'
	}));

	expect(event).toBeInstanceOf(Event);
	expect(page).toBeInstanceOf(Page);
});

it('gives back the unaltered ResponseModel when it can\'t select an instance', async () => {

	initAutoMapper();

	const unknown = await AutoMapper.map(new ResponseModel({
		type: 'unknown',
		title: 'This is an unknown entity'
	}));

	// Test for the instance type
	expect(unknown).toBeInstanceOf(ResponseModel);

	// Test if all data is still untouched
	expect(unknown.get('type')).toBe('unknown');
	expect(unknown.get('title')).toBe('This is an unknown entity');
});