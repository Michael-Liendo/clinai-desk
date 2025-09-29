import { AuthService } from "./auth";
import { CompaniesService } from "./companies";
import { ConsultationsService } from "./consultations";
import { PatientsService } from "./patients";
import { UserService } from "./users";
import { UsersCompaniesService } from "./users_companies";

export default class Services {
	static auth = AuthService;
	static users = UserService;
	static companies = CompaniesService;
	static users_companies = UsersCompaniesService;
	static patients = PatientsService;
	static consultations = ConsultationsService;
}
