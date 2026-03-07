import json
from playwright.sync_api import sync_playwright

def test_chevron_affordance():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Load the application
        page.goto("http://localhost:8000/index.html")

        # Mock an entry to ensure the history list has content
        mock_entry = {
            "date": "2026-03-01",
            "theme": "Health/Fitness",
            "responses": {
                "q1": "test",
                "q2": "test",
                "q3": "test",
                "q4": "test",
                "q5": "test"
            },
            "actionItem": "Test action item",
            "createdAt": "2026-03-01T12:00:00.000Z"
        }

        # Inject the mock entry into IndexedDB and refresh data
        page.evaluate(f"""
            () => {{
                return new Promise((resolve) => {{
                    if (!window.db) {{
                        initDB(() => {{
                            const transaction = db.transaction(["entries"], "readwrite");
                            const store = transaction.objectStore("entries");
                            store.add({json.dumps(mock_entry)});
                            transaction.oncomplete = () => {{
                                getDBEntries(entries => {{
                                    window.journalEntries = entries;
                                    resolve();
                                }});
                            }};
                        }});
                    }} else {{
                        const transaction = db.transaction(["entries"], "readwrite");
                        const store = transaction.objectStore("entries");
                        store.add({json.dumps(mock_entry)});
                        transaction.oncomplete = () => {{
                            getDBEntries(entries => {{
                                window.journalEntries = entries;
                                resolve();
                            }});
                        }};
                    }}
                }});
            }}
        """)

        # Navigate to the History tab
        history_tab = page.get_by_role("tab", name="History")
        history_tab.click()

        # Wait for the history view to be visible
        page.wait_for_selector("#historyView", state="visible")

        # Find the first history item button
        history_button = page.locator("#historyList button").first

        # Verify the chevron icon exists inside the button
        svg_icon = history_button.locator("svg")

        try:
            # Ensure the SVG is present and visible
            svg_icon.wait_for(state="visible", timeout=3000)

            # Check classes to ensure it matches our intended UX enhancements
            class_name = svg_icon.get_attribute("class")
            assert "text-gray-600" in class_name, "Missing text-gray-600 class on SVG"
            assert "group-hover:text-gray-900" in class_name, "Missing hover text class on SVG"

            print("SUCCESS: Chevron affordance verified!")

            # Additional check: take screenshot for manual verification
            page.screenshot(path="verification/history_chevron.png")

        except Exception as e:
            print(f"FAILED: Could not verify chevron affordance. Error: {e}")
            raise e

        finally:
            browser.close()

if __name__ == "__main__":
    test_chevron_affordance()
