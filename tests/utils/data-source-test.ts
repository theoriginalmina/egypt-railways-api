import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../../src/entities/User";

export const AppDataSourceTest = new DataSource({
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "postgres",
	password: "test",
	database: "egypt-railways-test",
	synchronize: true,
	logging: false,
	dropSchema: true,
	entities: [User],
	migrations: [],
	subscribers: [],
});
