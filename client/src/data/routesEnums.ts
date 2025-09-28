export enum PublicRoutesEnum {}

export enum AuthRoutesEnum {
	Login = "/login",
	Register = "/register",
}

export enum PrivateRoutesEnum {
	Home = "/",
	CompanyDetails = "/companies/:id",
	Patients = "/patients",
	PatientDetails = "/patients/:id",
	PatientCreate = "/patients/create",
}
