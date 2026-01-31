
from playwright.sync_api import sync_playwright

def test_focus_styles(page):
    page.goto("http://localhost:8000/index.html")

    # Focus q1
    page.locator("#q1").focus()
    # Wait for transition
    page.wait_for_timeout(300)
    page.screenshot(path="verification/focus_textarea.png")

    # Focus Save Button
    page.get_by_role("button", name="Save Entry").focus()
    page.wait_for_timeout(300)
    page.screenshot(path="verification/focus_button.png")

    print("Screenshots taken")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        test_focus_styles(page)
        browser.close()
