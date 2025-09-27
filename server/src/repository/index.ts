import { AdminRepository } from "./admin";
import { Users } from "./user";

export default class Repository {
	static users = Users;
	static admin = AdminRepository;
}
