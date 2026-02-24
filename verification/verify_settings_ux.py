import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

def verify_settings_ux():
    # Start server
    print("Starting local server...")
    server_process = subprocess.Popen(["python3", "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2) # Wait for server to start

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto("http://localhost:8000")

            # Check Settings Button
            print("Checking Settings Button...")
            settings_btn = page.locator("#settingsBtn")

            # 1. Check title attribute
            title = settings_btn.get_attribute("title")
            if title == "Settings":
                print("SUCCESS: Settings button has title='Settings'")
            else:
                print(f"FAILURE: Settings button missing title. Got: '{title}'")
                # We won't exit immediately to check other things, but will track failure.
                # Actually, for this script, let's just fail fast or collect errors.
                # Let's fail fast for simplicity.
                sys.exit(1)

            # 2. Check class for contrast (text-gray-600)
            classes = settings_btn.get_attribute("class")
            if "text-gray-600" in classes:
                print("SUCCESS: Settings button uses text-gray-600")
            elif "text-gray-400" in classes:
                print("FAILURE: Settings button still uses text-gray-400 (too light)")
                sys.exit(1)
            else:
                print(f"FAILURE: Settings button has unexpected class: {classes}")
                sys.exit(1)

            # Check Helper Text in Settings Modal
            print("Checking Helper Text...")
            # Locate the paragraph with "Note: Notifications will only appear..."
            # It's inside #timeSettings p
            helper_text = page.locator("#timeSettings p")
            helper_classes = helper_text.get_attribute("class")

            if "text-gray-600" in helper_classes:
                 print("SUCCESS: Helper text uses text-gray-600")
            elif "text-gray-500" in helper_classes:
                 print("FAILURE: Helper text still uses text-gray-500 (too light for small text)")
                 sys.exit(1)
            else:
                 print(f"FAILURE: Helper text has unexpected class: {helper_classes}")
                 sys.exit(1)

            browser.close()

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        print("Stopping server...")
        server_process.terminate()

if __name__ == "__main__":
    verify_settings_ux()
