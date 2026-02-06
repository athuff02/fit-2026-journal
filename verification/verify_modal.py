
from playwright.sync_api import sync_playwright, expect
import time

def test_modal_accessibility(page):
    # 1. Load the app
    page.goto("http://localhost:8000/index.html")

    # 2. Inject a mock entry
    mock_entry = {
        "date": "2026-01-01",
        "theme": "Health/Fitness",
        "responses": {"q1": "A", "q2": "B", "q3": "C", "q4": "D", "q5": "E"},
        "actionItem": "Run",
        "createdAt": "2026-01-01T10:00:00Z"
    }

    # We wait a bit for DB to initialize
    page.wait_for_timeout(1000)

    page.evaluate("""
        const entry = %s;
        if (!db) {
            console.error("DB not ready");
            throw new Error("DB not ready");
        }
        const transaction = db.transaction(["entries"], "readwrite");
        const store = transaction.objectStore("entries");
        store.add(entry);
        transaction.oncomplete = () => {
            console.log("Mock data added");
            // Refresh global entries
            getDBEntries(entries => {
                window.journalEntries = entries;
            });
        };
    """ % str(mock_entry).replace("'", '"').replace("False", "false").replace("True", "true"))

    # 3. Click History Tab (this calls renderHistory)
    page.get_by_role("tab", name="History").click()

    # 4. Click the entry to open modal
    # We use a text selector. The format is "Date — Theme"
    # Using specific text
    entry_locator = page.locator("text=2026-01-01 — Health/Fitness")
    entry_locator.wait_for(state="visible", timeout=5000)
    entry_locator.click()

    # 5. Verify Modal Accessibility
    modal = page.locator("#modal")
    expect(modal).to_be_visible()
    expect(modal).to_have_attribute("role", "dialog")
    expect(modal).to_have_attribute("aria-modal", "true")
    expect(modal).to_have_attribute("aria-labelledby", "modalTitle")

    # Check if header has the ID
    expect(modal.locator("#modalTitle")).to_be_visible()

    # 6. Verify Focus moved to Close Button
    close_btn = page.locator("#closeModalBtn")
    expect(close_btn).to_be_focused()

    # 6b. Verify Focus Trap
    # Press Tab -> Should loop to Export Button (First element)
    page.keyboard.press("Tab")
    expect(page.locator("#exportBtn")).to_be_focused()

    # Press Tab -> Should go back to Close Button
    page.keyboard.press("Tab")
    expect(close_btn).to_be_focused()

    # Press Shift+Tab -> Should loop to Export Button
    page.keyboard.press("Shift+Tab")
    expect(page.locator("#exportBtn")).to_be_focused()

    # Restore focus to Close button
    page.keyboard.press("Shift+Tab")
    expect(close_btn).to_be_focused()

    # Take screenshot of the open modal
    page.screenshot(path="verification/modal_screenshot.png")

    # 7. Test Escape Key
    page.keyboard.press("Escape")
    expect(modal).to_be_hidden()

    print("Modal Accessibility Verified: Role, Focus, Escape Key.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_modal_accessibility(page)
        except Exception as e:
            print(f"Test failed: {e}")
            raise
        finally:
            browser.close()
