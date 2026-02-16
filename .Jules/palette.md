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

## 2026-02-07 - Data Persistence UX
**Learning:** In long-form input contexts (journaling), relying solely on manual saving risks data loss from accidental navigation or crashes, causing high user frustration.
**Action:** Implement invisible auto-saving to `localStorage` on input events, restoring state seamlessly on load, and clearing only upon successful submission.

## 2026-02-08 - Destructive Action Patterns
**Learning:** Using browser-native `confirm()` dialogs interrupts the flow and feels disjointed from the UI. However, accidental deletions must be prevented.
**Action:** Implement a two-step confirmation on the button itself (e.g., "Delete" -> "Confirm Delete?"). Crucially, manage focus post-deletion: if the deleted element was the focus trigger, programmatically move focus to a stable, nearby element (like a filter or container) to prevent context loss.

## 2026-02-11 - Responsive Shortcut Hints
**Learning:** Keyboard shortcut hints clutter the UI on mobile devices where physical keyboards are rare.
**Action:** Use responsive utility classes (e.g., `hidden sm:inline`) to show shortcut hints only on larger viewports where keyboard usage is likely.

## 2026-02-12 - Error State Dismissal
**Learning:** User frustration increases when UI components remain in an error state after the user has started correcting the input.
**Action:** Implement immediate dismissal of error states (e.g., reset button color/text) as soon as the user interacts with the relevant input, rather than waiting for a timeout or re-submission.

## 2026-02-13 - Hover State Overrides
**Learning:** When providing temporary visual feedback (like success colors) on elements with strong `:hover` styles (e.g., `hover:text-gray-900`), the hover state can mask the feedback if the cursor remains over the element.
**Action:** Use Tailwind's `!` prefix (e.g., `!text-green-600`) when applying temporary feedback classes via JavaScript to ensure the feedback color takes precedence over the hover state.

## 2026-02-14 - Actionable Empty States
**Learning:** A "No entries found" message is a dead end that leaves users wondering what to do next.
**Action:** Enhance empty states with a primary Call-to-Action (CTA) that guides the user to the most likely next step (e.g., "Write Today's Entry"), improving flow and engagement.

## 2026-02-16 - Smooth State Reset vs Reload
**Learning:** Using `location.reload()` to reset form state is jarring and disrupts the user experience, making the app feel "clunky".
**Action:** Implement "soft resets" where data is re-fetched and UI elements (inputs, buttons, stats) are programmatically reset. Only use full reload when necessary (e.g., date change across midnight).
