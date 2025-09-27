const dotenv = require("dotenv");

dotenv.config();

const knexConfig = {
	development: {
		client: "pg",
		connection: {
			host: process.env.POSTGRES_HOST,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
		},
		pool: { min: 0, max: 10 },
	},
	production: {
		client: "pg",
		connection: {
			host: process.env.POSTGRES_HOST,
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			ssl: true,
		},
		pool: {
			min: 2,
			max: 10,
		},
	},
};

// @ts-ignore
module.exports = knexConfig[process.env.NODE_ENV || "development"];
