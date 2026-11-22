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

const tailwindHexColors: Record<(typeof basicTailwindColors)[keyof typeof basicTailwindColors], string> = {
	"red-700": "#c10007",
	"orange-700": "#ca3500",
	"yellow-700": "#a65f00",
	"green-700": "#008236",
	"blue-700": "#1447e6",
	"purple-700": "#8200db",
	"pink-700": "#c6005c",
	"gray-700": "#364153",
	"gray-950": "#030712",
	"gray-50": "#f9fafb",
};

export function resolveFormHighlightColor(color: string) {
	const normalized = color.trim().toLowerCase();
	const tailwindColor = basicTailwindColors[normalized as keyof typeof basicTailwindColors]
		?? Object.values(basicTailwindColors).find((shade) => shade === normalized);
	if (tailwindColor) {
		return { label: tailwindColor, cssValue: tailwindHexColors[tailwindColor] };
	}
	if (CSS.supports("color", normalized)) {
		return { label: color.trim(), cssValue: color.trim() };
	}
	return null;
}
