import { AdminRepository } from "./admin";
import { Users } from "./users";
import { Companies } from "./companies";

export default class Repository {
	static users = Users;
	static admin = AdminRepository;
	static companies = Companies;
}
