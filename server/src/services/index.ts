import AdminService from "./admin.service";
import Auth from "./auth.service";
import Users from "./users.service";
import Companies from "./companies.service";
import CompaniesUser from "./users_companies.service";

export default class Services {
	static auth = Auth;
	static user = Users;
	static admin = AdminService;
	static companies = Companies;
	static companies_user = CompaniesUser;
}
