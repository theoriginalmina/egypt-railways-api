import { UserResolver } from "../../src/resolvers/User";
import { buildSchema } from "type-graphql";

export const createSchema = () => {
	return buildSchema({
		resolvers: [UserResolver],
	});
};
