from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:8000")

        # Wait for app to load
        page.wait_for_selector("#q1")

        textarea = page.locator("#q1")

        # Get initial height
        initial_height = textarea.evaluate("el => el.clientHeight")
        print(f"Initial height: {initial_height}px")

        # Type a lot of text to force scroll/expand
        long_text = "This is a long line of text.\n" * 10
        textarea.fill(long_text)

        # Get new height
        new_height = textarea.evaluate("el => el.clientHeight")
        print(f"New height: {new_height}px")

        # Take screenshot
        page.screenshot(path="verification/auto_resize_evidence.png")

        if new_height > initial_height:
            print("SUCCESS: Textarea expanded.")
        else:
            print("FAILURE: Textarea did not expand.")

        browser.close()

if __name__ == "__main__":
    run()
