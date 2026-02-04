from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:8000")

        # Screenshot Daily Tab (Initial)
        page.screenshot(path="verification/tabs_daily.png")

        # Click History Tab
        page.click("#historyTab")

        # Screenshot History Tab
        page.screenshot(path="verification/tabs_history.png")

        # Verify focus style on Daily Tab (using keyboard)
        page.keyboard.press("ArrowLeft") # Switch back to Daily
        page.screenshot(path="verification/tabs_focus_daily.png")

        browser.close()

if __name__ == "__main__":
    run()
