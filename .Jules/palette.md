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
