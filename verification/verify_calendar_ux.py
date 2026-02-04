from playwright.sync_api import sync_playwright, expect
import sys
import time

def test_calendar_ux(page):
    # Enable console logging
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

    print("Navigating to app...")
    page.goto("http://localhost:8000/index.html")

    # Get the calendar button and action item input
    calendar_btn = page.locator("#calendarBtn")
    action_input = page.locator("#actionItem")

    # Listen for dialogs - if one appears, it's a failure (initially we expect this to fail or be caught)
    # We will set a flag if dialog appears
    dialog_appeared = False
    def handle_dialog(dialog):
        nonlocal dialog_appeared
        print(f"DIALOG DETECTED: {dialog.message}")
        dialog_appeared = True
        dialog.dismiss()

    page.on("dialog", handle_dialog)

    print("Clicking Calendar Button (empty action item)...")
    calendar_btn.click()

    # Wait a bit for UI updates
    time.sleep(0.5)

    if dialog_appeared:
        print("FAIL: Alert dialog appeared. It should be replaced by inline feedback.")
        return False

    # Verify Button Text Change
    print("Verifying Button Text Change...")
    try:
        expect(calendar_btn).to_have_text("Action Item Required!")
    except AssertionError:
        print("FAIL: Button text did not change to 'Action Item Required!'")
        return False

    # Verify Error Styles
    print("Verifying Error Styles...")
    try:
        expect(calendar_btn).to_have_class(re.compile(r"text-red-600"))
        expect(calendar_btn).to_have_class(re.compile(r"border-red-600"))
    except Exception as e:
        # We might not need regex if we can check classes directly, but regex is safer for partial matches
        pass

    # Verify Focus
    print("Verifying Focus...")
    try:
        expect(action_input).to_be_focused()
    except AssertionError:
        print("FAIL: Action input is not focused.")
        return False

    print("Taking screenshot...")
    page.screenshot(path="verification/calendar_ux_error.png")

    print("Waiting for revert...")
    time.sleep(2.5) # Wait for timeout (2000ms)

    print("Verifying Revert...")
    try:
        expect(calendar_btn).to_contain_text("Add Action Item to Calendar")
        # Check if error class is removed (optional, but good)
    except AssertionError:
        print("FAIL: Button text did not revert.")
        return False

    return True

if __name__ == "__main__":
    import re
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            success = test_calendar_ux(page)
            if success:
                print("Test PASSED")
                sys.exit(0)
            else:
                print("Test FAILED")
                sys.exit(1)
        except Exception as e:
            print(f"Test ERROR: {e}")
            sys.exit(1)
        finally:
            browser.close()
