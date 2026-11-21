import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 header-complementary border-b border-border px-4">
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-4 py-4 sm:py-6">
        <h2 className="shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Blue Void logo" className="size-10" />
            <span className="font-mono text-2xl">BlueVoid</span>
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-8 gap-y-2 pb-1 font-semibold text-sm sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/">{ "Home"}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/blog">{ "Blog"}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/about">{ "About"}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
