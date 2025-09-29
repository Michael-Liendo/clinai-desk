import { AdminRepository } from "./admin";
import { Companies } from "./companies";
import { CompaniesUser } from "./companies_user";
import { Consultations } from "./consultations";
import { Patients } from "./patients";
import { Users } from "./users";

export default class Repository {
	static users = Users;
	static admin = AdminRepository;
	static companies = Companies;
	static companies_user = CompaniesUser;
	static patients = Patients;
	static consultations = Consultations;
}
