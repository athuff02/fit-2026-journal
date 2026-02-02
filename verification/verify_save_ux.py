from playwright.sync_api import sync_playwright, expect
import sys
import time
import re

def test_save_ux(page):
    # Enable console logging
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

    print("Navigating to app...")
    page.goto("http://localhost:8000/index.html")

    # Fill out the form
    print("Filling form...")
    page.fill("#q1", "Test answer 1")
    page.fill("#actionItem", "Test Action")

    # Get the save button
    save_btn = page.locator("#saveBtn")

    # Ensure no dialog appears
    page.on("dialog", lambda dialog: print(f"UNEXPECTED DIALOG: {dialog.message}"))

    print("Clicking Save...")
    save_btn.click()

    # Verify Loading/Disabled State
    print("Verifying Disabled State...")
    expect(save_btn).to_be_disabled()

    # Verify Saved State
    print("Verifying Saved State...")
    expect(save_btn).to_have_text("Saved!")

    # Verify Green Color using Regex
    expect(save_btn).to_have_class(re.compile(r"bg-green-600"))

    print("Taking screenshot...")
    page.screenshot(path="verification/save_ux_success.png")

    print("Waiting for reload...")
    expect(save_btn).to_have_text("Save Entry", timeout=5000)
    expect(save_btn).to_be_enabled()

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_save_ux(page)
            print("Test PASSED")
        except Exception as e:
            print(f"Test FAILED: {e}")
            sys.exit(1)
        finally:
            browser.close()
