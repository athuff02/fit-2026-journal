from playwright.sync_api import sync_playwright
import time

def test_history_accessibility(page):
    print("Navigating to app...")
    page.goto("http://localhost:8000/index.html")

    # Handle alert
    page.on("dialog", lambda dialog: dialog.accept())

    print("Filling form...")
    page.fill("#q1", "Test answer")
    page.fill("#actionItem", "Test Action")

    print("Submitting...")
    # Expect navigation because location.reload() is called
    with page.expect_navigation():
        page.click("button:has-text('Save Entry')")

    print("Entry saved and page reloaded.")

    # Switch to History
    print("Switching to History tab...")
    page.click("#historyTab")

    # Wait for history list to render
    # We explicitly look for a BUTTON inside historyList
    page.wait_for_selector("#historyList button")

    # Check if buttons exist
    buttons = page.locator("#historyList button")
    count = buttons.count()
    print(f"Found {count} history buttons.")

    if count == 0:
        raise Exception("No history buttons found! Check if div was replaced.")

    # Focus the first button
    first_btn = buttons.first
    first_btn.focus()

    print("Focused first history item. taking screenshot...")
    page.wait_for_timeout(500) # wait for focus ring transition
    page.screenshot(path="verification/history_button_focus.png")
    print("Screenshot saved to verification/history_button_focus.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_history_accessibility(page)
        except Exception as e:
            print(f"Test failed: {e}")
            exit(1)
        browser.close()
