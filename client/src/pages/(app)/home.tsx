import { useAuth } from "@/features/auth";

function Home() {
	const { user } = useAuth();

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold">
				Bienvenido{user?.first_name ? `, ${user.first_name}` : ""}
			</h1>
			<p className="text-muted-foreground mt-2">Has iniciado sesión.</p>
		</div>
	);
}

export default Home;
