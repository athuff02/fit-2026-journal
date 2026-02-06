from playwright.sync_api import sync_playwright, expect
import time

def test_a11y(page):
    page.goto("http://localhost:8000/index.html")

    # 1. Check for live region
    expect(page.locator("#a11y-announcer")).to_have_attribute("aria-live", "polite")
    print("Live region found.")

    # 2. Check for hidden headings
    expect(page.locator("#dailyView h2")).to_contain_text("Daily Focus")
    expect(page.locator("#historyView h2")).to_contain_text("History")
    print("Headings found.")

    # 3. Fill form to create history
    page.fill("#q1", "Test Q1")
    page.fill("#actionItem", "Test Action")

    # Save
    page.click("#saveBtn")

    # Verify announcement
    expect(page.locator("#a11y-announcer")).to_contain_text("Entry saved successfully")
    expect(page.locator("#saveBtn")).to_have_text("Saved!")
    print("Save announcement verified.")

    # Page reloads after 1s
    time.sleep(2)
    page.goto("http://localhost:8000/index.html")

    # Switch to History
    page.click("#historyTab")

    # Click first entry
    page.wait_for_selector("#historyList button")
    page.click("#historyList button")

    # 4. Verify Modal Open and Focus
    expect(page.locator("#modal")).to_be_visible()

    # Check if Title is focused
    expect(page.locator("#modalTitle")).to_be_focused()
    print("Modal Title focused on open.")

    # Take screenshot
    page.screenshot(path="verification/modal_open.png")

    # Test Focus Trap

    # Press Tab -> ExportBtn
    page.keyboard.press("Tab")
    expect(page.locator("#exportBtn")).to_be_focused()
    print("Tab moved to ExportBtn.")

    # Press Tab -> CloseBtn
    page.keyboard.press("Tab")
    expect(page.locator("#closeModalBtn")).to_be_focused()
    print("Tab moved to CloseBtn.")

    # Press Tab -> Should Loop to ExportBtn
    page.keyboard.press("Tab")
    expect(page.locator("#exportBtn")).to_be_focused()
    print("Tab looped back to ExportBtn.")

    # Shift Tab from ExportBtn -> Should Loop to CloseBtn
    page.keyboard.press("Shift+Tab")
    expect(page.locator("#closeModalBtn")).to_be_focused()
    print("Shift+Tab looped back to CloseBtn.")

    # Close modal
    page.keyboard.press("Escape")
    expect(page.locator("#modal")).not_to_be_visible()
    print("Modal closed via Escape.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_a11y(page)
            print("All accessibility tests passed!")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
