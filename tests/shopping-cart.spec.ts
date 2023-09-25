import { test, expect, BrowserContext } from "@playwright/test";
import ShoppingCartPO from "../page-objects/shopping-cart";

let context: BrowserContext;
let shoppingCart: ShoppingCartPO;

test.describe("Корзина", () => {
  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      storageState: "./auth.json",
    });
    const page = await context.newPage();
    shoppingCart = new ShoppingCartPO(page);

    await page.goto("/");
  });

  test.afterEach(async () => {
    await context.close();
    
  });

  test("Тест 1: Переход в пустую корзину", async ({ page }) => {
    await shoppingCart.clickShoppingCartBtn();
    expect(await shoppingCart.isShoppingCartOpened()).toBeTruthy();
  });
});
