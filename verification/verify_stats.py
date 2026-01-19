
from playwright.sync_api import sync_playwright, expect

def test_monthly_stats(page):
    # 1. Load the app
    page.goto("http://localhost:8000/index.html")

    # 2. Inject mock data into IndexedDB
    # We need to wait for DB init. A small delay or waiting for an element is usually enough.
    # But since initDB is async and runs on DOMContentLoaded, we can try to inject after page load.
    # However, app.js initializes DB on load. We might need to clear it or add to it.
    # Let's just add entries via console for simplicity, if 'db' was global or accessible.
    # It's not global in app.js scope (let db; inside module, but app.js is not a module).
    # app.js is loaded with <script defer>, so it runs in global scope. 'db' should be accessible if not inside a block.
    # 'db' is defined at top level of app.js.
    # Let's try to execute script to add entries.

    mock_entries = [
        # January 2026: 2 unique days
        {"date": "2026-01-01", "theme": "Health/Fitness", "responses": {}, "actionItem": "Run", "createdAt": "2026-01-01T10:00:00Z"},
        {"date": "2026-01-01", "theme": "Faith", "responses": {}, "actionItem": "Pray", "createdAt": "2026-01-01T12:00:00Z"}, # Duplicate day
        {"date": "2026-01-05", "theme": "Career", "responses": {}, "actionItem": "Work", "createdAt": "2026-01-05T10:00:00Z"},

        # December 2025: 1 unique day
        {"date": "2025-12-31", "theme": "Reflection", "responses": {}, "actionItem": "Reflect", "createdAt": "2025-12-31T10:00:00Z"},
    ]

    # Inject function to add mock entries
    page.evaluate("""
        const entries = %s;
        const transaction = db.transaction(["entries"], "readwrite");
        const store = transaction.objectStore("entries");
        entries.forEach(e => store.add(e));
        transaction.oncomplete = () => {
            console.log("Mock data added");
            // Refresh global entries and stats
            getDBEntries(entries => {
                window.journalEntries = entries;
                renderStats();
            });
        };
    """ % str(mock_entries).replace("'", '"').replace("False", "false").replace("True", "true"))

    # 3. Click History Tab
    page.get_by_role("button", name="History").click()

    # 4. Verify Stats Container
    stats_container = page.locator("#statsContainer")
    expect(stats_container).to_be_visible()

    # 5. Verify Monthly Consistency Card
    monthly_card = stats_container.locator("div", has_text="Monthly Consistency")
    expect(monthly_card).to_be_visible()

    # 6. Verify Counts
    # January 2026: 2 days
    expect(monthly_card).to_contain_text("January 2026")
    expect(monthly_card).to_contain_text("2 days")

    # December 2025: 1 day
    expect(monthly_card).to_contain_text("December 2025")
    expect(monthly_card).to_contain_text("1 day")

    # 7. Take Screenshot
    page.screenshot(path="verification/stats_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            test_monthly_stats(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/error.png")
            raise
        finally:
            browser.close()
