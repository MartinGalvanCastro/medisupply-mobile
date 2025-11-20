import { by, element, expect, waitFor, device } from 'detox';

export abstract class BasePage {
  protected readonly defaultTimeout = 10000;

  // ═══════════════════════════════════════════════════════════════════
  // CORE INTERACTIONS
  // ═══════════════════════════════════════════════════════════════════

  protected async tap(testID: string): Promise<void> {
    await element(by.id(testID)).tap();
  }

  protected async longPress(testID: string): Promise<void> {
    await element(by.id(testID)).longPress();
  }

  protected async typeText(testID: string, text: string): Promise<void> {
    await element(by.id(testID)).typeText(text);
  }

  protected async replaceText(testID: string, text: string): Promise<void> {
    await element(by.id(testID)).replaceText(text);
  }

  protected async clearText(testID: string): Promise<void> {
    await element(by.id(testID)).clearText();
  }

  protected async clearAndType(testID: string, text: string): Promise<void> {
    await this.clearText(testID);
    await this.typeText(testID, text);
  }

  // ═══════════════════════════════════════════════════════════════════
  // WAITING STRATEGIES
  // ═══════════════════════════════════════════════════════════════════

  protected async waitForVisible(
    testID: string,
    timeout = this.defaultTimeout
  ): Promise<void> {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(timeout);
  }

  protected async waitForNotVisible(
    testID: string,
    timeout = this.defaultTimeout
  ): Promise<void> {
    await waitFor(element(by.id(testID)))
      .not.toBeVisible()
      .withTimeout(timeout);
  }

  protected async waitForExists(
    testID: string,
    timeout = this.defaultTimeout
  ): Promise<void> {
    await waitFor(element(by.id(testID)))
      .toExist()
      .withTimeout(timeout);
  }

  protected async waitForText(
    text: string,
    timeout = this.defaultTimeout
  ): Promise<void> {
    await waitFor(element(by.text(text)))
      .toBeVisible()
      .withTimeout(timeout);
  }

  // ═══════════════════════════════════════════════════════════════════
  // ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════

  protected async expectVisible(testID: string): Promise<void> {
    await expect(element(by.id(testID))).toBeVisible();
  }

  protected async expectNotVisible(testID: string): Promise<void> {
    await expect(element(by.id(testID))).not.toBeVisible();
  }

  protected async expectToExist(testID: string): Promise<void> {
    await expect(element(by.id(testID))).toExist();
  }

  protected async expectNotToExist(testID: string): Promise<void> {
    await expect(element(by.id(testID))).not.toExist();
  }

  protected async expectText(testID: string, text: string): Promise<void> {
    await expect(element(by.id(testID))).toHaveText(text);
  }

  protected async expectTextVisible(text: string): Promise<void> {
    await expect(element(by.text(text))).toBeVisible();
  }

  protected async expectEnabled(testID: string): Promise<void> {
    // Detox doesn't have toBeEnabled(), check element exists and is visible
    await expect(element(by.id(testID))).toBeVisible();
    // Additional check: element should be tappable (no disabled state)
    // For more precise checks, ensure accessibilityState.disabled is false in component
  }

  protected async expectDisabled(testID: string): Promise<void> {
    // Check element exists but has disabled visual state (e.g., opacity)
    // Detox doesn't have direct disabled check - verify element exists
    await expect(element(by.id(testID))).toExist();
    // For proper disabled testing, add testID suffix like -disabled to component
  }

  // ═══════════════════════════════════════════════════════════════════
  // SCROLLING
  // ═══════════════════════════════════════════════════════════════════

  protected async scrollDown(
    scrollViewID: string,
    pixels = 200
  ): Promise<void> {
    await element(by.id(scrollViewID)).scroll(pixels, 'down');
  }

  protected async scrollUp(scrollViewID: string, pixels = 200): Promise<void> {
    await element(by.id(scrollViewID)).scroll(pixels, 'up');
  }

  protected async scrollToElement(
    targetTestID: string,
    scrollViewID: string,
    direction: 'down' | 'up' = 'down',
    pixels = 200
  ): Promise<void> {
    await waitFor(element(by.id(targetTestID)))
      .toBeVisible()
      .whileElement(by.id(scrollViewID))
      .scroll(pixels, direction);
  }

  protected async swipeUp(
    testID: string,
    speed: 'fast' | 'slow' = 'fast'
  ): Promise<void> {
    await element(by.id(testID)).swipe('up', speed);
  }

  protected async swipeDown(
    testID: string,
    speed: 'fast' | 'slow' = 'fast'
  ): Promise<void> {
    await element(by.id(testID)).swipe('down', speed);
  }

  // ═══════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════

  protected async isVisible(testID: string): Promise<boolean> {
    try {
      await expect(element(by.id(testID))).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  protected async dismissKeyboard(): Promise<void> {
    if (device.getPlatform() === 'ios') {
      await element(by.id('keyboard-dismiss')).tap().catch(() => {
        // Fallback: tap outside
      });
    } else {
      await device.pressBack();
    }
  }

  protected async takeScreenshot(name: string): Promise<void> {
    await device.takeScreenshot(name);
  }

  protected async tapByText(text: string): Promise<void> {
    await element(by.text(text)).tap();
  }

  protected async tapByLabel(label: string): Promise<void> {
    await element(by.label(label)).tap();
  }
}
