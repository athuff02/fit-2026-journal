
import os
import sys
import time
from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Assume server is running on port 8000
        page.goto("http://localhost:8000/index.html")

        # 1. Click Calendar Button with empty input
        print("Clicking Calendar Button with empty input...")
        page.click("#calendarBtn")

        # 2. Check for error state (red background)
        calendar_btn = page.locator("#calendarBtn")
        if "bg-red-50" in calendar_btn.get_attribute("class"):
            print("SUCCESS: Error state triggered (Red background).")
        else:
            print("FAILURE: Error state NOT triggered.")
            sys.exit(1)

        # 3. Type into Action Item input
        print("Typing into Action Item input...")
        page.fill("#actionItem", "My Action Item")

        # 4. Check if error state is CLEARED immediately
        # We don't wait 2 seconds. We check immediately.
        # Note: Playwright actions are fast.

        # Allow a tiny tick for event loop if needed, but synchronous usually handles it.
        # However, we want to ensure the timeout didn't clear it yet (it's 2s).

        if "bg-red-50" not in calendar_btn.get_attribute("class"):
             print("SUCCESS: Error state CLEARED immediately on input.")
        else:
             print("FAILURE: Error state PERSISTED after input (Current behavior).")
             # This is expected before the fix

        browser.close()

if __name__ == "__main__":
    run_test()
