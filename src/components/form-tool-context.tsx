import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type FormToolContextValue = {
	registerForm: (name: string, form: HTMLFormElement | null) => void;
	getFormState: () => { form: string; fields: Record<string, string | string[]> } | { error: string };
	selectField: (name: string) => { success: boolean; field?: string; error?: string };
	editField: (name: string, value: string) => Promise<{ success: boolean; field?: string; value?: string; error?: string }>;
	setHighlightColor: (color: string) => { success: boolean; color?: string; error?: string };
	highlightedFields: string[];
};

const FormToolContext = createContext<FormToolContextValue | null>(null);

export function FormToolProvider({ children }: { children: ReactNode }) {
	const forms = useRef(new Map<string, HTMLFormElement>());
	const selectedFields = useRef(new Map<string, HTMLElement>());
	const highlightColor = useRef("var(--primary)");
	const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
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
			selectedFields.current.set(name, field);
			if (field.id) selectedFields.current.set(field.id, field);
			if (field.getAttribute("name")) selectedFields.current.set(field.getAttribute("name")!, field);
			setHighlightedFields((current) => current.includes(name) ? current : [...current, name]);
			field.style.setProperty("--ai-highlight-color", highlightColor.current);
			field.setAttribute("data-ai-highlight", "true");
			field.focus({ preventScroll: true });
			field.scrollIntoView({ behavior: "smooth", block: "center" });
			return { success: true, field: name };
		}
		return { success: false, error: `No active form field named "${name}" was found.` };
	}, []);
	const editField = useCallback(async (name: string, nextValue: string) => {
		const field = selectedFields.current.get(name);
		if (!field?.isConnected || ![...forms.current.values()].some((form) => form.contains(field))) {
			return { success: false, error: `Select the form field "${name}" before editing it.` };
		}
		if (("disabled" in field && field.disabled) || ("readOnly" in field && field.readOnly)) {
			return { success: false, error: `The selected field "${name}" is read-only.` };
		}
		if (field instanceof HTMLInputElement) {
			if (["submit", "button", "reset", "file", "hidden"].includes(field.type)) {
				return { success: false, error: `The selected field "${name}" cannot be edited.` };
			}
			if (field.type === "checkbox") {
				if (nextValue !== "true" && nextValue !== "false") return { success: false, error: "Checkbox values must be \"true\" or \"false\"." };
				Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked")?.set?.call(field, nextValue === "true");
			} else if (field.type === "radio") {
				const radios = [...(field.form?.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(field.name)}"]`) ?? [])];
				const checkedSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked")?.set;
				for (const radio of radios) checkedSetter?.call(radio, radio.value === nextValue);
				if (!radios.some((radio) => radio.value === nextValue)) return { success: false, error: `"${nextValue}" is not an available radio value.` };
			} else {
				Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(field, nextValue);
			}
			field.dispatchEvent(new Event("input", { bubbles: true }));
			field.dispatchEvent(new Event("change", { bubbles: true }));
			return { success: true, field: name, value: field.type === "checkbox" ? String(field.checked) : field.value };
		}
		if (field instanceof HTMLTextAreaElement) {
			Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(field, nextValue);
			field.dispatchEvent(new Event("input", { bubbles: true }));
			field.dispatchEvent(new Event("change", { bubbles: true }));
			return { success: true, field: name, value: field.value };
		}
		if (field instanceof HTMLSelectElement) {
			if (![...field.options].some((option) => option.value === nextValue)) return { success: false, error: `"${nextValue}" is not an available option for "${name}".` };
			Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set?.call(field, nextValue);
			field.dispatchEvent(new Event("input", { bubbles: true }));
			field.dispatchEvent(new Event("change", { bubbles: true }));
			return { success: true, field: name, value: field.value };
		}
		if (field.getAttribute("role") === "combobox") {
			field.click();
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			const option = [...document.querySelectorAll<HTMLElement>("[role=option]")].find((candidate) => candidate.dataset.value === nextValue || candidate.textContent?.trim() === nextValue);
			if (!option) return { success: false, error: `"${nextValue}" is not an available option for "${name}".` };
			option.click();
			return { success: true, field: name, value: nextValue };
		}
		return { success: false, error: `The selected field "${name}" cannot be edited.` };
	}, []);
	const setHighlightColor = useCallback((color: string) => {
		const normalizedColor = color.trim();
		if (!normalizedColor || !CSS.supports("color", normalizedColor)) {
			return { success: false, error: `"${color}" is not a valid CSS color.` };
		}
		highlightColor.current = normalizedColor;
		for (const field of new Set(selectedFields.current.values())) {
			if (field.isConnected) field.style.setProperty("--ai-highlight-color", normalizedColor);
		}
		return { success: true, color: normalizedColor };
	}, []);
	const value = useMemo(() => ({ registerForm, getFormState, selectField, editField, setHighlightColor, highlightedFields }), [registerForm, getFormState, selectField, editField, setHighlightColor, highlightedFields]);
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
