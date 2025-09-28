import type { ICompany, ICompanyUser, IUser } from "@clinai/shared";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserModalMutate } from "@/components/entity/user/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth";
import Services from "@/services";
import { translateCompanyRole } from "@/utils/roles";

export default function CompanyDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const { user } = useAuth();
	const [company, setCompany] = useState<ICompany | undefined>();
	const [memberships, setMemberships] = useState<ICompanyUser[]>([]);
	const [users, setUsers] = useState<Record<string, IUser>>({});
	const [loading, setLoading] = useState(true);
	const [openCreateUser, setOpenCreateUser] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [membershipToDelete, setMembershipToDelete] = useState<{
		id: string;
		name?: string;
	} | null>(null);

	useEffect(() => {
		let mounted = true;
		async function load() {
			if (!id) return;
			setLoading(true);
			try {
				const comp = await Services.companies.getOne(id);
				const mships = await Services.users_companies.listByCompany(id);
				const userIds = Array.from(new Set(mships.map((m) => m.user_id)));
				const fetched = await Promise.all(
					userIds.map(async (uid) => ({
						uid,
						user: await Services.users.getOne(uid),
					})),
				);
				if (!mounted) return;
				const map: Record<string, IUser> = {};
				fetched.forEach(({ uid, user }) => {
					if (user) map[uid] = user;
				});
				setCompany(comp);
				setMemberships(mships);
				setUsers(map);
			} finally {
				if (mounted) setLoading(false);
			}
		}
		load();
		return () => {
			mounted = false;
		};
	}, [id]);

	const rows = useMemo(
		() =>
			memberships.map((m) => ({
				id: m.id,
				role: m.role,
				userId: m.user_id,
				user: users[m.user_id],
			})),
		[memberships, users],
	);

	if (loading) return <div className="p-6">Cargando...</div>;
	if (!company) return <div className="p-6">Clínica no encontrada</div>;

	return (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Información de la clínica</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div>
						<strong>Nombre:</strong> {company.name}
					</div>
					{company.email && (
						<div>
							<strong>Correo:</strong> {company.email}
						</div>
					)}
					{company.address && (
						<div>
							<strong>Dirección:</strong> {company.address}
						</div>
					)}
					{company.phone && (
						<div>
							<strong>Teléfono:</strong> {company.phone}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-4">
						<CardTitle className="text-xl">Usuarios asociados</CardTitle>
						{user &&
							memberships.some(
								(m) => m.user_id === user.id && m.role === "admin",
							) && (
								<Button onClick={() => setOpenCreateUser(true)}>
									Agregar usuario
								</Button>
							)}
					</div>
				</CardHeader>
				<CardContent>
					{rows.length === 0 ? (
						<div className="text-muted-foreground">
							No hay usuarios asociados.
						</div>
					) : (
						<div className="space-y-3">
							{rows.map((r) => (
								<div key={r.id} className="py-2">
									<div className="flex items-center justify-between gap-4">
										<div>
											<div className="font-medium">
												{r.user
													? `${r.user.first_name} ${r.user.last_name}`
													: "Usuario"}
											</div>
											<div className="text-xs text-muted-foreground">
												{r.user?.email}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="text-sm px-2 py-1 rounded bg-muted">
												{translateCompanyRole(r.role)}
											</div>
											{user &&
												user.id !== r.userId &&
												memberships.some(
													(m) => m.user_id === user.id && m.role === "admin",
												) && (
													<Button
														variant="destructive"
														size="sm"
														onClick={() => {
															setMembershipToDelete({
																id: r.id,
																name: r.user
																	? `${r.user.first_name} ${r.user.last_name}`
																	: undefined,
															});
															setConfirmOpen(true);
														}}
													>
														Desvincular
													</Button>
												)}
										</div>
									</div>
									<Separator className="mt-2" />
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<UserModalMutate
				open={openCreateUser}
				setOpen={setOpenCreateUser}
				companyId={id!}
				onCreated={async () => {
					if (!id) return;
					const mships = await Services.users_companies.listByCompany(id);
					setMemberships(mships);
					const userIds = Array.from(new Set(mships.map((m) => m.user_id)));
					const fetched = await Promise.all(
						userIds.map(async (uid) => ({
							uid,
							user: await Services.users.getOne(uid),
						})),
					);
					const map: Record<string, IUser> = {};
					fetched.forEach(({ uid, user }) => {
						if (user) map[uid] = user;
					});
					setUsers(map);
				}}
			/>

			<ConfirmDialog
				open={confirmOpen}
				setOpen={(open) => {
					setConfirmOpen(open);
					if (!open) setMembershipToDelete(null);
				}}
				title="¿Estás seguro que deseas desvincular?"
				description={
					membershipToDelete?.name
						? `Desvincularás a ${membershipToDelete.name} de esta clínica. Esta acción no se puede deshacer.`
						: "Esta acción no se puede deshacer."
				}
				confirmText="Desvincular"
				confirmVariant="destructive"
				onConfirm={async () => {
					if (!id || !membershipToDelete) return;
					await Services.users_companies.delete(membershipToDelete.id);
					const mships = await Services.users_companies.listByCompany(id);
					setMemberships(mships);
					const userIds = Array.from(new Set(mships.map((m) => m.user_id)));
					const fetched = await Promise.all(
						userIds.map(async (uid) => ({
							uid,
							user: await Services.users.getOne(uid),
						})),
					);
					const map: Record<string, IUser> = {};
					fetched.forEach(({ uid, user }) => {
						if (user) map[uid] = user;
					});
					setUsers(map);
				}}
			/>
		</div>
	);
}
