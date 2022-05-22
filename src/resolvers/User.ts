import { User } from "../entities/User";
import { Arg, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import { hash, verify } from "argon2";

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
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
		errors?: FieldError[];

	@Field(() => User, { nullable: true })
		user?: User;
}

@Resolver()
export class UserResolver {
	@Mutation(() => Boolean)
	async register(
		@Arg("email") email: string,
		@Arg("password") password: string
	): Promise<boolean> {
		// TODO: Add the other inputs
		// TODO: Validate the inputs

		const hashedPassword = await hash(password);

		try {
			await User.insert({
				email,
				password: hashedPassword,
			});
		} catch (err) {
			// TODO: Add Error Schema
			console.error(err);
			return false;
		}
		return true;
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("email") email: string,
		@Arg("password") password: string
	): Promise<UserResponse> {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			// throw new Error("Invalid Credentials");
			return {
				errors: [
					{
						field: "username",
						message: "wrong email",
					},
				],
			};
		}

		const valid = await verify(user.password, password);

		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "wrong password",
					},
				],
			};
		}

		// login successful
		return {
			user,
		};
	}
}
