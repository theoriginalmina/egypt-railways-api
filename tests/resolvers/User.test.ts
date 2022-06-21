import "reflect-metadata";
import { DataSource } from "typeorm";
import { AppDataSourceTest } from "../utils/data-source-test";
import { grahpqlTestCall } from "../utils/graphqlTestCall";

const registerMutation = `
    mutation($password: String!, $email: String!) {
        register(password: $password, email: $email) {
        errors {
            field
            message
        }
        registered
        }
    }
`;

const loginMutation = `
    mutation($password: String!, $email: String!) {
        login(password: $password, email: $email) {
        errors {
            field
            message
        }
        user {
            id
            email
        }
        }
    }
`;

const connection: DataSource = AppDataSourceTest;

beforeAll(async () => {
	await connection.initialize();
});

afterAll(async () => {
	await connection.destroy();
});

describe("Register", () => {
	it("Should return error when empty email is passed", async () => {
		const testUser = {
			email: "",
			password: "",
		};

		const registerResponse = await grahpqlTestCall(registerMutation, testUser);

		expect(registerResponse.data?.register).toEqual({
			errors: {
				field: "email",
				message: "Email can't be empty",
			},
			registered: false,
		});
	});

	it("Should return error when empty password is passed", async () => {
		const testUser = {
			email: "test@test.com",
			password: "",
		};

		const registerResponse = await grahpqlTestCall(registerMutation, testUser);

		expect(registerResponse.data?.register).toEqual({
			errors: {
				field: "password",
				message: "Password can't be empty",
			},
			registered: false,
		});
	});

	it("Should return error when invalid email is passed", async () => {
		const testUser = {
			email: "test@test",
			password: "12345",
		};

		const registerRespone = await grahpqlTestCall(registerMutation, testUser);

		expect(registerRespone.data?.register).toEqual({
			errors: {
				field: "email",
				message: "Invalid Email",
			},
			registered: false,
		});
	});

	it("Should return error when short password is passed", async () => {
		const testUser = {
			email: "test@test.com",
			password: "123",
		};

		const registerRespone = await grahpqlTestCall(registerMutation, testUser);

		expect(registerRespone.data?.register).toEqual({
			errors: {
				field: "password",
				message: "Short password",
			},
			registered: false,
		});
	});

	it("Should return true when valid data are passed", async () => {
		const testUser = {
			email: "test@test.com",
			password: "12345678",
		};

		const registerRespone = await grahpqlTestCall(registerMutation, testUser);

		expect(registerRespone.data?.register).toEqual({
			errors: null,
			registered: true,
		});
	});

	it("Should return error when password stored is not hashed", async () => {
		// Query will return random password everytime
		const query = "SELECT password FROM users ORDER BY RANDOM() LIMIT 1";

		const password = await connection.query(query);

		const valid =
			password[0].password.length === 95 &&
			password[0].password.match(/^\$argon/);

		expect(valid).toBeTruthy();
	});

	it("Should return error when the email is already existed", async () => {
		const testUser = {
			email: "test@test.com",
			password: "12345678",
		};

		const registerRespone = await grahpqlTestCall(registerMutation, testUser);

		expect(registerRespone.data?.register).toEqual({
			errors: {
				field: "email",
				message: "Email Already Exist",
			},
			registered: false,
		});
	});
});

describe("Login", () => {
	it("Should return error when empty email is passed", async () => {
		const testUser = {
			email: "",
			password: "",
		};

		const loginResponse = await grahpqlTestCall(registerMutation, testUser);

		expect(loginResponse.data?.register).toEqual({
			errors: {
				field: "email",
				message: "Email can't be empty",
			},
			registered: false,
		});
	});

	it("Should return error when empty password is passed", async () => {
		const testUser = {
			email: "test@test.com",
			password: "",
		};

		const loginResponse = await grahpqlTestCall(registerMutation, testUser);

		expect(loginResponse.data?.register).toEqual({
			errors: {
				field: "password",
				message: "Password can't be empty",
			},
			registered: false,
		});
	});

	it("Should return error when wrong email is passed", async () => {
		const testUser = {
			email: "notregisterd@test.com",
			password: "123456",
		};

		const { data } = await grahpqlTestCall(loginMutation, testUser);

		expect(data).toEqual({
			login: {
				errors: {
					field: "email",
					message: "This email is not registered",
				},
				user: null,
			},
		});
	});

	it("Should return error where wrong password is passed", async () => {
		const testUser = {
			email: "test@test.com",
			password: "wrongpassword",
		};

		const { data } = await grahpqlTestCall(loginMutation, testUser);

		expect(data).toEqual({
			login: {
				errors: {
					field: "password",
					message: "Wrong password",
				},
				user: null,
			},
		});
	});

	it("Should return true when valid data are passed", async () => {
		const testUser = {
			email: "test@test.com",
			password: "12345678",
		};

		const { data } = await grahpqlTestCall(loginMutation, testUser);

		expect(data).toEqual({
			login: {
				errors: null,
				user: {
					email: "test@test.com",
					id: 1,
				},
			},
		});
	});
});
