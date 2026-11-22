import {
	AlignmentType,
	BorderStyle,
	Document,
	HeadingLevel,
	Packer,
	Paragraph,
	Table,
	TableCell,
	TableRow,
	TextRun,
	WidthType,
} from "docx";
import type {
	assessmentFileCriteria,
	assessmentFiles,
	assessments,
} from "#/db/schema";

type Assessment = typeof assessments.$inferSelect;
type AssessmentFile = typeof assessmentFiles.$inferSelect;
type Criterion = typeof assessmentFileCriteria.$inferSelect;

const labels = {
	far_below_expectations: "Znacznie poniżej oczekiwań",
	below_expectations: "Poniżej oczekiwań",
	meets_expectations: "Na poziomie oczekiwań",
	above_expectations: "Powyżej oczekiwań",
	far_above_expectations: "Znacznie powyżej oczekiwań",
	positive: "Pozytywna",
	negative: "Negatywna",
	civil_service_official: "Urzędnik służby cywilnej",
	civil_service_employee: "Pracownik służby cywilnej",
} as const;

function display(value: string | number | Date | null | undefined) {
	if (value == null || value === "") return "—";
	if (value instanceof Date) return value.toLocaleDateString("pl-PL");
	if (typeof value === "number") return String(value);
	return labels[value as keyof typeof labels] ?? value;
}

function date(value: Date | null | undefined) {
	return value ? value.toLocaleDateString("pl-PL") : "—";
}

function section(title: string) {
	return new Paragraph({
		text: title,
		heading: HeadingLevel.HEADING_2,
		spacing: { before: 260, after: 120 },
	});
}

function fieldTable(
	fields: [string, string | number | Date | null | undefined][],
) {
	return new Table({
		width: { size: 100, type: WidthType.PERCENTAGE },
		rows: fields.map(
			([label, value]) =>
				new TableRow({
					children: [
						new TableCell({
							width: { size: 38, type: WidthType.PERCENTAGE },
							children: [new Paragraph({ text: label })],
						}),
						new TableCell({
							width: { size: 62, type: WidthType.PERCENTAGE },
							children: [new Paragraph({ text: display(value) })],
						}),
					],
				}),
		),
		borders: {
			top: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			bottom: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			left: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			right: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
		},
	});
}

function criteriaTable(criteria: Criterion[]) {
	const header = ["Kryterium", "Opis / oczekiwania", "Punkty", "Komentarz"];
	const rows = [
		new TableRow({
			tableHeader: true,
			children: header.map(
				(text) =>
					new TableCell({
						shading: { fill: "EEF2F7" },
						children: [new Paragraph({ text, alignment: AlignmentType.LEFT })],
					}),
			),
		}),
		...criteria.map(
			(criterion) =>
				new TableRow({
					cantSplit: true,
					children: [
						criterion.title,
						[
							criterion.description,
							criterion.duties,
							criterion.expectations,
							criterion.goals,
							criterion.measurementMethod,
						]
							.filter(Boolean)
							.join("\n"),
						criterion.points == null ? "—" : `${criterion.points} / 9`,
						criterion.comment ?? "",
					].map(
						(text) => new TableCell({ children: [new Paragraph({ text })] }),
					),
				}),
		),
	];
	return new Table({
		width: { size: 100, type: WidthType.PERCENTAGE },
		columnWidths: [2600, 4200, 1000, 2200],
		rows,
		borders: {
			top: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			bottom: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			left: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			right: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
			insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D9DEE7" },
		},
	});
}

/** Builds a printable assessment sheet from the form fields and stored criteria. */
export async function generateAssessmentDocx(
	assessment: Assessment,
	file: AssessmentFile | null,
	criteria: Criterion[],
) {
	const form = assessment.form ?? "—";
	const sortedCriteria = [...criteria].sort(
		(a, b) => a.sortOrder - b.sortOrder,
	);
	const content: (Paragraph | Table)[] = [
		new Paragraph({
			text: `ARKUSZ ${form}`,
			heading: HeadingLevel.TITLE,
			alignment: AlignmentType.CENTER,
		}),
		new Paragraph({
			text: "OCENA OKRESOWA URZĘDNIKA SŁUŻBY CYWILNEJ LUB PRACOWNIKA SŁUŻBY CYWILNEJ",
			alignment: AlignmentType.CENTER,
			spacing: { after: 300 },
		}),
		section("CZĘŚĆ I — DANE I KRYTERIA"),
		fieldTable([
			["Nazwa urzędu", file?.agencyName],
			["Imię ocenianego", file?.evaluatedFirstName],
			["Nazwisko ocenianego", file?.evaluatedLastName],
			["Typ ocenianego", file?.evaluatedPersonType],
			["Stanowisko", file?.evaluatedPosition],
			["Komórka organizacyjna", file?.evaluatedOrganizationalUnit],
			[
				"Imię i nazwisko oceniającego",
				[file?.evaluatorFirstName, file?.evaluatorLastName]
					.filter(Boolean)
					.join(" "),
			],
			["Stanowisko oceniającego", file?.evaluatorPosition],
			["Komórka organizacyjna oceniającego", file?.evaluatorOrganizationalUnit],
			["Termin sporządzenia oceny", assessment.dueAt],
			["Miejsce rozmowy o kryteriach", file?.criteriaDiscussionLocation],
			["Data rozmowy o kryteriach", file?.criteriaDiscussionDate],
			[
				"Oceniający potwierdzający rozmowę o kryteriach",
				file?.criteriaDiscussionEvaluatorName,
			],
			[
				"Oceniany potwierdzający rozmowę o kryteriach",
				file?.criteriaDiscussionEmployeeName,
			],
		]),
		section("CZĘŚĆ II — OCENA OKRESOWA"),
		fieldTable([
			["Data rozmowy oceniającej", file?.assessmentDiscussionDate],
			["Okres oceny od", file?.assessmentPeriodStart ?? assessment.periodStart],
			["Okres oceny do", file?.assessmentPeriodEnd ?? assessment.periodEnd],
			[
				"Średnia punktów",
				file?.averagePoints == null
					? null
					: Number(file.averagePoints.toFixed(2)),
			],
			["Poziom oceny", file?.overallLevel],
			["Wynik", file?.overallOutcome],
		]),
		section("KRYTERIA OCENY I OCENY CZĄSTKOWE"),
		criteriaTable(sortedCriteria),
		section("UZASADNIENIE I ROZWÓJ"),
		new Paragraph({
			children: [
				new TextRun({ text: "Uzasadnienie przyznanej oceny", bold: true }),
			],
			spacing: { before: 100 },
		}),
		new Paragraph({
			text: file?.assessmentRationale ?? "—",
			spacing: { after: 150 },
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: "Wnioski dotyczące indywidualnego programu rozwoju zawodowego",
					bold: true,
				}),
			],
		}),
		new Paragraph({
			text: file?.developmentPlanRecommendations ?? "—",
			spacing: { after: 150 },
		}),
		section("INFORMACJE DODATKOWE"),
		fieldTable([
			["Poprzedni wynik oceny", file?.previousAssessmentOutcome],
			["Poprzedni poziom oceny", file?.previousAssessmentLevel],
			["Data poprzedniej oceny", file?.previousAssessmentDate],
			["Wniosek o kolejny stopień służbowy", file?.promotionApplication],
			["Rok mianowania", file?.civilServiceAppointmentYear],
			["Posiadany stopień służbowy", file?.currentCivilServiceGrade],
			["Data przyznania stopnia", file?.currentGradeGrantedAt],
			["Wnioskowany stopień", file?.requestedCivilServiceGrade],
			["Uzasadnienie wniosku", file?.promotionApplicationRationale],
			["Miejscowość wniosku", file?.promotionApplicationLocation],
			["Data wniosku", file?.promotionApplicationDate],
			[
				"Oceniający składający wniosek",
				file?.promotionApplicationEvaluatorName,
			],
		]),
		new Paragraph({ text: "", pageBreakBefore: true }),
		section("PODPISY I POTWIERDZENIA"),
		fieldTable([
			["Miejscowość podpisu oceniającego", file?.evaluatorSignatureLocation],
			["Data podpisu oceniającego", file?.evaluatorSignedAt],
			["Data oceny", assessment.assessmentDate],
			["Miejscowość potwierdzenia odbioru", file?.employeeReceiptLocation],
			["Data potwierdzenia odbioru", file?.employeeAcknowledgedAt],
			["Imię i nazwisko odbiorcy", file?.employeeReceiptName],
			["Odbiorca sprzeciwu", file?.objectionRecipient],
		]),
		new Paragraph({
			text: "\n\n........................................................\nPodpis oceniającego",
			alignment: AlignmentType.CENTER,
			spacing: { before: 400, after: 250 },
		}),
		new Paragraph({
			text: "\n\n........................................................\nPodpis ocenianego",
			alignment: AlignmentType.CENTER,
		}),
		new Paragraph({
			text: `Wygenerowano: ${date(new Date())}`,
			alignment: AlignmentType.RIGHT,
			spacing: { before: 300 },
		}),
	];
	const document = new Document({
		sections: [{ properties: {}, children: content }],
		styles: {
			default: {
				document: { run: { font: "Arial", size: 20 } },
			},
		},
	});
	return Packer.toBuffer(document);
}
