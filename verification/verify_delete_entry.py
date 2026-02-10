from playwright.sync_api import sync_playwright
import time

def test_delete_entry(page):
    print("Navigating to app...")
    page.goto("http://localhost:8000/index.html")

    # Handle alert
    page.on("dialog", lambda dialog: dialog.accept())

    print("Filling form...")
    page.fill("#q1", "Test answer to be deleted")
    page.fill("#actionItem", "Action to delete")

    print("Submitting...")
    with page.expect_navigation():
        page.click("button:has-text('Save Entry')")

    print("Entry saved and page reloaded.")

    # Switch to History
    print("Switching to History tab...")
    page.click("#historyTab")

    # Wait for history list to render
    page.wait_for_selector("#historyList button")

    # Verify entry is there
    initial_count = page.locator("#historyList button").count()
    print(f"Initial history count: {initial_count}")
    if initial_count == 0:
        raise Exception("Failed to create entry.")

    # Open the entry
    print("Opening entry...")
    page.click("#historyList button:first-child")

    # Wait for modal
    page.wait_for_selector("#modal:not(.hidden)")

    # Check for Delete button
    delete_btn = page.locator("#deleteBtn")
    if not delete_btn.is_visible():
        raise Exception("Delete button not visible in modal.")

    print("Clicking Delete button (first time)...")
    delete_btn.click()

    # Verify confirmation state
    page.wait_for_function("document.getElementById('deleteBtn').textContent.includes('Confirm')")
    print("Delete button changed to confirmation state.")

    # Confirm Delete
    print("Clicking Confirm Delete...")
    delete_btn.click()

    # Wait for modal to close
    page.wait_for_selector("#modal", state="hidden")
    print("Modal closed.")

    # Wait for history list to update
    # We expect one less item, or if it was the only one, the empty state text
    time.sleep(1) # Give it a moment to re-render

    final_count = page.locator("#historyList button").count()
    print(f"Final history count: {final_count}")

    if final_count != initial_count - 1:
         # Check if empty state message is present
         empty_msg = page.locator("#historyList").text_content()
         if "No entries yet" in empty_msg:
             print("History is empty as expected.")
         else:
             raise Exception(f"Entry not deleted! Count went from {initial_count} to {final_count}")

    # Check Focus
    focused_id = page.evaluate("document.activeElement.id")
    print(f"Focused element ID: {focused_id}")
    if focused_id != "themeFilter":
        print("Warning: Focus not on themeFilter as expected.")
    else:
        print("Focus correctly moved to themeFilter.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_delete_entry(page)
            print("✅ Test Passed!")
        except Exception as e:
            print(f"❌ Test Failed: {e}")
            exit(1)
        browser.close()
