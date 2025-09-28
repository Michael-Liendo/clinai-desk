import { ChevronsUpDown, Cog } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useCompanyContext } from "@/context/CompanyContext";
import { cn } from "@/utils/cn";

export function CompanySwitcher() {
	const { isMobile } = useSidebar();
	const { companies, activeCompany, setActiveCompany, activeMembership } =
		useCompanyContext();
	const canManageActive =
		!!activeMembership && activeMembership.role === "admin";

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Avatar className="h-4 w-4 rounded-lg">
										<AvatarFallback className="flex items-center justify-center rounded-lg">
											{activeCompany?.name?.charAt(0)?.toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{activeCompany?.name ?? "Crea una compañía"}
									</span>
								</div>
								<ChevronsUpDown className="ml-auto" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							align="start"
							side={isMobile ? "bottom" : "right"}
							sideOffset={4}
						>
							<DropdownMenuLabel className="text-xs text-muted-foreground">
								Compañías
							</DropdownMenuLabel>
							{companies?.map((company) => (
								<DropdownMenuItem
									key={company.id}
									onClick={() => setActiveCompany(company)}
									className={cn("gap-2 p-2", {
										"bg-sidebar-accent text-sidebar-accent-foreground":
											company.id === activeCompany?.id,
									})}
								>
									<Avatar className="size-6 border flex items-center justify-center rounded-sm">
										<AvatarFallback>
											{company.name.charAt(0)?.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									{company.name}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							{canManageActive && activeCompany && (
								<Link to={`/companies/${activeCompany.id}`}>
									<DropdownMenuItem className="gap-2 p-2">
										<div className="flex size-6 items-center justify-center rounded-md border bg-background">
											<Cog className="size-4" />
										</div>
										<div className="font-medium text-muted-foreground">
											Ver clínica
										</div>
									</DropdownMenuItem>
								</Link>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	);
}
