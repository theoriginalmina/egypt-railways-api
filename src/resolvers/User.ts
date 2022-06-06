import { User } from "../entities/User";
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import { hash, verify } from "argon2";
import { MyContext } from "../types/MyContext";

// prettier-ignore
@ObjectType()
class FieldError {
	@Field()
		field: string;

	@Field()
		message: string;
}
// prettier-ignore
@ObjectType()
class RegisterResponse {
	@Field(() => FieldError, { nullable: true })
		errors?: FieldError;
	@Field(() => Boolean)
		registered: boolean;
}

// prettier-ignore
@ObjectType()
class LoginResponse {
	@Field(() => FieldError, { nullable: true })
		errors?: FieldError;

	@Field(() => User, { nullable: true })
		user?: User;
}

@Resolver()
export class UserResolver {
	// prettier-ignore
	@Query(() => User, { nullable: true })
	me (@Ctx() { req }: MyContext) {
		if (!req.session.userId) {
			return null;
		}
		return true;
	}

	// prettier-ignore
	@Mutation(() => RegisterResponse)
	async register (
		@Arg("email") email: string,
		@Arg("password") password: string
	): Promise<RegisterResponse> {

		if(email.length === 0) {
			return {
				errors: {
					field:"email",
					message: "Email can't be empty"
				},
				registered: false

			};
		}
		if(password.length === 0) {
			return {
				errors: {
					field:"email",
					message: "Password can't be empty"
				},
				registered: false

			};
		}
		const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		
		if(!email.match(pattern)) {
			return {
				errors: {
					field: "email",
					message: "Invalid Email"
				}
				, registered: false
			};
		}

		if(password.length < 8) {
			return {
				errors: {
					field: "password",
					message: "Short password"
				},
				registered: false
			};
		}

		// Hash the password
		const hashedPassword = await hash(password);

		try {
			await User.insert({
				email,
				password: hashedPassword,
				active: false,
			});
		} catch (err) {
			if (err.code === "23505") {
				return {
					errors: 
						{
							field: "email",
							message: "Email Already Exist",
						},
					
					registered: false,
				};
			}
		}
		return {
			errors: undefined,
			registered: true,
		};
	}

	// prettier-ignore
	@Mutation(() => LoginResponse)
	async login (
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { req }: MyContext
	): Promise<LoginResponse> {
		if(email.length === 0) {
			return {
				errors: {
					field:"email",
					message: "Email can't be empty"
				},
			};
		}
		if(password.length === 0) {
			return {
				errors: {
					field:"password",
					message: "Password can't be empty"
				},
			};
		}
	
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return {
				errors: 
					{
						field: "email",
						message: "This email is not registered",
					},
				
			};
		}

		const valid = await verify(user.password, password);

		if (!valid) {
			return {
				errors: 
					{
						field: "password",
						message: "Wrong password",
					},
			};
		}

		req.session.userId = user.id;

		// login successful
		return {
			user,
		};
	}

	// prettier-ignore
	@Mutation(() => Boolean)
	async activeAccount (
		@Arg("id") id: number
		// @Arg("firstName") firstName: string
	) {
		const user = await User.findOne({ where: { id } });

		console.info(user);
	}
}
