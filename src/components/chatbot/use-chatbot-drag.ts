import { useCallback, useRef } from "react";
import { useMove, type UseMovePosition } from "@mantine/hooks";
import type { ChatbotWindowState } from "./use-chatbot-window-state";

/** Adds pointer-based dragging to the floating chatbot's title area. */
export function useChatbotDrag(
	enabled: boolean,
	setWindowState: React.Dispatch<React.SetStateAction<ChatbotWindowState>>,
) {
	const moveSurface = useRef<HTMLDivElement | null>(null);
	const chatbotWindow = useRef<HTMLDivElement | null>(null);
	const previousPosition = useRef<UseMovePosition | null>(null);

	const snapBackIntoViewport = useCallback(() => {
		if (!enabled || !chatbotWindow.current) return;

		window.requestAnimationFrame(() => {
			const bounds = chatbotWindow.current?.getBoundingClientRect();
			if (!bounds) return;

			const horizontalCorrection =
				bounds.width >= window.innerWidth
					? -bounds.left
					: bounds.left < 0
						? -bounds.left
						: bounds.right > window.innerWidth
							? window.innerWidth - bounds.right
							: 0;
			const verticalCorrection =
				bounds.height >= window.innerHeight
					? -bounds.top
					: bounds.top < 0
						? -bounds.top
						: bounds.bottom > window.innerHeight
							? window.innerHeight - bounds.bottom
							: 0;

			if (horizontalCorrection || verticalCorrection) {
				setWindowState((current) => ({
					...current,
					x: current.x + horizontalCorrection,
					y: current.y + verticalCorrection,
				}));
			}
		});
	}, [enabled, setWindowState]);

	const handleMove = useCallback(
		(position: UseMovePosition) => {
			if (!enabled) return;
			if (!previousPosition.current) {
				previousPosition.current = position;
				return;
			}

			const previous = previousPosition.current;
			setWindowState((current) => ({
				...current,
				x: current.x + (position.x - previous.x) * window.innerWidth,
				y: current.y + (position.y - previous.y) * window.innerHeight,
			}));
			previousPosition.current = position;
		},
		[enabled, setWindowState],
	);

	const { ref: moveRef, active } = useMove(handleMove, {
		onScrubStart: () => {
			previousPosition.current = null;
		},
		onScrubEnd: () => {
			previousPosition.current = null;
			snapBackIntoViewport();
		},
	});

	const ref = useCallback(
		(element: HTMLDivElement | null) => {
			moveSurface.current = element;
			moveRef(element);
		},
		[moveRef],
	);

	const windowRef = useCallback((element: HTMLDivElement | null) => {
		chatbotWindow.current = element;
	}, []);

	const startDragWithMouse = useCallback(
		(event: React.MouseEvent) => {
			if (!enabled || !moveSurface.current) return;
			event.preventDefault();
			moveSurface.current.dispatchEvent(
				new MouseEvent("mousedown", {
					clientX: event.clientX,
					clientY: event.clientY,
					bubbles: false,
					cancelable: true,
				}),
			);
		},
		[enabled],
	);

	const startDragWithTouch = useCallback(
		(event: React.TouchEvent) => {
			if (!enabled || !moveSurface.current) return;
			const touch = event.changedTouches[0];
			if (!touch) return;
			event.preventDefault();
			const syntheticEvent = new Event("touchstart", { cancelable: true });
			Object.defineProperty(syntheticEvent, "changedTouches", {
				value: [{ clientX: touch.clientX, clientY: touch.clientY }],
			});
			moveSurface.current.dispatchEvent(syntheticEvent);
		},
		[enabled],
	);

	return {
		ref,
		windowRef,
		active: enabled && active,
		startDragWithMouse,
		startDragWithTouch,
	};
}
