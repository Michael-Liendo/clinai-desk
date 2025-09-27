import {
	Award,
	Book,
	BotIcon,
	BoxesIcon,
	BrickWallIcon,
	Cog,
	DollarSign,
	FactoryIcon,
	MenuIcon,
	NotebookPen,
	Shield,
	TicketIcon,
	Users,
	XIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { PrivateRoutesEnum } from "@/data/routesEnums";
import { useIsMobile } from "@/features/ui";
import { NavUser } from "./nav-user";

type NavItem = {
	title: string;
	url: PrivateRoutesEnum;
	icon: React.ForwardRefExoticComponent<
		Omit<React.SVGProps<SVGSVGElement>, "ref"> &
			React.RefAttributes<SVGSVGElement>
	>;
};

const navMain: { title: string; items: NavItem[] }[] = [
	{
		title: "Datos",
		items: [
			{
				title: "Clientes",
				url: PrivateRoutesEnum.Customers,
				icon: Users,
			},
			{
				title: "Pagos",
				url: PrivateRoutesEnum.Payments,
				icon: DollarSign,
			},
			{
				title: "Tickets",
				url: PrivateRoutesEnum.Tickets,
				icon: TicketIcon,
			},
		],
	},
	{
		title: "Reportes",
		items: [
			{
				title: "Subir referencias",
				icon: BrickWallIcon,
				url: PrivateRoutesEnum.Validate,
			},

			{
				title: "Resultados",
				url: PrivateRoutesEnum.Results,
				icon: Book,
			},
			{
				title: "Ganadores",
				url: PrivateRoutesEnum.Winners,
				icon: Award,
			},
			{
				title: "Reportes",
				url: PrivateRoutesEnum.Reports,
				icon: NotebookPen,
			},
		],
	},

	{
		title: "Configuración",
		items: [
			{
				title: "Usuarios",
				url: PrivateRoutesEnum.Users,
				icon: Shield,
			},
			{
				title: "Grupos",
				url: PrivateRoutesEnum.WhatsappGroups,
				icon: BoxesIcon,
			},
			{
				title: "Bots",
				url: PrivateRoutesEnum.WhatsappBots,
				icon: BotIcon,
			},
			{
				title: "Loterías",
				url: PrivateRoutesEnum.Lotteries,
				icon: DollarSign,
			},
			{
				title: "Agencias",
				url: PrivateRoutesEnum.Agency,
				icon: FactoryIcon,
			},
			{
				title: "Configuración",
				url: PrivateRoutesEnum.Config,
				icon: Cog,
			},
		],
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { pathname } = useLocation();

	const isMobile = useIsMobile();
	const { toggleSidebar, open: isOpen } = useSidebar();

	return (
		<>
			{isMobile && (
				<button
					type="button"
					onClick={toggleSidebar}
					className="fixed z-50 bottom-4 left-4 bg-black text-white p-2 rounded-full shadow-md hover:bg-gray-800 transition-all"
				>
					{isOpen ? (
						<MenuIcon className="w-5 h-5" />
					) : (
						<XIcon className="w-5 h-5" />
					)}
				</button>
			)}

			<Sidebar collapsible="icon" {...props}>
				<SidebarHeader />
				<SidebarContent>
					{navMain.map((item) => (
						<SidebarGroup key={item.title}>
							<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{item.items.map((i) => (
										<SidebarMenuItem
											key={i.title}
											className={i.url === pathname ? "bg-sidebar-accent" : ""}
										>
											<SidebarMenuButton asChild>
												<Link to={i.url}>
													{i.icon && <i.icon />}
													<span>{i.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					))}
				</SidebarContent>
				<SidebarFooter>
					<NavUser />
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>
		</>
	);
}
