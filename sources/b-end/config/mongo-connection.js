const isNotProduction = process.env.NODE_ENV !== "production";

if (isNotProduction) {
	const dotenv = await import("dotenv");
	dotenv.config();
}

import { MongoClient } from "mongodb";

// Replace the uri string with your connection string.
const uri = process.env.MONGODB_CONN_STRING;

const client = new MongoClient(uri);

async function connect() {
	try {
		client.db(process.env.MONGODB_DB_NAME);
	} catch (error) {
		await client.close();
	}
}

async function getDB() {
	return client.db(process.env.MONGODB_DB_NAME);
}

export { connect, getDB };
