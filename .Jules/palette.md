## 2024-05-22 - Form Accessibility Pattern
**Learning:** The app relied heavily on `placeholder` attributes for question prompts in the journaling form. This compromises accessibility and context retention when typing.
**Action:** Replace placeholders with visible `<label>` elements linked via `for`/`id` attributes for all form inputs.
