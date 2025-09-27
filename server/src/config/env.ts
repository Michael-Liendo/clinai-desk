import * as dotenv from "dotenv";

dotenv.config();

const {
	NODE_ENV = "development",
	PORT = 3000,
	SALT_ROUNDS = 10,
	CORS_ORIGIN = "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost,capacitor://localhost",
	JWT_PRIVATE_KEY = "clinai",
	POSTGRES_HOST = "0.0.0.0",
	POSTGRES_PASSWORD = "password",
	POSTGRES_USER = "user",
	POSTGRES_DB = "server-app",
	HOST = "127.0.0.1",
	GOOGLE_WEB_CLIENT_ID = "949333678429-oe1rf6vjba58iukt1g2ckcipdjas0nd8.apps.googleusercontent.com",
} = process.env;

export const EnvConfig = () => {
	if (NODE_ENV === "production") {
		return {
			NODE_ENV,
			HOST,
			PORT,
			SALT_ROUNDS,
			CORS_ORIGIN,
			JWT_PRIVATE_KEY,
			POSTGRES_HOST,
			POSTGRES_PASSWORD,
			POSTGRES_USER,
			POSTGRES_DB,
			GOOGLE_WEB_CLIENT_ID,
		};
	}

	return {
		NODE_ENV,
		HOST,
		PORT,
		SALT_ROUNDS,
		CORS_ORIGIN,
		JWT_PRIVATE_KEY,
		POSTGRES_HOST,
		POSTGRES_PASSWORD,
		POSTGRES_USER,
		POSTGRES_DB,
		GOOGLE_WEB_CLIENT_ID,
	};
};
