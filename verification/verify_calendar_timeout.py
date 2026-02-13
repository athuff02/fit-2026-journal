
import time
from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/index.html")

        # 1. Click Calendar Button
        print("Clicking Calendar Button with empty input...")
        page.click("#calendarBtn")

        # 2. Check for error state immediately
        calendar_btn = page.locator("#calendarBtn")
        if "bg-red-50" in calendar_btn.get_attribute("class"):
             print("SUCCESS: Error state triggered.")
        else:
             print("FAILURE: Error state NOT triggered.")
             exit(1)

        # 3. Wait > 2 seconds
        print("Waiting 2.5 seconds...")
        time.sleep(2.5)

        # 4. Check if error state CLEARED automatically
        if "bg-red-50" not in calendar_btn.get_attribute("class"):
             print("SUCCESS: Error state CLEARED after timeout.")
        else:
             print("FAILURE: Error state PERSISTED after timeout.")
             exit(1)

        browser.close()

if __name__ == "__main__":
    run_test()
