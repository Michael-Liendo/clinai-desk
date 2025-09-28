import AdminService from "./admin.service";
import Auth from "./auth.service";
import Companies from "./companies.service";
import Users from "./users.service";
import CompaniesUser from "./users_companies.service";
import Patients from "./patients.service";

export default class Services {
	static auth = Auth;
	static user = Users;
	static admin = AdminService;
	static companies = Companies;
	static companies_user = CompaniesUser;
	static patients = Patients;
}
