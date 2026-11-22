import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ChatbotWindowState } from "./use-chatbot-window-state";

const MIN_WIDTH = 320;
const MIN_HEIGHT = 280;

/** Resizes the floating chatbot from its lower edge and keeps it in the viewport. */
export function useChatbotResize(
	enabled: boolean,
	windowState: ChatbotWindowState,
	setWindowState: React.Dispatch<React.SetStateAction<ChatbotWindowState>>,
) {
	const start = useRef<{
		pointerId: number;
		x: number;
		y: number;
		width: number;
		height: number;
		windowX: number;
		windowY: number;
	} | null>(null);

	const onPointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (!enabled) return;
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
			start.current = {
				pointerId: event.pointerId,
				x: event.clientX,
				y: event.clientY,
				width:
					event.currentTarget.parentElement?.getBoundingClientRect().width ??
					420,
				height:
					event.currentTarget.parentElement?.getBoundingClientRect().height ??
					640,
				windowX: windowState.x,
				windowY: windowState.y,
			};
		},
		[enabled, windowState.x, windowState.y],
	);

	const onPointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			const initial = start.current;
			if (!enabled || !initial || initial.pointerId !== event.pointerId) return;

			const width = Math.min(
				window.innerWidth * 0.9,
				Math.max(MIN_WIDTH, initial.width + event.clientX - initial.x),
			);
			const height = Math.min(
				window.innerHeight - 32,
				Math.max(MIN_HEIGHT, initial.height + event.clientY - initial.y),
			);

			setWindowState((current) => ({
				...current,
				width,
				height,
				// The window is positioned relative to the viewport's lower-right corner.
				// Shift its offset by the size delta so the top-left corner stays put.
				x: initial.windowX + width - initial.width,
				y: initial.windowY + height - initial.height,
			}));
		},
		[enabled, setWindowState],
	);

	const onPointerEnd = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (start.current?.pointerId === event.pointerId) start.current = null;
		},
		[],
	);

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp: onPointerEnd,
		onPointerCancel: onPointerEnd,
	};
}
