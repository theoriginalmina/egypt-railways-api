import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/Hello";
import { AppDataSource } from "./data-source";
import { UserResolver } from "./resolvers/User";
import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types/MyContext";

(async () => {
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

	const app = express();

	// app.use(helmet());

	// app.set("trust proxy", true);

	// app.use(cors());

	const RedisStore = connectRedis(session);
	const redisClient = createClient({ legacyMode: true });

	redisClient.connect().catch(console.error);

	app.use(
		session({
			name: "qid",
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 7, // One Week
				httpOnly: true,
				sameSite: "lax",
				secure: false,
			},
			saveUninitialized: false,
			secret: process.env.SECRET || "randomsecret",
			resave: false,
		})
	);

	const PORT = process.env.PORT || 5001;

	// Main Endpoint
	app.get("/", (_req, res) => {
		res.send("Egypt Railways API");
	});

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({ req, res }),
		csrfPrevention: true,
	});

	await apolloServer.start();

	// const corsOptions = {
	// 	origin: "https://studio.apollographql.com",
	// 	credentials: true,
	// };

	apolloServer.applyMiddleware({
		app,
		// cors: corsOptions,
		// path: "/graphql",
	});

	app.listen(PORT, () => {
		if (process.env.NODE_ENV === "development") {
			console.info(`Server is running on port ${PORT}`);
		}
	});
})();
