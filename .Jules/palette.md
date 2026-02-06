## 2024-05-22 - Form Accessibility Pattern
**Learning:** The app relied heavily on `placeholder` attributes for question prompts in the journaling form. This compromises accessibility and context retention when typing.
**Action:** Replace placeholders with visible `<label>` elements linked via `for`/`id` attributes for all form inputs.

## 2026-01-29 - Modal Focus Management
**Learning:** Manually toggling visibility (via `hidden` class) for modals fails to manage focus, leaving keyboard users lost.
**Action:** When implementing custom modals, always capture `document.activeElement` on open, focus the modal/close button, and restore focus on close. Also bind `Escape` key.

## 2026-01-30 - Empty State Guidance
**Learning:** Empty lists in the 'History' view caused confusion, appearing broken or loading indefinitely. A blank state provides no direction.
**Action:** Always implement a friendly empty state for lists, distinguishing between "no data ever" (onboarding opportunity) and "no matching data" (filter feedback).

## 2026-01-31 - Div Buttons Anti-Pattern
**Learning:** The History list items were implemented as `div`s with `onclick`, making them invisible to keyboard navigation. This blocks core functionality for keyboard users.
**Action:** Always use `<button>` for interactive elements, or if `div` is necessary for layout, ensure `role="button"`, `tabindex="0"`, and `onkeydown` (Enter/Space) are implemented.

## 2026-02-01 - Blocking Alerts vs Inline Feedback
**Learning:** Using `alert()` for save confirmation disrupts the user flow and feels dated. It blocks interaction until dismissed.
**Action:** Replace blocking alerts with inline button feedback (loading state -> success state) to provide a smoother, more modern experience while preventing double-submission.

## 2026-02-02 - Stateful Button Feedback
**Learning:** When using temporary button states (like error messages), hardcoding the "restore" text/classes creates technical debt if the HTML changes.
**Action:** Dynamically capture the element's `textContent` and `className` before modification, or use data attributes (`data-original-text`) to store the state for restoration.

## 2026-02-04 - ARIA Tab Pattern
**Learning:** The previous button-based navigation lacked semantic meaning for assistive technology, making the relationship between tabs and content unclear.
**Action:** Adopt the standard WAI-ARIA Tab pattern: use `role="tablist/tab/tabpanel"`, manage `aria-selected` and `tabindex` dynamically, and support arrow key navigation.

## 2026-02-05 - Auto-expanding Inputs
**Learning:** Fixed-height textareas with scrollbars create visual friction and hide context when writing long entries.
**Action:** Implement auto-resizing textareas that grow with content to maintain visibility and improve the writing experience.

## 2026-02-06 - Modal Focus Trapping
**Learning:** Simply restoring focus on close is not enough; keyboard users can still tab out of an open modal into the background, violating WCAG standards.
**Action:** Implement a `trapFocus` handler that listens for `Tab`/`Shift+Tab` to cycle focus within the modal boundaries, and attach/detach it with the modal's visibility.
