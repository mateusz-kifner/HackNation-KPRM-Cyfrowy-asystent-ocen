import { Link } from "@tanstack/react-router";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "./ui/navigation-menu";
import { authClient } from "#/lib/auth-client";
import NotificationMenu from "./NotificationMenu";
import UserProfileMenu from "./UserProfileMenu";

export default function Header() {
	const { data: session } = authClient.useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;
	const canManageUsers = role === "Admin" || role === "Manager";

	return (
		<header className="sticky top-0 z-50 header-complementary border-b border-border px-4">
			<nav className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 sm:py-4">
				<Link to="/" className="shrink-0 flex items-center gap-2">
					<img src="/logo.png" alt="Blue Void logo" className="size-10" />
					<span className="font-mono text-2xl">BlueVoid</span>
				</Link>

				<div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 font-semibold text-sm sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
					<NavigationMenu>
						<NavigationMenuList>
							{session?.user && (
								<>
									<NavigationMenuItem>
										<NavigationMenuLink asChild>
											<Link to="/evaluation">Evaluation</Link>
										</NavigationMenuLink>
									</NavigationMenuItem>
									<NavigationMenuItem>
										<NavigationMenuLink asChild>
											<Link to="/me">My carrier</Link>
										</NavigationMenuLink>
									</NavigationMenuItem>
								</>
							)}
							{canManageUsers && (
								<NavigationMenuItem>
									<NavigationMenuLink asChild>
										<Link to="/users">Users</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
							)}
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				<div className="ml-auto flex items-center gap-2 sm:gap-3">
					<NotificationMenu />
					<UserProfileMenu />
				</div>
			</nav>
		</header>
	);
}
