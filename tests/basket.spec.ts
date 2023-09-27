import { test, expect, BrowserContext } from "@playwright/test";
import BasketPO from "../page-objects/basket";
import DropDownBasketPO from "../page-objects/dropdownbasket";
import MainPagePO from "../page-objects/main-page";
import { LabelEnum } from "../constants/label.enum";
import { testConfig } from "../config";

let basket: BasketPO, 
mainPage: MainPagePO, 
dropdownBasket: DropDownBasketPO, 
context: BrowserContext;

test.describe("Корзина", () => {
  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      storageState: "./auth.json",
    });
    const page = await context.newPage();
    basket = new BasketPO(page);
    dropdownBasket = new DropDownBasketPO(page);
    mainPage = new MainPagePO(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // expect(await mainPage.isLoggedIn()).toBeFalsy();
    // await mainPage.logIn(testConfig.username, testConfig.password);

    await dropdownBasket.clearBasket();
    expect(await dropdownBasket.isBasketCleared()).toBeTruthy();
    expect(await mainPage.isLoggedIn()).toBeTruthy();
  });

  test("Тест-кейс 1. Переход в пустую корзину.", async () => {
    await mainPage.clickBasketBtn();
    expect(await dropdownBasket.isDropDownBasketOpened()).toBeTruthy();

    await dropdownBasket.goToBasketPage();
    expect(await dropdownBasket.isBasketPageOpened()).toBeTruthy();
  });

  test("Тест-кейс 2. Переход в корзину с 1 неакционным товаром.", async () => {
    await dropdownBasket.addNoPromoProductByName(LabelEnum.noPromoProduct_1);
    const productPrice = await dropdownBasket.getPriceForProduct(LabelEnum.noPromoProduct_1);
    expect(await dropdownBasket.countProductsInBasket()).toEqual("1");

    await mainPage.clickBasketBtn();
    expect(await dropdownBasket.isDropDownBasketOpened()).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.noPromoProduct_1, productPrice)).toBeTruthy();

    await dropdownBasket.goToBasketPage();
    expect(await dropdownBasket.isBasketPageOpened()).toBeTruthy();
  });

  test("Тест-кейс 3. Переход в корзину с 1 акционным товаром.", async () => {
    await dropdownBasket.addPromoProductByName(LabelEnum.promoProduct_1);
    const productPrice = await dropdownBasket.getPriceForPromoProduct(LabelEnum.promoProduct_1);
    expect(await dropdownBasket.countProductsInBasket()).toEqual("1");

    await mainPage.clickBasketBtn();
    expect(await dropdownBasket.isDropDownBasketOpened()).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.promoProduct_1, productPrice)).toBeTruthy();
    const totalBasketPrice = await dropdownBasket.getTotalBasketPrice();
    const actualTotalPrice = await dropdownBasket.getActualTotalPrice();
    expect(totalBasketPrice).toEqual(actualTotalPrice);

    await dropdownBasket.goToBasketPage();
    expect(await dropdownBasket.isBasketPageOpened()).toBeTruthy();
  });

  test("Тест-кейс 4. Переход в корзину с 9 разными товарами.", async () => {
    await dropdownBasket.addPromoProductByName(LabelEnum.promoProduct_1);
    expect(await dropdownBasket.countProductsInBasket()).toEqual("1");

    await dropdownBasket.addNoPromoProductByName(LabelEnum.noPromoProduct_1);
    await dropdownBasket.addNoPromoProductByName(LabelEnum.noPromoProduct_2);
    await dropdownBasket.addNoPromoProductByName(LabelEnum.noPromoProduct_3);
    await dropdownBasket.addNoPromoProductByName(LabelEnum.noPromoProduct_4);
    await dropdownBasket.addNoPromoProductByName(LabelEnum.noPromoProduct_5);
    await dropdownBasket.addPromoProductByName(LabelEnum.promoProduct_2);
    await dropdownBasket.addPromoProductByName(LabelEnum.promoProduct_3);
    const noPromoProduct_1_price = await dropdownBasket.getPriceForProduct(LabelEnum.noPromoProduct_1);
    const noPromoProduct_2_price = await dropdownBasket.getPriceForProduct(LabelEnum.noPromoProduct_2);
    const noPromoProduct_3_price = await dropdownBasket.getPriceForProduct(LabelEnum.noPromoProduct_3);
    const noPromoProduct_4_price = await dropdownBasket.getPriceForProduct(LabelEnum.noPromoProduct_4);
    const noPromoProduct_5_price = await dropdownBasket.getPriceForProduct(LabelEnum.noPromoProduct_5);
    const promoProduct_1_price = await dropdownBasket.getPriceForPromoProduct(LabelEnum.promoProduct_1);
    const promoProduct_2_price = await dropdownBasket.getPriceForPromoProduct(LabelEnum.promoProduct_2);
    const promoProduct_3_price = await dropdownBasket.getPriceForPromoProduct(LabelEnum.promoProduct_3);

    await mainPage.goToPage(2);
    await dropdownBasket.addNoPromoProductByName(LabelEnum.noPromoProduct_6);
    const noPromoProduct_6_price = await dropdownBasket.getPriceForProduct(LabelEnum.noPromoProduct_6);

    expect(await dropdownBasket.countProductsInBasket()).toEqual("9");

    await mainPage.clickBasketBtn();
    expect(await dropdownBasket.isDropDownBasketOpened()).toBeTruthy();

    expect(await dropdownBasket.isProductInBasket(LabelEnum.noPromoProduct_1, noPromoProduct_1_price)).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.noPromoProduct_2, noPromoProduct_2_price)).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.noPromoProduct_3, noPromoProduct_3_price)).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.noPromoProduct_4, noPromoProduct_4_price)).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.noPromoProduct_5, noPromoProduct_5_price)).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.noPromoProduct_6, noPromoProduct_6_price)).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.promoProduct_1, promoProduct_1_price)).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.promoProduct_2, promoProduct_2_price)).toBeTruthy();
    expect(await dropdownBasket.isProductInBasket(LabelEnum.promoProduct_3, promoProduct_3_price)).toBeTruthy();

    const totalBasketPrice = await dropdownBasket.getTotalBasketPrice();
    const actualTotalPrice = await dropdownBasket.getActualTotalPrice();
    expect(totalBasketPrice).toEqual(actualTotalPrice);

    await dropdownBasket.goToBasketPage();
    expect(await dropdownBasket.isBasketPageOpened()).toBeTruthy();
  });

  test("Тест-кейс 5. Переход в корзину с 9 акционными товарами одного наименования.", async () => {
    await dropdownBasket.addPromoProductByName(LabelEnum.promoProduct_3, 9);

    const promoProduct_3_price = await dropdownBasket.getPriceForPromoProduct(LabelEnum.promoProduct_3);

    expect(await dropdownBasket.countProductsInBasket()).toEqual("9");

    await mainPage.clickBasketBtn();
    expect(await dropdownBasket.isDropDownBasketOpened()).toBeTruthy();

    expect(await dropdownBasket.isProductInBasket(LabelEnum.promoProduct_3, promoProduct_3_price, 9)).toBeTruthy();

    const totalBasketPrice = await dropdownBasket.getTotalBasketPrice();
    const actualTotalPrice = await dropdownBasket.getActualTotalPrice();
    expect(totalBasketPrice).toEqual(actualTotalPrice);

    await dropdownBasket.goToBasketPage();
    expect(await dropdownBasket.isBasketPageOpened()).toBeTruthy();
  });
});
