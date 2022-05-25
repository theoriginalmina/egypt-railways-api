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
// import { hash, verify } from "argon2";
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
class RegisterResponed {
	@Field(() => [FieldError], { nullable: true })
		errors?: FieldError[];
	@Field(() => Boolean)
		registered: boolean;
}

// prettier-ignore
@ObjectType()
class LoginResponed {
	@Field(() => [FieldError], { nullable: true })
		errors?: FieldError[];

	@Field(() => User, { nullable: true })
		user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: MyContext) {
		if (!req.session.userId) {
			return null;
		}
		return true;
	}

	@Mutation(() => RegisterResponed)
	async register(
		@Arg("email") email: string,
		@Arg("password") password: string
	): Promise<RegisterResponed> {
		// TODO: Add the other inputs
		// TODO: Validate the inputs

		// const hashedPassword = await hash(password);

		try {
			await User.insert({
				email,
				password,
				active: false,
			});
		} catch (err) {
			// TODO: Add Error Schema
			if (err.code === "23505") {
				return {
					errors: [
						{
							field: "Email",
							message: "Email Already Exist",
						},
					],
					registered: false,
				};
			}
		}
		return {
			registered: true,
		};
	}

	@Mutation(() => LoginResponed)
	async login(
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { req }: MyContext
	): Promise<LoginResponed> {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return {
				errors: [
					{
						field: "Email",
						message: "This Email is not Exist",
					},
				],
			};
		}

		// const valid = await verify(user.password, password);
		let valid;
		if (password === user.password) {
			valid = true;
		} else {
			valid = false;
		}

		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "Wrong password",
					},
				],
			};
		}

		req.session.userId = user.id;

		// login successful
		return {
			user,
		};
	}
}
