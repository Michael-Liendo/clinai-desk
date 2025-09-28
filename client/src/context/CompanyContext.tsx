import type { ICompany, ICompanyUser } from "@clinai/shared";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth";
import Services from "@/services";

interface CompanyContextValue {
	companies: ICompany[];
	activeCompany: ICompany | undefined;
	setActiveCompany: (c?: ICompany) => void;
	isLoading: boolean;
	memberships: ICompanyUser[];
	activeMembership: ICompanyUser | undefined;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(
	undefined,
);

export function CompanyProvider({ children }: { children?: React.ReactNode }) {
	const { user } = useAuth();
	const [companies, setCompanies] = useState<ICompany[]>([]);
	const [activeCompany, setActiveCompany] = useState<ICompany | undefined>(
		undefined,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [memberships, setMemberships] = useState<ICompanyUser[]>([]);

	useEffect(() => {
		let mounted = true;
		async function load() {
			if (!user?.id) return;
			setIsLoading(true);
			try {
				// Fetch all memberships for this user
				const mships = await Services.users_companies.listByUser(user.id);
				const companies = await Promise.all(
					mships.map((m) => Services.companies.getOne(m.company_id)),
				);
				const filtered = companies.filter(Boolean) as ICompany[];
				if (!mounted) return;
				setMemberships(mships);
				setCompanies(filtered);
				// keep current selection if still present, else pick first
				if (activeCompany && filtered.some((c) => c.id === activeCompany.id)) {
					setActiveCompany(filtered.find((c) => c.id === activeCompany!.id));
				} else {
					setActiveCompany(filtered[0]);
				}
			} finally {
				if (mounted) setIsLoading(false);
			}
		}
		load();
		return () => {
			mounted = false;
		};
	}, [user?.id]);

	const activeMembership = useMemo(
		() =>
			activeCompany
				? memberships.find((m) => m.company_id === activeCompany.id)
				: undefined,
		[activeCompany, memberships],
	);

	const value = useMemo<CompanyContextValue>(
		() => ({
			companies,
			activeCompany,
			setActiveCompany,
			isLoading,
			memberships,
			activeMembership,
		}),
		[companies, activeCompany, isLoading, memberships, activeMembership],
	);

	return (
		<CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
	);
}

export function useCompanyContext() {
	const ctx = useContext(CompanyContext);
	if (!ctx)
		throw new Error("useCompanyContext must be used within CompanyProvider");
	return ctx;
}
