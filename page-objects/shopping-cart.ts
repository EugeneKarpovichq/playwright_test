import { Page } from "@playwright/test";

export default class ShoppingCartPO {
  private page: Page;

  private navigationBar = ".navbar";
  private shoppingCart = `${this.navigationBar} #basketContainer`;
  private dropdownBasket = "[aria-labelledby='dropdownBasket']";

  constructor(page: Page) {
    this.page = page;
  }

  async clickShoppingCartBtn() {
    await this.page.click(this.shoppingCart);
  }

  async isShoppingCartOpened() {
    try {
      await this.page.waitForSelector(this.dropdownBasket, {
        state: "visible",
        timeout: 1000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
