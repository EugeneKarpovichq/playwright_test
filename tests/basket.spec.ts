import { test, expect, BrowserContext } from "@playwright/test";
import basketPO from "../page-objects/basket";
import MainPagePO from "../page-objects/main-page";

let basket: basketPO, mainPage: MainPagePO, context: BrowserContext;

test.describe("Корзина", () => {
  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      storageState: "./auth.json",
    });
    const page = await context.newPage();
    basket = new basketPO(page);
    mainPage = new MainPagePO(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(await mainPage.isLoggedIn()).toBeTruthy();
    await basket.clearBasket();
    expect(await basket.isBasketCleared()).toBeTruthy();
  });

  test("Тест-кейс 1. Переход в пустую корзину.", async ({ page }) => {
    await mainPage.clickBasketBtn();
    expect(await basket.isDropDownBasketOpened()).toBeTruthy();

    await basket.goToBasketPage();
    expect(await basket.isBasketPageOpened()).toBeTruthy();
  });
});
