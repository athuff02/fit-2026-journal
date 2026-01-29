## 2024-05-22 - Form Accessibility Pattern
**Learning:** The app relied heavily on `placeholder` attributes for question prompts in the journaling form. This compromises accessibility and context retention when typing.
**Action:** Replace placeholders with visible `<label>` elements linked via `for`/`id` attributes for all form inputs.

## 2026-01-29 - Modal Focus Management
**Learning:** Manually toggling visibility (via `hidden` class) for modals fails to manage focus, leaving keyboard users lost.
**Action:** When implementing custom modals, always capture `document.activeElement` on open, focus the modal/close button, and restore focus on close. Also bind `Escape` key.
