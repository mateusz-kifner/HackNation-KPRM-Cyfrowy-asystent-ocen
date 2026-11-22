# Project Goals — Implementation Checklist

> **Implementation rule: All implementations MUST follow `AGENTS.md`.**
> **Progress note:** A checked item means its underlying schema and/or server API is implemented; it does not imply a finished UI. Screens, notifications, exports, and review workflows remain outstanding where not implemented.

## Recommended implementation order for a fast MVP

1. Admin user CRUD and assignment of the three account roles.
2. The assessment data model and the evaluator/employee assessment flow. Manually assign the evaluator for the first evaluation.
3. Manager HR operations, evaluator appointment, and assessment oversight.
4. Complete remaining assessment workflows, notifications, exports, reporting, and record lifecycle actions.

All checklist items are intended to be completed today. This order is a suggested sequence for getting an end-to-end assessment flow working early; it does not defer or remove any item.

## Account and assessment model

- [x] Use exactly three account roles: `Employee`, `Manager`, and `Admin`.
- [x] Represent `Evaluator` and `Evaluated employee` as per-assessment responsibilities, not account roles or user properties.
- [x] Store each assessment in a separate assessment record/table, with references to the evaluator and evaluated user and the assessment-specific data. Do not store assessment criteria, ratings, or assessment details on the user record.
- [x] Allow any of the three account roles to be assigned as evaluator or evaluated employee on an assessment.
- [x] Prevent the same user from being both evaluator and evaluated employee on one assessment.
- [x] Prevent an evaluated employee from selecting or appointing their own evaluator.
- [x] Allow assigned evaluators to create and edit their assessment data; allow authorized Admin actions to edit assessment data. Evaluated employees can view and acknowledge participation but cannot edit assessment criteria, ratings, or details.

## 1. Employee

An Employee account may be an evaluated employee or may be assigned as evaluator for another user's assessment. The following evaluated-employee capabilities apply when the account is the evaluated person in an assessment.

- [x] View my assessment
  1. [x] View assessment status, assessment period, assigned evaluator, due dates, and next required action.
  2. [x] View the applicable form and its mandatory and selected additional criteria.
  3. [ ] View reminders, meeting invitations, deadline changes, decisions, and completed assessment notices.
  4. [x] View current and previous assessments and their history.
  5. [x] Download or print my assessment form.

- [x] Acknowledge participation in criteria-setting
  1. [x] View the evaluator's record of the criteria-setting discussion, selected criteria, and assessment date.
  2. [x] Confirm that I participated in the discussion and was informed of the criteria and assessment date.
  3. [x] Store the acknowledgement with the authenticated user's identity and timestamp in the assessment history.

- [x] Acknowledge participation in assessment discussion and receipt of result
  1. [x] View the evaluator's record of the assessment discussion and the completed assessment, including rationale when provided.
  2. [x] Confirm that I participated in the assessment discussion and have read the result.
  3. [x] Store the acknowledgement with the authenticated user's identity and timestamp; acknowledgement means participation/receipt, not agreement with the result.
  4. [x] Provide an authorized way for the evaluator to record that the employee was informed but could not or would not acknowledge receipt, including date and explanation.

- [x] Request an assessment date change
  1. [x] Submit a request with proposed date and reason.
  2. [x] View the request status and the evaluator's decision.
  3. [ ] Receive a notice when the decision changes the assessment date.

- [x] Respect assessment access boundaries
  1. [x] Do not provide controls for an evaluated employee to choose or appoint their own evaluator.
  2. [x] Do not provide controls for an evaluated employee to edit criteria, ratings, or other assessment details.

## 2. Manager

A Manager may also be assigned as evaluator or evaluated employee on an assessment. A Manager can view all assessments, but assessment editing follows the evaluator/Admin permissions above.

- [x] Manage employee HR and organizational data
  1. [x] Create and update Employee user records and their HR/profile information.
  2. [x] Edit Employee account roles only within roles below Manager (with the fixed role set, Employee is the only lower role).
  3. [x] Do not allow editing of Manager or Admin user records or assignment of Manager/Admin roles.
  4. [x] Maintain employment status/type, organizational unit, and other employee information needed by the workflow.
  5. [ ] Maintain reporting lines and effective dates.
  6. [ ] Maintain acting-substitution assignments, scopes, and effective dates.
  7. [ ] Maintain absence records and their dates/continuity where this information is in scope.
  8. [x] Search, sort, and view employee records within Manager permissions.

- [x] Appoint an evaluator to an assessment
  1. [x] Select an evaluator from eligible users; any account role may be selected.
  2. [x] Prevent assignment of the evaluated employee as their own evaluator.
  3. [x] Record who appointed the evaluator and when; preserve assignment changes in the assessment history.
  4. [x] Do not let the evaluated employee appoint or select their own evaluator.

- [x] Oversee assessments
  1. [x] View all assessments and their status, deadlines, evaluator, and evaluated employee.
  2. [x] Search and filter assessments to identify pending actions and overdue steps.
  3. [x] View assessment history and acknowledgements.
  4. [x] Do not edit criteria, ratings, or assessment details unless the Manager is the assigned evaluator for that assessment.

- [x] Act as evaluator or evaluated employee when assigned
  1. [x] When assigned as evaluator, use the shared evaluator capabilities in the section below.
  2. [x] When evaluated, use the Employee acknowledgement and view capabilities for that assessment.
  3. [x] Prevent self-evaluation on any assessment.

## 3. Admin

Admin has all Employee and Manager capabilities, may be assigned as evaluator or evaluated employee, and additionally administers users and roles. Admin actions must still preserve assessment history and prevent self-evaluation.

- [x] Manage user accounts (CRUD)
  1. [x] Create user accounts.
  2. [x] View and search all user accounts.
  3. [x] Update user profile, HR, and account data.
  4. [x] Assign one of the three supported account roles: Employee, Manager, or Admin.
  5. [x] Deactivate or delete user accounts according to the application's data-retention behavior; preserve assessment records and historical actor references.
  6. [x] Prevent invalid role assignments and record account/role changes in an audit history.

- [x] Perform authorized assessment administration
  1. [x] View all assessments and their history.
  2. [x] Edit assessment data when acting under authorized Admin permissions.
  3. [x] Preserve previous values, editor identity, timestamp, and reason for assessment changes.
  4. [x] Do not assign the same user as evaluator and evaluated employee on one assessment.

## 4. Shared evaluator capabilities

These actions are available to an account of any of the three roles only when that user is assigned as evaluator for the assessment. For the first evaluation, evaluator assignment will be performed manually.

- [x] Start and prepare an assessment
  1. [x] Open an assessment assigned to me as evaluator.
  2. [x] Select the applicable assessment form (A, B, or C) based on the assessed position.
  3. [x] Load the mandatory criteria for the selected form.
  4. [x] Select zero to three additional criteria.
  5. [x] Record the criteria-setting discussion, including duties, expectations, goals, and how goals will be measured.
  6. [ ] Send the criteria and assessment date to the evaluated employee for participation acknowledgement.
  7. [x] Edit criteria while the workflow permits it and retain a history of changes.

- [x] Conduct the assessment and record the outcome
  1. [x] Record that the assessment discussion took place.
  2. [x] Rate each mandatory and selected additional criterion using the configured scale.
  3. [x] Calculate the overall result from the criterion ratings using the configured assessment rules.
  4. [x] Enter assessment rationale where applicable.
  5. [x] Record conclusions or recommendations for the evaluated employee's development plan.
  6. [x] Submit/sign the assessment and send it to the evaluated employee for participation and result acknowledgement.
  7. [x] Correct a draft before submission; after submission, edit only through an authorized workflow while preserving history.

- [x] Process assessment date changes
  1. [x] Review and approve or reject an evaluated employee's date-change request; record the decision.
  2. [x] Update the assessment date when authorized and record the reason and prior date.
  3. [ ] Ensure the evaluated employee and other affected parties are notified of the outcome.

- [x] Handle assessment review outcomes
  1. [ ] Receive notice of an authorized decision to change or repeat an assessment.
  2. [ ] Update the assessment or create a replacement assessment as directed.
  3. [x] Preserve the original assessment, decision, and replacement/change history.
  4. [ ] Send the updated assessment to the evaluated employee for acknowledgement.

## 5. Cross-cutting implementation notes

- The three account roles are fixed for this scope. Evaluator and evaluated employee are per-assessment assignments and must not be added as account roles or stored as permanent user attributes.
- The assessment record is separate from the user record. Store evaluator/evaluated-user references and assessment-specific information (criteria, ratings, dates, discussion records, acknowledgements, result, and history) with the assessment and its related records.
- Acknowledgement is required for the evaluated employee's participation in the criteria-setting discussion and assessment discussion/result receipt. Keep acknowledgement separate from agreement or acceptance of the result.
- The evaluated employee may not select their evaluator, evaluate themself, or edit their own assessment data. The assigned evaluator can edit the assessment they are responsible for; Admin has authorized assessment-editing capability.
- Manager can appoint evaluators and view all assessments. Manager's user-data editing is limited to Employee accounts and roles below Manager. Admin can manage all user accounts and assign any of the three roles.
- Preserve audit history for user changes, evaluator assignment, criteria and rating edits, submissions, acknowledgements, date changes, and administrative changes.
- Keep the assessment workflow status and allowed actions explicit so users can see what is pending and only authorized actions can advance the workflow.
- This checklist intentionally excludes legal/regulatory validation for now, per the current project decision. Treat specific statutory calculations and regulatory edge cases as out of scope for this MVP checklist.
- Source documents reviewed: `3. Schemat procesu/Skrócony opis procesu oceny i podstawowych pojęć.docx`, `2. Przypadki użycia/use cases - opis.docx`, and `2. Przypadki użycia/use cases - warunki brzegowe.docx`.
