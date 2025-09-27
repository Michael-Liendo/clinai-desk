import AdminService from "./admin";
import Auth from "./auth";
import Users from "./users";

export default class Services {
	static auth = Auth;
	static user = Users;
	static admin = AdminService;
}
