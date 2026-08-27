import asyncio
import json
import os
import time
from urllib.parse import urlparse
from playwright.async_api import async_playwright

async def verify_backup_restore():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        server_process = await asyncio.create_subprocess_exec(
            "python3", "-m", "http.server", "8004"
        )
        await asyncio.sleep(2) # Wait for server to start

        try:
            await page.goto("http://localhost:8004")

            # 1. Create a test entry
            print("Creating test entry...")
            await page.fill("#q1", "Test Reason")
            await page.fill("#q2", "Test Vision")
            await page.fill("#q3", "Test Action")
            await page.fill("#q4", "Test Improvement")
            await page.fill("#q5", "Test Resistance")
            await page.fill("#actionItem", "Test Action Item")
            await page.click("#saveBtn")
            await page.wait_for_selector("text=Saved!", timeout=5000)

            # 2. Add a custom theme
            print("Adding custom theme...")
            await page.click("#settingsBtn")
            await page.fill("#newThemeName", "TestingTheme")
            await page.fill("#newThemeScripture", "Testing 1:1")
            await page.click("#addThemeBtn")
            await page.wait_for_selector("text=Theme added", timeout=5000)
            await page.click("#saveSettingsBtn")

            # 3. Export JSON (Handling download)
            print("Exporting backup...")
            async with page.expect_download() as download_info:
                await page.click("#settingsBtn")
                await page.click("#exportJsonBtn")
            download = await download_info.value
            path = "backup_test.json"
            await download.save_as(path)
            print(f"Exported to {path}")

            # Verify file content
            with open(path, 'r') as f:
                data = json.load(f)
                assert "entries" in data
                assert "customThemes" in data
                assert any(e['responses']['q1'] == "Test Reason" for e in data['entries'])
                assert any(t['name'] == "TestingTheme" for t in data['customThemes'])
            print("Backup file content verified")

            # Close settings
            await page.keyboard.press("Escape")
            await asyncio.sleep(1)

            # 4. Clear data
            print("Clearing data...")
            await page.evaluate("""() => {
                return new Promise((resolve) => {
                    localStorage.clear();
                    const req = indexedDB.deleteDatabase("Fit2026Journal");
                    req.onsuccess = () => resolve();
                    req.onerror = () => resolve();
                    req.onblocked = () => resolve();
                });
            }""")
            await page.goto("http://localhost:8004")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2)

            # Verify it's cleared
            print("Verifying data is cleared...")
            await page.click("#historyTab")
            await page.wait_for_selector("text=No entries yet", timeout=10000)
            print("Verified data is cleared")

            # 5. Import JSON
            print("Importing backup...")
            await page.click("#settingsBtn")
            async with page.expect_file_chooser() as fc_info:
                await page.click("#importJsonBtn")
            file_chooser = await fc_info.value
            await file_chooser.set_files(path)

            await page.wait_for_selector("text=Backup restored and merged successfully", timeout=5000)
            print("Import successful")

            # 6. Verify data is back
            await page.click("#saveSettingsBtn")
            await page.click("#historyTab")
            await page.wait_for_selector("text=Test Action Item", timeout=5000)
            print("Verified entry is restored")

            await page.click("#settingsBtn")
            # Be more specific about the selector to avoid ambiguity
            await page.wait_for_selector("#customThemesList >> text=TestingTheme", timeout=5000)
            print("Verified custom theme is restored")

            # 7. Check Google Calendar button
            print("Checking Google Calendar button...")
            await page.keyboard.press("Escape")
            await asyncio.sleep(0.5)
            await page.click("#dailyTab")
            await page.fill("#actionItem", "Calendar Test")
            async with page.expect_popup() as popup_info:
                await page.click("#calendarBtn")
            popup = await popup_info.value
            parsed_popup = urlparse(popup.url)
            if parsed_popup.netloc in ("calendar.google.com", "accounts.google.com"):
                print("Verified Google Calendar integration still works")
            else:
                print(f"Calendar check failed: {popup.url}")

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path="verification_failure.png")
            raise e
        finally:
            server_process.terminate()
            if os.path.exists(path):
                os.remove(path)

if __name__ == "__main__":
    asyncio.run(verify_backup_restore())
