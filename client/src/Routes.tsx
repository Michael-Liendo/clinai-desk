import type { JSX } from "react";
import {
	Navigate,
	Outlet,
	Routes as ReactRoutes,
	Route,
	BrowserRouter as Router,
} from "react-router-dom";
import { useAuth } from "@/features/auth";
import AppLayout from "./components/app-layout";
import { LoadingFullScreen } from "./components/loading";
import { AuthRoutesEnum, PrivateRoutesEnum } from "./data/routesEnums";
import Home from "./pages/(app)/home";
import Login from "./pages/(auth)/Login";
import Register from "./pages/(auth)/Register";

const PrivateRoutesWrapper = () => {
	const { token, authInitialized } = useAuth();

	if (!authInitialized) return <LoadingFullScreen />;

	return token ? (
		<AppLayout>
			<Outlet />
		</AppLayout>
	) : (
		<Navigate to={AuthRoutesEnum.Login} />
	);
};

const AuthRoutesWrapper = () => {
	const { token } = useAuth();
	return !token ? <Outlet /> : <Navigate to={PrivateRoutesEnum.Home} />;
};

export function Routes() {
	return (
		<Router>
			<ReactRoutes>
				<Route element={<PrivateRoutesWrapper />}>
					{PrivateRoutes.map((route) => route)}
				</Route>
				<Route element={<AuthRoutesWrapper />}>
					{AuthRoutes.map((route) => route)}
				</Route>
				{PublicRoutes.map((route) => route)}
			</ReactRoutes>
		</Router>
	);
}

const PrivateRoutes: JSX.Element[] = [
	<Route
		key={PrivateRoutesEnum.Home}
		Component={Home}
	/>,
];

const AuthRoutes: JSX.Element[] = [
    <Route
        key={AuthRoutesEnum.Login}
        path={AuthRoutesEnum.Login}
        Component={Login}
    />,
    <Route
        key={AuthRoutesEnum.Register}
        path={AuthRoutesEnum.Register}
        Component={Register}
    />,
];

const PublicRoutes: JSX.Element[] = [
	<Route key={"no-found"} path={"*"} Component={() => <>No Found</>} />,
];
