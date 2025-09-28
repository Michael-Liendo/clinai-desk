import { PatientsDatagrid } from "@/components/entity/patient/datagrid";
import { DataTable } from "@/components/table/data-table";
import { useCompanyContext } from "@/context/CompanyContext";
import Services from "@/services";
import type { IPaginationResponse } from "@clinai/shared";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PrivateRoutesEnum } from "@/data/routesEnums";
import { TextField } from "@/components/text-field";
import { useSEO } from "@/features/seo";

export default function PatientsPage() {
	useSEO({
		title: "Pacientes",
		description: "Listado de pacientes de la empresa seleccionada.",
	});

	const { activeCompany } = useCompanyContext();

	const [pagination, setPagination] = useState<IPaginationResponse>({
		page: 0,
		limit: 50,
		hasNextPage: false,
		hasPreviousPage: false,
		total: 0,
	});

	const [search, setSearch] = useState("");
	// simple debounce
	const debouncedSearch = useMemo(() => search, [search]);

	const { data, isLoading, refetch } = useQuery({
		queryKey: [
			"patients",
			activeCompany?.id,
			pagination.page,
			pagination.limit,
			debouncedSearch,
		],
		queryFn: async () => {
			if (!activeCompany?.id) return [];
			const res = await Services.patients.find(
				{
					company_id: activeCompany?.id,
					q: debouncedSearch || undefined,
				},
				{ page: pagination.page, limit: pagination.limit },
			);
			if (res.pagination) setPagination(res.pagination);
			return res.data;
		},
		enabled: !!activeCompany?.id,
	});

	useEffect(() => {
		// refetch when company changes
		refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeCompany?.id]);

	if (!activeCompany?.id) {
		return (
			<div className="p-4">
				<h1 className="text-xl font-semibold mb-2">Pacientes</h1>
				<p className="text-sm text-muted-foreground">
					Selecciona una empresa para ver sus pacientes.
				</p>
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="flex flex-col space-y-2">
				<h1 className="text-xl font-semibold">Pacientes</h1>
				<p className="text-sm text-muted-foreground">
					Listado de pacientes de la empresa seleccionada.
				</p>
			</div>

			<div className="flex gap-2 items-center my-5">
				<TextField
					type="search"
					placeholder="Buscar por nombre, apellido, DNI o email"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-80"
				/>
			</div>

			<DataTable
				pagination={pagination}
				columns={PatientsDatagrid}
				data={data || []}
				loading={isLoading}
				route={PrivateRoutesEnum.Patients}
				onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
			/>
		</div>
	);
}
