import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "#/components/ui/dropdown-menu";
import { useThemeMode, type ThemeMode } from "#/hooks/use-theme-mode";

export default function ThemeSelector() {
  const { mode, selectTheme } = useThemeMode();
  const ThemeIcon = mode === "light" ? IconSun : mode === "dark" ? IconMoon : IconDeviceDesktop;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="[&>svg:last-child]:rotate-90">
        <ThemeIcon />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(value) => selectTheme(value as ThemeMode)}
        >
          <DropdownMenuRadioItem value="light">
            <IconSun />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <IconMoon />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="auto">
            <IconDeviceDesktop />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
