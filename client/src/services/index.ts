import { AuthService } from "./auth";
import { CompaniesService } from "./companies";
import { UserService } from "./users";
import { UsersCompaniesService } from "./users_companies";
import { PatientsService } from "./patients";

export default class Services {
	static auth = AuthService;
	static users = UserService;
	static companies = CompaniesService;
	static users_companies = UsersCompaniesService;
	static patients = PatientsService;
}
