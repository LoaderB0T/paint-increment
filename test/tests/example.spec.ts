import { test, expect, Page } from '@playwright/test';
import { PaintOnCanvasPage } from '../helper/paint-on-canvas-page';
import { settings } from '../setup/application-url';
import clipboard from 'clipboardy';

test.describe('Full Test', () => {
  let newPage1: Page;
  let newPage2: Page;

  test.afterEach(async () => {
    await newPage1?.close();
    await newPage2?.close();
  });

  test('Main Flow', async ({ page, browser }) => {
    const url = settings.applicationUrl;
    const paintOnCanvasPage = new PaintOnCanvasPage(page);
    await page.goto(url);

    await page.getByTestId('create-lobby-button').click();
    await page.getByTestId('lobbyName-input').fill('Test Lobby');
    await page.getByTestId('ownerName-input').fill('Owner Name');
    await page.getByTestId('ownerEmail-input').fill('owner@example.com');
    await page.getByTestId('maxPixels-input').fill('100');
    await page.getByTestId('size-input').fill('75');
    await page.getByTestId('timeLimit-input').fill('5');
    await page.getByTestId('lobby-submit').click();

    const lobbyUrlRegex = new RegExp(url + '/lobby/Test_Lobby/[a-zA-Z0-9-]{12}');
    await page.waitForURL(lobbyUrlRegex);

    await expect(page.getByTestId('lobby-name')).toHaveText('Test Lobby');
    await expect(page.getByTestId('Reset image')).toBeVisible();
    await expect(page.getByTestId('Submit paint iteration')).toBeEnabled();
    await expect(page.getByTestId('Toggle canvas pattern')).toBeVisible();

    await paintOnCanvasPage.paintPixel(10, 10);
    await expect(page.getByTestId('hovered-coordinates')).toHaveText('10 | 10');

    await page.getByTestId('Submit paint iteration').click();

    await page.getByTestId('View iterations').click();

    await expect(page.getByTestId('lobby-iteration')).toHaveCount(1);

    await page.getByTestId('lobby-iteration').nth(0).getByTestId('edit-iteration').click();
    await page.getByTestId('newName-input').fill('Init');
    await page.getByTestId('edit-iteration-save').click();
    await expect(
      page.getByTestId('lobby-iteration').nth(0).getByTestId('iteration-name')
    ).toHaveText('Init');
    await page.getByTestId('Back to lobby').click();

    await page.getByTestId('Create new invite link').click();
    const inviteCodeRegex = new RegExp(
      url + '/lobby/Test_Lobby/[a-zA-Z0-9-]{12}\\?invite=[a-zA-Z0-9-]{12}'
    );
    await expect(page.getByTestId('inviteCode-input')).toHaveValue(inviteCodeRegex);

    // Open a new page with the invite code
    await page.getByTestId('copy-code-button').click();
    const newContext1 = await browser.newContext();
    newPage1 = await newContext1.newPage();
    await newPage1.goto(clipboard.readSync());
    await expect(newPage1.getByTestId('lobby-name')).toHaveText('Test Lobby');

    // Open a second new page with the invite code
    await page.getByTestId('new-code-button').click();
    const newContext2 = await browser.newContext();
    newPage2 = await newContext2.newPage();
    await newPage2.goto(clipboard.readSync());
    await expect(newPage2.getByTestId('lobby-name')).toHaveText('Test Lobby');

    await page.getByTestId('close-code-button').click();

    // Start drawing on the first new page
    await newPage1.getByTestId('Start painting').click();
    await newPage1.getByTestId('yourName-input').fill('Luke Stylewalker');
    await newPage1.getByTestId('yourEmail-input').fill('luke.stylewalker@example.com');
    await newPage1.getByTestId('details-submit').click();
    // Tutorial should be visible
    await newPage1.getByTestId('close-tutorial-button').click();

    const paintOnCanvasPage1 = new PaintOnCanvasPage(newPage1);
    await paintOnCanvasPage1.paintPixel(11, 10);

    // owner and second player should see that the lobby is locked
    await expect(page.getByTestId('locked-by-someone')).toHaveText('Locked by: Luke Stylewalker');
    await expect(newPage2.getByTestId('locked-by-someone')).toHaveText(
      'Locked by: Luke Stylewalker'
    );
    await expect(newPage2.getByTestId('Start painting')).not.toBeVisible();

    await newPage1.getByTestId('Submit paint iteration').click();
    await expect(newPage1.getByTestId('Submit paint iteration')).not.toBeVisible();

    // owner and second player should see that the lobby has a pending confirmation
    await expect(page.getByTestId('pending-confirmation')).toBeVisible();
    await expect(newPage2.getByTestId('pending-confirmation')).toBeVisible();

    // owner should be able to confirm the iteration
    await page.getByTestId('Accept paint iteration').click();

    // first player should see that the lobby is unlocked but cannot paint anymore
    await expect(newPage1.getByTestId('locked-by-someone')).not.toBeVisible();
    await expect(newPage1.getByTestId('Start painting')).not.toBeVisible();
    await newPage1.close();

    // second player should see that the lobby is unlocked and can paint
    await expect(newPage2.getByTestId('locked-by-someone')).not.toBeVisible();
    await newPage2.getByTestId('Start painting').click();
    await newPage2.getByTestId('yourName-input').fill('SASS Vader');
    await newPage2.getByTestId('yourEmail-input').fill('sass.vader@example.com');
    await newPage2.getByTestId('details-submit').click();
    // Tutorial should be visible
    await newPage2.getByTestId('close-tutorial-button').click();
    const paintOnCanvasPage2 = new PaintOnCanvasPage(newPage2);
    await paintOnCanvasPage2.paintPixel(12, 10);
    await newPage2.getByTestId('Submit paint iteration').click();
    await expect(newPage2.getByTestId('Submit paint iteration')).not.toBeVisible();

    // owner should be able to reject the iteration
    await page.getByTestId('Reject paint iteration').click();

    await page.getByTestId('Create new invite link').click();
    await page.getByTestId('copy-code-button').click();
    await page.getByTestId('close-code-button').click();

    // Second player should be able to join the lobby with the new invite code
    await newPage2.goto(clipboard.readSync());
    await newPage2.getByTestId('Start painting').click();
    // Tutorial should be visible
    await newPage2.getByTestId('close-tutorial-button').click();
    await paintOnCanvasPage2.paintPixel(13, 10);
    await newPage2.getByTestId('Submit paint iteration').click();
    await newPage2.close();
  });
});
