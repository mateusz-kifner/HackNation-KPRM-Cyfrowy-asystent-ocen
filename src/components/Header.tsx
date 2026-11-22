import { Link } from "@tanstack/react-router";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import ThemeSelector from "./ThemeSelector";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { authClient } from '#/lib/auth-client';

export default function Header() {
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "Admin";

  return (
    <header className="sticky top-0 z-50 header-complementary border-b border-border px-4">
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-4 py-4 sm:py-6">
        <Link to="/" className="shrink-0 flex items-center gap-2">
          <img src="/logo.png" alt="Blue Void logo" className="size-10" />
          <span className="font-mono text-2xl">BlueVoid</span>
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-8 gap-y-2 pb-1 font-semibold text-sm sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/evaluation">Evaluation</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/me">Me</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/admin">Admin</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          )}
          {isPending ? (
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="size-10 rounded-full p-0"
                  aria-label="Open account menu"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
                    <AvatarFallback>
                      {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="truncate text-sm font-medium text-foreground">
                      {session.user.name || "Your account"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/me">
                      <IconSettings />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <ThemeSelector />
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => void authClient.signOut()}
                >
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
