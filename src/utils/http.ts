export const makeQueryParams = (params: Record<string, string | number>) => {
	const str = [];
	for (let param in params) {
		if (params.hasOwnProperty(param)) {
			str.push(encodeURIComponent(param) + '=' + params[param]);
		}
	}
	return str.join('&');
};