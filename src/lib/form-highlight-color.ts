const basicTailwindColors = {
	red: "red-700",
	orange: "orange-700",
	yellow: "yellow-700",
	green: "green-700",
	blue: "blue-700",
	purple: "purple-700",
	pink: "pink-700",
	gray: "gray-700",
	black: "gray-950",
	white: "gray-50",
} as const;

export function resolveFormHighlightColor(color: string) {
	const normalized = color.trim().toLowerCase();
	const tailwindColor = basicTailwindColors[normalized as keyof typeof basicTailwindColors]
		?? Object.values(basicTailwindColors).find((shade) => shade === normalized);
	if (tailwindColor) {
		return { label: tailwindColor, cssValue: `var(--color-${tailwindColor})` };
	}
	if (CSS.supports("color", normalized)) {
		return { label: color.trim(), cssValue: color.trim() };
	}
	return null;
}
