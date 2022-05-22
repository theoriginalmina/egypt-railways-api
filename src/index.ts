import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/Hello";
import { AppDataSource } from "./data-source";
import { UserResolver } from "./resolvers/User";

(async () => {
	const app = express();

	const PORT = process.env.PORT || 5001;

	AppDataSource.initialize()
		.then(() => {
			if (process.env.NODE_ENV === "development") {
				console.info("Connnected successfully to postgres DB");
			}
		})
		.catch((error) => {
			if (process.env.NODE_ENV === "development") {
				console.error(error);
			}
		});

	// Main Endpoint
	app.get("/", (_req, res) => {
		res.send("Egypt Railways API");
	});

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({ req, res }),
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({ app });

	app.listen(PORT, () => {
		if (process.env.NODE_ENV === "development") {
			console.info(`Server is running on port ${PORT}`);
		}
	});
})();

// import { AppDataSource } from "./data-source"
// import { User } from "./entity/User"

// AppDataSource.initialize().then(async () => {

//     console.log("Inserting a new user into the database...")
//     const user = new User()
//     user.firstName = "Timber"
//     user.lastName = "Saw"
//     user.age = 25
//     await AppDataSource.manager.save(user)
//     console.log("Saved a new user with id: " + user.id)

//     console.log("Loading users from the database...")
//     const users = await AppDataSource.manager.find(User)
//     console.log("Loaded users: ", users)

//     console.log("Here you can setup and run express / fastify / any other framework.")

// }).catch(error => console.log(error))
