import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

def verify_modal_close():
    print("Starting local server...")
    server_process = subprocess.Popen(["python3", "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            # Grant notification permissions to avoid prompt blocking if settings are tested
            context = browser.new_context(permissions=['notifications'])
            page = context.new_page()
            page.on("console", lambda msg: print(f"PAGE CONSOLE: {msg.text}"))
            page.goto("http://localhost:8000")

            # 1. Test Settings Modal
            print("Testing Settings Modal backdrop click...")
            page.click("#settingsBtn")
            # Wait for modal to be visible
            page.wait_for_selector("#settingsModal:not(.d-none)")

            # Click the backdrop. (10, 10) is top-left corner.
            # We use mouse.click to ensure we click at specific coordinates where the backdrop is exposed.
            page.mouse.click(10, 10)

            # Wait for modal to be hidden
            try:
                page.wait_for_selector("#settingsModal", state="hidden", timeout=2000)
                print("SUCCESS: Settings modal closed on backdrop click.")
            except Exception as e:
                print(f"FAILURE: Settings modal did not close on backdrop click. Exception: {e}")
                sys.exit(1)

            # 2. Test History Entry Modal
            # We need an entry first.
            print("Creating a dummy entry to test History Modal...")
            # Ensure we are on Daily tab
            daily_view = page.locator("#dailyView")
            cls = daily_view.get_attribute("class") or ""
            if "hidden" in cls:
                page.click("#dailyTab")

            page.fill("#q1", "Test Answer")
            page.fill("#actionItem", "Test Action")
            page.click("#saveBtn")
            # Wait for save success
            page.wait_for_selector("text=Entry saved successfully")

            # Switch to History
            page.click("#historyTab")
            # Click the first entry
            page.click("#historyList button:first-child")
            page.wait_for_selector("#modal:not(.d-none)")

            print("Testing History Modal backdrop click...")
            # Click backdrop
            page.mouse.click(10, 10)

            try:
                page.wait_for_selector("#modal", state="hidden", timeout=2000)
                print("SUCCESS: History modal closed on backdrop click.")
            except Exception as e:
                print(f"FAILURE: History modal did not close on backdrop click. Exception: {e}")
                sys.exit(1)

            browser.close()

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        print("Stopping server...")
        server_process.terminate()

if __name__ == "__main__":
    verify_modal_close()
