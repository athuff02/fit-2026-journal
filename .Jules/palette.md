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

## 2026-02-17 - Contextual Form Prompts
**Learning:** Generic form questions (e.g., "Why does this matter?") create cognitive distance, requiring users to mentally bridge the gap to the current context.
**Action:** Dynamically update label text to include the specific context (e.g., "Why does Health/Fitness matter?"), reducing cognitive load and making prompts immediately actionable.

## 2026-02-18 - Export Action Feedback
**Learning:** Browser-native download actions are invisible within the app, leaving users uncertain if the export process has started or failed.
**Action:** Implement explicit button state feedback (e.g., "Exported!" + success color) for download actions to confirm successful initiation and improve confidence.

## 2026-02-19 - Skip Link Focus Management
**Learning:** Simply adding an anchor to a content ID isn't enough for robust keyboard navigation; the target container needs `tabindex="-1"` to ensure focus is programmatically moved to it.
**Action:** Always add `tabindex="-1"` to the target of a "Skip to content" link, and wrap the primary content area in a semantic `<main>` tag.

## 2026-02-21 - System Event Visibility
**Learning:** Background system events (like auto-restoring drafts or background saves) and destructive actions (like deletion) often happen silently, leaving users uncertain if the action completed.
**Action:** Implement a centralized Toast notification system to provide clear, transient visual confirmation for all significant system actions, ensuring users are always informed without cluttering the UI.

## 2026-02-23 - Focus Ring Visibility
**Learning:** Default `:focus` rings on buttons appear on mouse click, creating visual noise and often leading designers to remove outlines entirely, hurting keyboard accessibility.
**Action:** Replace `focus:ring` with `focus-visible:ring` for buttons to show focus indicators only when navigating via keyboard, while maintaining a clean UI for mouse users. Ensure elements relying on background changes for focus (like tabs) get an explicit ring for better visibility.

## 2026-02-25 - Icon Button Contrast & Tooltips
**Learning:** Light gray icons (text-gray-400) on white backgrounds fail WCAG AA contrast requirements and lack affordance. Icon-only buttons also confuse mouse users without hover explanations.
**Action:** Enforce minimum `text-gray-600` for icons on light backgrounds to ensure 4.5:1+ contrast, and always include `title` attributes alongside `aria-label` to provide tooltips for mouse users.

## 2026-02-27 - Non-Blocking Permission Feedback
**Learning:** Using blocking `alert()` dialogs for system permission denials (like Notifications) is jarring and halts all user interaction, feeling aggressive rather than helpful.
**Action:** Replace blocking alerts with non-intrusive Toast notifications (e.g., `announce(msg, {type: 'error'})`) to inform users of permission issues without disrupting their workflow.

## 2026-02-28 - Consistent Hover States & Transitions
**Learning:** Interactive elements like buttons feel stiff and unresponsive without clear visual feedback on hover. Relying solely on focus rings or click states leaves mouse users unsure if an element is active.
**Action:** Add `hover:` states (e.g., `hover:bg-gray-800`, `hover:bg-gray-50`) and `transition-colors` to all interactive buttons. When toggling states via JS (like a 'Saving...' button), ensure these hover/transition classes are correctly removed and re-added to prevent visual bugs.
