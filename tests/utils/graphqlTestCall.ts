import { graphql, GraphQLSchema } from "graphql";
import { createSchema } from "./createSchema";

export const grahpqlTestCall = async (
	query: string,
	variables?: object,
	userId?: number
) => {
	const schema: GraphQLSchema = await createSchema();
	return graphql(
		schema,
		query,
		undefined,
		{
			req: {
				session: {
					userId,
				},
			},
		},
		variables
	);
};
