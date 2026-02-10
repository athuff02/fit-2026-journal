from playwright.sync_api import sync_playwright
import time

def screenshot_delete_feature(page):
    print("Navigating to app...")
    page.goto("http://localhost:8000/index.html")

    # Handle alert
    page.on("dialog", lambda dialog: dialog.accept())

    print("Filling form...")
    page.fill("#q1", "Screenshot test entry")
    page.fill("#actionItem", "Screenshot Action")

    print("Submitting...")
    with page.expect_navigation():
        page.click("button:has-text('Save Entry')")

    print("Entry saved and page reloaded.")

    # Switch to History
    print("Switching to History tab...")
    page.click("#historyTab")

    # Wait for history list to render
    page.wait_for_selector("#historyList button")

    # Open the entry
    print("Opening entry...")
    page.click("#historyList button:first-child")

    # Wait for modal
    page.wait_for_selector("#modal:not(.hidden)")

    # Click Delete to show confirmation
    print("Clicking Delete to show confirmation state...")
    page.click("#deleteBtn")

    # Wait for text change
    page.wait_for_function("document.getElementById('deleteBtn').textContent.includes('Confirm')")

    # Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/delete_confirmation.png")
    print("Screenshot saved to verification/delete_confirmation.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            screenshot_delete_feature(page)
        except Exception as e:
            print(f"Failed: {e}")
            exit(1)
        browser.close()
