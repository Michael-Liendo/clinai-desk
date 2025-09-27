import { AdminRepository } from "./admin";
import { Users } from "./users";
import { Companies } from "./companies";
import { CompaniesUser } from "./companies_user";

export default class Repository {
	static users = Users;
	static admin = AdminRepository;
	static companies = Companies;
	static companies_user = CompaniesUser;
}
