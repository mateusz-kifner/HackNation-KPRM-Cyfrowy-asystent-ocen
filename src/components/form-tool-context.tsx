import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type FormToolContextValue = {
	registerForm: (name: string, form: HTMLFormElement | null) => void;
	getFormState: () => { form: string; fields: Record<string, string | string[]> } | { error: string };
	selectField: (name: string) => { success: boolean; field?: string; error?: string };
	highlightedField: string | null;
};

const FormToolContext = createContext<FormToolContextValue | null>(null);

export function FormToolProvider({ children }: { children: ReactNode }) {
	const forms = useRef(new Map<string, HTMLFormElement>());
	const [highlightedField, setHighlightedField] = useState<string | null>(null);
	const registerForm = useCallback((name: string, form: HTMLFormElement | null) => {
		if (form) {
			forms.current.delete(name);
			forms.current.set(name, form);
		}
		else forms.current.delete(name);
	}, []);
	const getFormState = useCallback(() => {
		const entry = [...forms.current.entries()].reverse().find(([, form]) => form.isConnected);
		if (!entry) return { error: "There is no active form on this page." };
		const [name, form] = entry;
		const fields: Record<string, string | string[]> = {};
		for (const element of Array.from(form.elements)) {
			if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) continue;
			if (!element.name || element.disabled || element.type === "password" || (element instanceof HTMLInputElement && ["submit", "button", "reset", "file"].includes(element.type))) continue;
			if (element instanceof HTMLInputElement && ["checkbox", "radio"].includes(element.type) && !element.checked) continue;
			const value = element.value;
			const current = fields[element.name];
			if (current === undefined) fields[element.name] = value;
			else if (Array.isArray(current)) current.push(value);
			else fields[element.name] = [current, value];
		}
		return { form: name, fields };
	}, []);
	const selectField = useCallback((name: string) => {
		for (const form of forms.current.values()) {
			if (!form.isConnected) continue;
			const field = Array.from(form.elements).find(
				(element) =>
					element instanceof HTMLElement &&
					!(element instanceof HTMLInputElement && element.type === "hidden") &&
					(element.getAttribute("name") === name || element.id === name),
			) ?? form.querySelector<HTMLElement>(`[role="combobox"][id="${CSS.escape(name)}"]`);
			if (!(field instanceof HTMLElement)) continue;
			setHighlightedField(name);
			field.setAttribute("data-ai-highlight", "true");
			field.focus({ preventScroll: true });
			field.scrollIntoView({ behavior: "smooth", block: "center" });
			return { success: true, field: name };
		}
		return { success: false, error: `No active form field named "${name}" was found.` };
	}, []);
	const value = useMemo(() => ({ registerForm, getFormState, selectField, highlightedField }), [registerForm, getFormState, selectField, highlightedField]);
	return <FormToolContext.Provider value={value}>{children}</FormToolContext.Provider>;
}

export function useFormToolContext() {
	const context = useContext(FormToolContext);
	if (!context) throw new Error("useFormToolContext must be used inside FormToolProvider");
	return context;
}

export function useFormTool(name: string) {
	const { registerForm } = useFormToolContext();
	const setFormRef = useCallback((form: HTMLFormElement | null) => registerForm(name, form), [name, registerForm]);
	return setFormRef;
}
