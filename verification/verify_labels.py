import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

def verify_labels():
    # Start server
    print("Starting local server...")
    server_process = subprocess.Popen(["python3", "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2) # Wait for server to start

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto("http://localhost:8000")

            # Get theme text
            theme_display = page.locator("#themeDisplay")
            theme_text = theme_display.text_content()
            print(f"Current Theme Display: '{theme_text}'")

            # Get Q1 Label
            q1_label = page.locator("label[for='q1']")
            q1_text = q1_label.text_content()
            print(f"Q1 Label Text: '{q1_text}'")

            # Verification Logic
            theme_name = theme_text.replace("Today's Focus: ", "").strip()
            expected_dynamic_start = f"1. Why does {theme_name} matter?"
            expected_static = "1. Why does this part of my life matter?"

            if q1_text.strip() == expected_dynamic_start:
                print(f"SUCCESS: Label is dynamic and correct: '{q1_text}'")
            elif q1_text.strip() == expected_static:
                print("FAILURE: Label is still static.")
                sys.exit(1)
            else:
                print(f"FAILURE: Label is unexpected. Expected: '{expected_dynamic_start}', Got: '{q1_text}'")
                sys.exit(1)

            # Check Q4 just to be sure about the "regarding" phrasing
            q4_label = page.locator("label[for='q4']")
            q4_text = q4_label.text_content()
            print(f"Q4 Label Text: '{q4_text}'")

            expected_q4 = f"4. What is one small improvement I can make regarding {theme_name}?"
            if q4_text.strip() == expected_q4:
                 print(f"SUCCESS: Q4 Label is correct.")
            else:
                 print(f"FAILURE: Q4 Label mismatch. Expected: '{expected_q4}', Got: '{q4_text}'")
                 sys.exit(1)

            browser.close()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        print("Stopping server...")
        server_process.terminate()

if __name__ == "__main__":
    verify_labels()
