import Model from "../src/Model";

// Example usage
class User extends Model {

	public id: number;
	public name: string;
	public email: string;

	protected map(response: any) {
		return {
			id: response.user.id,
			name: response.user.first_name,
			email: 'reinvanoyen@gmail.com',
		};
	}

	// Additional method specific to UserModel
	public greet(): string {
		return `Hello, ${this.name}!`;
	}
}

const response = {
	user: {
		id: 1,
		first_name: 'Rein',
		last_name: 'Van Oyen',
	},
};

function sayHi(user: User) {
	console.log(user.greet());
}

sayHi(new User(response));