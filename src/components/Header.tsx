import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { authClient } from '#/lib/auth-client';

export default function Header() {
  const { data: session, isPending } = authClient.useSession();

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
                  <Link to="/panel-pracowniczy">Panel Pracowniczy</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/panel-oceniajacego">Panel Oceniającego</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/admin">Admin</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/test">Test</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          {isPending ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded-md" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
              <Button
                onClick={() => {
                  void authClient.signOut();
                }}
              >
                Logout
              </Button>
            </div>
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
