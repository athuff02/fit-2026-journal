from playwright.sync_api import sync_playwright, expect
import sys

def test_empty_state(page):
    print("Navigating to app...")
    # 1. Load the app
    page.goto("http://localhost:8000/index.html")

    print("Clicking History tab...")
    # 2. Click History Tab
    page.get_by_role("button", name="History").click()

    print("Verifying empty state message...")
    # 3. Check for empty state message
    expect(page.locator("#historyList")).to_contain_text("No entries yet")

    # 4. Take Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/empty_state.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_empty_state(page)
            print("Test PASSED")
        except Exception as e:
            print(f"Test FAILED: {e}")
            sys.exit(1)
        finally:
            browser.close()
