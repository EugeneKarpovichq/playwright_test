import { test, expect, BrowserContext } from "@playwright/test";
import BasketPO from "../page-objects/basket";
import MainPagePO from "../page-objects/main-page";
import { LabelEnum } from "../constants/label.enum";
import { testConfig } from "../config";

let basket: BasketPO, mainPage: MainPagePO, context: BrowserContext;

test.describe("Корзина", () => {
  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      storageState: "./auth.json",
    });
    const page = await context.newPage();
    basket = new BasketPO(page);
    mainPage = new MainPagePO(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // await mainPage.logIn(testConfig.username, testConfig.password);

    await basket.clearBasket();
    expect(await basket.isBasketCleared()).toBeTruthy();
    expect(await mainPage.isLoggedIn()).toBeTruthy();
  });

  test.afterEach(async () => {
    await context.close();
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
    await basket.addNoPromoProductByName(LabelEnum.noPromoProduct_1);
    const productPrice = await basket.getPriceForProduct(
      LabelEnum.noPromoProduct_1
    );
    expect(await basket.countProductsInBasket()).toEqual("1");

    await mainPage.clickBasketBtn();
    expect(await basket.isDropDownBasketOpened()).toBeTruthy();
    expect(
      await basket.isProductInBasket(LabelEnum.noPromoProduct_1, productPrice)
    ).toBeTruthy();

    await basket.goToBasketPage();
    expect(await basket.isBasketPageOpened()).toBeTruthy();
  });

  test("Тест-кейс 3. Переход в корзину с 1 акционным товаром.", async ({
    page,
  }) => {
    await basket.addPromoProductByName(LabelEnum.promoProduct_1);
    const productPrice = await basket.getPriceForPromoProduct(
      LabelEnum.promoProduct_1
    );
    expect(await basket.countProductsInBasket()).toEqual("1");

    await mainPage.clickBasketBtn();
    expect(await basket.isDropDownBasketOpened()).toBeTruthy();
    expect(
      await basket.isProductInBasket(LabelEnum.promoProduct_1, productPrice)
    ).toBeTruthy();
    const totalBasketPrice = await basket.getTotalBasketPrice();
    const actualTotalPrice = await basket.getActualTotalPrice();
    expect(totalBasketPrice).toEqual(actualTotalPrice);

    await basket.goToBasketPage();
    expect(await basket.isBasketPageOpened()).toBeTruthy();
  });

  test("Тест-кейс 4. Переход в корзину с 9 разными товарами.", async ({
    page,
  }) => {
    await basket.addPromoProductByName(LabelEnum.promoProduct_1);
    expect(await basket.countProductsInBasket()).toEqual("1");

    await basket.addNoPromoProductByName(LabelEnum.noPromoProduct_1);
    await basket.addNoPromoProductByName(LabelEnum.noPromoProduct_2);
    await basket.addNoPromoProductByName(LabelEnum.noPromoProduct_3);
    await basket.addNoPromoProductByName(LabelEnum.noPromoProduct_4);
    await basket.addNoPromoProductByName(LabelEnum.noPromoProduct_5);
    await basket.addPromoProductByName(LabelEnum.promoProduct_2);
    await basket.addPromoProductByName(LabelEnum.promoProduct_3);
    const promoProduct_1_price = await basket.getPriceForPromoProduct(
      LabelEnum.promoProduct_1
    );
    const noPromoProduct_1_price = await basket.getPriceForProduct(
      LabelEnum.noPromoProduct_1
    );
    const noPromoProduct_2_price = await basket.getPriceForProduct(
      LabelEnum.noPromoProduct_2
    );
    const noPromoProduct_3_price = await basket.getPriceForProduct(
      LabelEnum.noPromoProduct_3
    );
    const noPromoProduct_4_price = await basket.getPriceForProduct(
      LabelEnum.noPromoProduct_4
    );
    const noPromoProduct_5_price = await basket.getPriceForProduct(
      LabelEnum.noPromoProduct_5
    );
    const promoProduct_2_price = await basket.getPriceForPromoProduct(
      LabelEnum.promoProduct_2
    );
    const promoProduct_3_price = await basket.getPriceForPromoProduct(
      LabelEnum.promoProduct_3
    );

    await mainPage.goToPage(2);
    await basket.addNoPromoProductByName(LabelEnum.noPromoProduct_6);

    const noPromoProduct_6_price = await basket.getPriceForProduct(
      LabelEnum.noPromoProduct_6
    );

    expect(await basket.countProductsInBasket()).toEqual("10");

    await mainPage.clickBasketBtn();
    expect(await basket.isDropDownBasketOpened()).toBeTruthy();

    expect(
      await basket.isProductInBasket(
        LabelEnum.noPromoProduct_1,
        noPromoProduct_1_price
      )
    ).toBeTruthy();
    expect(
      await basket.isProductInBasket(
        LabelEnum.noPromoProduct_2,
        noPromoProduct_2_price
      )
    ).toBeTruthy();
    expect(
      await basket.isProductInBasket(
        LabelEnum.noPromoProduct_3,
        noPromoProduct_3_price
      )
    ).toBeTruthy();
    expect(
      await basket.isProductInBasket(
        LabelEnum.noPromoProduct_4,
        noPromoProduct_4_price
      )
    ).toBeTruthy();
    expect(
      await basket.isProductInBasket(
        LabelEnum.noPromoProduct_5,
        noPromoProduct_5_price
      )
    ).toBeTruthy();
    expect(
      await basket.isProductInBasket(
        LabelEnum.noPromoProduct_6,
        noPromoProduct_6_price
      )
    ).toBeTruthy();
    expect(
      await basket.isProductInBasket(
        LabelEnum.promoProduct_1,
        promoProduct_1_price
      )
    ).toBeTruthy();
    expect(
      await basket.isProductInBasket(
        LabelEnum.promoProduct_2,
        promoProduct_2_price
      )
    ).toBeTruthy();
    expect(
      await basket.isProductInBasket(
        LabelEnum.promoProduct_3,
        promoProduct_3_price
      )
    ).toBeTruthy();

    const totalBasketPrice = await basket.getTotalBasketPrice();
    const actualTotalPrice = await basket.getActualTotalPrice();
    expect(totalBasketPrice).toEqual(actualTotalPrice);

    await basket.goToBasketPage();
    expect(await basket.isBasketPageOpened()).toBeTruthy();
  });

  test("Тест-кейс 5. Переход в корзину с 9 акционными товарами одного наименования.", async ({
    page,
  }) => {
    await basket.addPromoProductByName(LabelEnum.promoProduct_3, 9);

    const promoProduct_3_price = await basket.getPriceForPromoProduct(
      LabelEnum.promoProduct_3
    );

    expect(await basket.countProductsInBasket()).toEqual("9");

    await mainPage.clickBasketBtn();
    expect(await basket.isDropDownBasketOpened()).toBeTruthy();

    expect(
      await basket.isProductInBasket(
        LabelEnum.promoProduct_3,
        promoProduct_3_price,
        9
      )
    ).toBeTruthy();

    const totalBasketPrice = await basket.getTotalBasketPrice();
    const actualTotalPrice = await basket.getActualTotalPrice();
    expect(totalBasketPrice).toEqual(actualTotalPrice);

    await basket.goToBasketPage();
    expect(await basket.isBasketPageOpened()).toBeTruthy();
  });
});
