type PageContext = {
	title: string;
	description: string;
};

const pageContexts: Record<string, PageContext> = {
	"/": {
		title: "Home",
		description: "Starter landing page with a welcome message. It has no business data or lists.",
	},
	"/login": {
		title: "Sign in",
		description: "Authentication page for signing in to the application.",
	},
	"/me": {
		title: "My evaluations",
		description: "Lists assessments of the signed-in employee's work. The table shows form, status, assessment period, assessment date, due date, and a downloadable document. Selecting a form opens its evaluation details. The list may be loading, empty, or unavailable if the request fails.",
	},
	"/settings": {
		title: "Settings",
		description: "Currently a placeholder settings page; it contains no settings controls or data lists.",
	},
	"/evaluation": {
		title: "Evaluations",
		description: "Lists assessments assigned to the signed-in user. The list includes all statuses and is categorized as current, upcoming, or archived in its status logic. Columns show evaluated employee and organizational unit, position, form, status, period, assessment date, due date, and document download. Managers and admins can start a new evaluation. Selecting an employee opens evaluation details.",
	},
	"/evaluation/add": {
		title: "Add evaluation",
		description: "Form for creating an assessment. It includes evaluated employee and evaluator selection, form type, assessment and period dates, due date, agency and organizational details, and discussion details. Employee candidates are loaded for the person selectors. Available only to managers and admins.",
	},
	"/users": {
		title: "User accounts",
		description: "Admin-only account directory. Search matches name, email, and department; a role filter can show all roles, employees, managers, or admins. Rows show name, email, role, position, department or organizational unit, hire date, and edit/delete actions. The signed-in admin cannot delete their own account. Add user opens the account creation form.",
	},
	"/users/new": {
		title: "Add user account",
		description: "Admin-only account creation form with name, email, password, role, position, department, organizational unit, employment status and type, and hire date.",
	},
	"/users/edit": {
		title: "Edit user account",
		description: "Admin-only form for editing the account identified by the path. Shows the account ID and editable profile, role, employment, and organization fields. The password is not displayed as editable profile data.",
	},
	"/admin": {
		title: "Admin dashboard",
		description: "Administrative dashboard placeholder with no dashboard cards or data lists currently rendered.",
	},
	"/admin/users": {
		title: "User accounts",
		description: "Admin-only account directory. Search matches name, email, and department; a role filter can show all roles, employees, managers, or admins. Rows show name, email, role, position, department or organizational unit, hire date, and edit/delete actions. The signed-in admin cannot delete their own account. Add user opens the account creation form.",
	},
	"/admin/users/new": {
		title: "Add user account",
		description: "Admin-only account creation form with name, email, password, role, position, department, organizational unit, employment status and type, and hire date.",
	},
	"/admin/employees": {
		title: "Employees",
		description: "Administrative employee table with ID, name, email, position, department, hire date, and a delete action for each row.",
	},
	"/admin/ai-settings": {
		title: "AI settings",
		description: "Shows a model service endpoint selector with OpenAI, local Ollama, and custom endpoint options. The selector is disabled; this page is a UI preview and does not save or affect model requests.",
	},
	"/test": {
		title: "Component test index",
		description: "Development page linking to UI component demonstration pages; it is not application business data.",
	},
	"/test/shadcn": {
		title: "UI component showcase",
		description: "Development showcase of UI components and interaction examples, not application business data.",
	},
};

const evaluationDetailContext: PageContext = {
	title: "Evaluation details",
	description: "Shows one assessment, including employee, status, position, organizational unit, evaluator, form, period and assessment dates, due date, overall outcome and level, average points, rationale, and development recommendations. The Evaluation criteria section lists each criterion with its points, description, duties, expectations, goals, measurement method, and comment. A document download is available when the evaluation is loaded.",
};

export function getPageContext(pathname: string): PageContext {
	const normalizedPath = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
	if (["/evaluation/completed", "/evaluation/running", "/evaluation/upcoming"].includes(normalizedPath)) {
		return pageContexts["/evaluation"];
	}
	if (normalizedPath.startsWith("/evaluation/") && normalizedPath !== "/evaluation/add") {
		return evaluationDetailContext;
	}
	if (normalizedPath.startsWith("/users/edit/") || normalizedPath.startsWith("/admin/users/edit/")) {
		return pageContexts["/users/edit"];
	}
	const pagePath = normalizedPath.startsWith("/admin/users")
		? normalizedPath.replace("/admin/users", "/users")
		: normalizedPath;
	return pageContexts[pagePath] ?? pageContexts[normalizedPath] ?? {
		title: "Application page",
		description: "No additional page-specific summary is registered yet. Use the current path and the user's request to understand the page.",
	};
}
