
from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/index.html")

        # 1. Trigger Error
        print("Triggering error...")
        page.click("#calendarBtn")
        page.screenshot(path="verification/calendar_error_state.png")
        print("Captured error state screenshot.")

        # 2. Type to clear error
        print("Typing to clear error...")
        page.fill("#actionItem", "Something")
        # Allow a tiny moment for DOM update (though sync is usually fast enough)
        page.wait_for_timeout(100)
        page.screenshot(path="verification/calendar_cleared_state.png")
        print("Captured cleared state screenshot.")

        browser.close()

if __name__ == "__main__":
    run_test()
