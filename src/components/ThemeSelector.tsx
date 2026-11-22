import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "#/components/ui/dropdown-menu";
import { useThemeMode, type ThemeMode } from "#/hooks/use-theme-mode";

export default function ThemeSelector() {
  const { mode, selectTheme } = useThemeMode();

  return (
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
  );
}
