## 2026-02-20 - Toast Notifications
**Learning:** Sighted users often miss background system actions (like auto-restoring drafts or errors) that are announced to screen readers.
**Action:** Always couple visual "Toasts" with `aria-live` announcements for system-level feedback, while allowing suppression for redundant button-based feedback.
