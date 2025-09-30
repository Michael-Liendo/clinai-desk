import type { IPaginationResponse } from "@clinai/shared";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ConsultationsDatagrid } from "@/components/entity/consultation/datagrid";
import { DataTable } from "@/components/table/data-table";
import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCompanyContext } from "@/context/CompanyContext";
import { PrivateRoutesEnum } from "@/data/routesEnums";
import { useSEO } from "@/features/seo";
import Services from "@/services";

export default function ConsultationsPage() {
	const [searchParams] = useSearchParams();
	const patientId = searchParams.get("patient");
	
	useSEO({
		title: patientId ? "Consultas del Paciente" : "Consultas",
		description: patientId 
			? "Listado de consultas médicas del paciente seleccionado."
			: "Listado de consultas médicas de la empresa seleccionada.",
	});

	const { activeCompany } = useCompanyContext();

	const [pagination, setPagination] = useState<IPaginationResponse>({
		page: 1,
		limit: 50,
		hasNextPage: false,
		hasPreviousPage: false,
		total: 0,
	});

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
	
	// Simple debounce
	const debouncedSearch = useMemo(() => search, [search]);

	const { data, isLoading, refetch } = useQuery({
		queryKey: [
			"consultations",
			activeCompany?.id,
			pagination.page,
			pagination.limit,
			debouncedSearch,
			statusFilter,
			patientId,
		],
		queryFn: async () => {
			if (!activeCompany?.id) return [];
			
			// Si hay un patientId, usar el endpoint específico para el paciente
			if (patientId) {
				const res = await Services.consultations.getByPatient(
					activeCompany.id,
					patientId,
					{ page: pagination.page, limit: pagination.limit }
				);
				if (res.pagination) setPagination(res.pagination);
				return res.data;
			}
			
			// Si no hay patientId, usar el endpoint general con filtros
			const filters: {
				q?: string;
				status?: "open" | "closed";
			} = {
				q: debouncedSearch || undefined,
			};
			
			if (statusFilter !== "all") {
				filters.status = statusFilter;
			}
			
			const res = await Services.consultations.find(
				activeCompany.id,
				filters,
				{ page: pagination.page, limit: pagination.limit }
			);
			
			if (res.pagination) setPagination(res.pagination);
			return res.data;
		},
		enabled: !!activeCompany?.id,
	});

	// Stats query for summary cards (solo cuando no hay filtro por paciente)
	const { data: stats } = useQuery({
		queryKey: ["consultations-stats", activeCompany?.id],
		queryFn: async () => {
			if (!activeCompany?.id) return null;
			return Services.consultations.getStats(activeCompany.id);
		},
		enabled: !!activeCompany?.id && !patientId,
	});

	// Patient query cuando se filtra por paciente específico
	const { data: patientData } = useQuery({
		queryKey: ["patient", patientId],
		queryFn: async () => {
			if (!patientId) return null;
			const patient = await Services.patients.getOne(patientId);
			return patient;
		},
		enabled: !!patientId,
	});

	useEffect(() => {
		// Refetch when company changes
		refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeCompany?.id]);

	if (!activeCompany?.id) {
		return (
			<div className="p-4">
				<h1 className="text-xl font-semibold mb-2">Consultas</h1>
				<p className="text-sm text-muted-foreground">
					Selecciona una empresa para ver sus consultas.
				</p>
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="flex flex-col space-y-2">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold">
							{patientId ? "Consultas del Paciente" : "Consultas Médicas"}
						</h1>
						<p className="text-sm text-muted-foreground">
							{patientId 
								? `Historial de consultas de ${patientData ? `${patientData.first_name} ${patientData.last_name}` : "el paciente seleccionado"}`
								: "Listado de consultas médicas de la empresa seleccionada."
							}
						</p>
					</div>
					{patientId && (
						<Button
							variant="outline"
							onClick={() => window.history.back()}
						>
							← Volver
						</Button>
					)}
				</div>
			</div>

			{/* Stats Cards */}
			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
					<div className="bg-card rounded-lg border p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total</p>
								<p className="text-2xl font-bold">{stats.total}</p>
							</div>
							<div className="h-4 w-4 text-muted-foreground">
								📊
							</div>
						</div>
					</div>
					<div className="bg-card rounded-lg border p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Abiertas</p>
								<p className="text-2xl font-bold text-green-600">{stats.open}</p>
							</div>
							<div className="h-4 w-4 text-green-600">
								🟢
							</div>
						</div>
					</div>
					<div className="bg-card rounded-lg border p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Cerradas</p>
								<p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
							</div>
							<div className="h-4 w-4 text-gray-600">
								⚫
							</div>
						</div>
					</div>
					<div className="bg-card rounded-lg border p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Tasa de cierre</p>
								<p className="text-2xl font-bold text-blue-600">
									{stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}%
								</p>
							</div>
							<div className="h-4 w-4 text-blue-600">
								📊
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Filters - Solo mostrar cuando no hay filtro por paciente */}
			{!patientId && (
				<div className="flex gap-4 items-center my-5">
					<TextField
						type="search"
						placeholder="Buscar por motivo, síntomas, diagnóstico..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-80"
					/>
					
					<Select value={statusFilter} onValueChange={(value: "all" | "open" | "closed") => setStatusFilter(value)}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas</SelectItem>
							<SelectItem value="open">Abiertas</SelectItem>
							<SelectItem value="closed">Cerradas</SelectItem>
						</SelectContent>
					</Select>

					{/* Filter badges */}
					<div className="flex gap-2 ml-4">
						{statusFilter !== "all" && (
							<Badge variant="secondary" className="cursor-pointer" onClick={() => setStatusFilter("all")}>
								Estado: {statusFilter === "open" ? "Abiertas" : "Cerradas"} ✕
							</Badge>
						)}
						{search && (
							<Badge variant="secondary" className="cursor-pointer" onClick={() => setSearch("")}>
								Búsqueda: "{search}" ✕
							</Badge>
						)}
					</div>
				</div>
			)}

			<DataTable
				pagination={pagination}
				columns={ConsultationsDatagrid}
				data={data || []}
				loading={isLoading}
				route={PrivateRoutesEnum.Consultations}
				onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
			/>
		</div>
	);
}
