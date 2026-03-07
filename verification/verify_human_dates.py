import sys
import time
import subprocess
import json
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright

def verify_human_dates():
    print("Starting local server...")
    server_process = subprocess.Popen(["python3", "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto("http://localhost:8000")

            # Calculate dates
            today = datetime.now()
            yesterday = today - timedelta(days=1)
            older = datetime(2023, 10, 27)

            today_str = today.strftime("%Y-%m-%d")
            yesterday_str = yesterday.strftime("%Y-%m-%d")
            older_str = older.strftime("%Y-%m-%d")

            # Inject mock data
            mock_entries = [
                {"date": today_str, "theme": "Faith", "responses": {"q1":"a","q2":"b","q3":"c","q4":"d","q5":"e"}, "actionItem": "Pray", "createdAt": "1"},
                {"date": yesterday_str, "theme": "Health/Fitness", "responses": {"q1":"a","q2":"b","q3":"c","q4":"d","q5":"e"}, "actionItem": "Run", "createdAt": "2"},
                {"date": older_str, "theme": "Career", "responses": {"q1":"a","q2":"b","q3":"c","q4":"d","q5":"e"}, "actionItem": "Work", "createdAt": "3"}
            ]

            print(f"Injecting entries for: {today_str} (Today), {yesterday_str} (Yesterday), {older_str} (Older)")

            # Use json.dumps to ensure valid JS object
            page.evaluate(f"window.journalEntries = {json.dumps(mock_entries)}")
            page.evaluate("renderHistory()")

            # Switch to History tab to make it visible
            page.click("#historyTab")

            # Wait for list to have items
            page.wait_for_selector("#historyList button")

            # Get list items text
            items = page.locator("#historyList button > div > p:first-child").all_inner_texts()

            print("Found history items:", items)

            failures = []

            # 1. Check Today
            # Expected: "Today — Faith"
            if not any("Today — Faith" in item for item in items):
                failures.append(f"Expected 'Today — Faith', but not found in {items}")

            # 2. Check Yesterday
            # Expected: "Yesterday — Health/Fitness"
            if not any("Yesterday — Health/Fitness" in item for item in items):
                failures.append(f"Expected 'Yesterday — Health/Fitness', but not found in {items}")

            # 3. Check Older Date
            # The current implementation in app.js uses 'short' month (e.g. "Oct") and 'short' weekday (e.g. "Fri")
            # Expected: "Fri, Oct 27, 2023 — Career"

            found_older_human = False
            found_older_iso = False

            # Check for localized format: "Oct 27, 2023" or "Fri" or just not ISO
            for item in items:
                if "Oct 27, 2023" in item and "Career" in item:
                     found_older_human = True
                if "2023-10-27" in item and "Career" in item:
                     found_older_iso = True

            if found_older_iso:
                failures.append(f"Older date is still in ISO format: {older_str}")

            if not found_older_human:
                failures.append("Older date is not humanized (missing 'Oct 27, 2023').")

            if failures:
                print("FAILURES FOUND:")
                for f in failures:
                    print(f"- {f}")
                sys.exit(1)

            print("SUCCESS: Dates are humanized!")

            # Take screenshot
            page.screenshot(path="verification/history_human_dates.png")
            print("Screenshot saved to verification/history_human_dates.png")

            browser.close()

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        print("Stopping server...")
        server_process.terminate()

if __name__ == "__main__":
    verify_human_dates()
