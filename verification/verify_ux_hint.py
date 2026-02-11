from playwright.sync_api import sync_playwright, expect
import sys

def verify_ux_hint(page):
    print("Navigating to app...")
    page.goto("http://localhost:8000/index.html")

    # Locate the Save Button
    save_btn = page.locator("#saveBtn")

    # 1. Check aria-keyshortcuts
    print("Checking aria-keyshortcuts...")
    expect(save_btn).to_have_attribute("aria-keyshortcuts", "Control+Enter")
    print("✓ aria-keyshortcuts attribute is correct.")

    # 2. Check inner text presence (Desktop)
    print("Checking visibility on Desktop (1024x768)...")
    page.set_viewport_size({"width": 1024, "height": 768})

    # The span should be visible
    # We look for the text "(Ctrl + Enter)"
    hint_span = save_btn.locator("span", has_text="(Ctrl + Enter)")
    expect(hint_span).to_be_visible()

    # Check opacity/styling classes if possible, but visibility is key
    print("✓ Hint is visible on desktop.")

    # 3. Check visibility on Mobile (375x667)
    print("Checking visibility on Mobile (375x667)...")
    page.set_viewport_size({"width": 375, "height": 667})

    # The span should be hidden
    expect(hint_span).not_to_be_visible()
    print("✓ Hint is hidden on mobile.")

    # 4. Check focus-visible behavior (Optional / Hard to test reliably without precise event simulation)
    # We can check the class exists though
    # expect(save_btn).to_have_class("focus-visible:ring-2")
    # But class check is fragile if other classes are present.
    # Let's check if the class list contains it.
    classes = save_btn.get_attribute("class")
    if "focus-visible:ring-2" in classes:
        print("✓ focus-visible:ring-2 class is present.")
    else:
        print("✗ focus-visible:ring-2 class is MISSING.")
        # We won't fail the test for this strictly in this script, but good to know.
        # Actually, let's fail if it's missing as it's part of the plan.
        raise Exception("focus-visible:ring-2 class is missing")

    print("Taking screenshot...")
    page.screenshot(path="verification/ux_hint_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_ux_hint(page)
            print("Verification PASSED")
        except Exception as e:
            print(f"Verification FAILED: {e}")
            sys.exit(1)
        finally:
            browser.close()
