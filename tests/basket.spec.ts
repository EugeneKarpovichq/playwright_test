import { test, expect, BrowserContext } from "@playwright/test";
import basketPO from "../page-objects/basket";
import MainPagePO from "../page-objects/main-page";
import { LabelEnum } from "../constants/label.enum";
import { testConfig } from "../config";

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
    // await mainPage.logIn(testConfig.username, testConfig.password);

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

  test("Тест-кейс 2. Переход в корзину с 1 неакционным товаром.", async ({
    page,
  }) => {
    await basket.addNoPromoProduct(LabelEnum.noPromoProduct_1);
    const productPrice = await basket.getPriceForProduct(
      LabelEnum.noPromoProduct_1
    );
    expect(await basket.countProductsInBasket()).toEqual("1");

    await mainPage.clickBasketBtn();
    expect(await basket.isDropDownBasketOpened()).toBeTruthy();
    expect(
      await basket.isProductInBasket(LabelEnum.noPromoProduct_1, productPrice)
    ).toBeTruthy();
  });
});
