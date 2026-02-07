from playwright.sync_api import sync_playwright, expect
import sys

def test_shortcut_save(page):
    print("Navigating to app...")
    page.goto("http://localhost:8000/index.html")

    # Fill out the form
    print("Filling form...")
    page.fill("#q1", "Test content for shortcut save")

    # Focus the textarea
    page.focus("#q1")

    # Simulate Ctrl+Enter (or Meta+Enter for Mac compatibility)
    print("Pressing Ctrl+Enter...")
    # On Mac, Meta+Enter is standard. On Windows/Linux, Ctrl+Enter.
    # We'll simulate both or just Ctrl+Enter as the implementation will likely support both.
    page.keyboard.press("Control+Enter")

    # Get the save button
    save_btn = page.locator("#saveBtn")

    # Verify Loading/Disabled State - allow some time for JS to execute
    # If the shortcut works, the button should become disabled and text change to "Saving..."
    print("Verifying Disabled State...")
    expect(save_btn).to_be_disabled(timeout=5000)

    # Verify Saved State
    print("Verifying Saved State...")
    expect(save_btn).to_have_text("Saved!", timeout=5000)

    print("Taking screenshot...")
    page.screenshot(path="verification/shortcut_save_success.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_shortcut_save(page)
            print("Test PASSED")
        except Exception as e:
            print(f"Test FAILED: {e}")
            sys.exit(1)
        finally:
            browser.close()
