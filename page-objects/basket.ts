import { Page } from "@playwright/test";
import MainPagePO from "./main-page";

export default class basketPO {
  private page: Page;
  private mainPage: MainPagePO;

  private dropdownBasket = "[aria-labelledby='dropdownBasket']";
  private clearBasketBtn = "//*[@id='basketContainer']/div[2]/div[3]/a";
  private goToBasketSelector = "//*[@id='basketContainer']/div[2]/div[2]/a";
  private basketItemsCount =
    "//span[@class='basket-count-items badge badge-primary']";
  private errorMessage = ".site-error";

  constructor(page: Page) {
    this.page = page;
    this.mainPage = new MainPagePO(page);
  }

  async goToBasketPage() {
    await this.page.click(this.goToBasketSelector);
  }

  async isBasketPageOpened() {
    const currentUrl = await this.page.url();
    return currentUrl.endsWith("/basket");
  }

  async clearBasket() {
    await this.mainPage.clickBasketBtn();

    try {
      await this.page.waitForSelector(this.dropdownBasket, {
        state: "visible",
        timeout: 5000,
      });
    } catch (error) {
      throw new Error("Выпадающий список корзины не открылся.");
    }

    await this.page.click(this.clearBasketBtn);
    await this.page.waitForResponse((response) => {
      return (
        response.url() === "https://enotes.pointschool.ru/basket/get" &&
        response.status() === 200
      );
    });
  }

  async isBasketCleared() {
    const cartItemCountText = await this.page.textContent(
      this.basketItemsCount
    );

    if (cartItemCountText === "0") {
      return true;
    } else {
      throw new Error("Корзина не очищена.");
    }
  }

  async isDropDownBasketOpened() {
    try {
      await this.page.waitForSelector(this.dropdownBasket, {
        state: "visible",
        timeout: 1000,
      });
      return true;
    } catch (error) {
      throw new Error("Выпадающее меню корзины не открылось.");
    }
  }

  async isErrorMessageNotDisplayed() {
    const errorMessageElement = await this.page.$(this.errorMessage);

    if (!errorMessageElement) {
      return true;
    } else {
      const errorMessageText = await errorMessageElement.textContent();
      console.log(`Текст ошибки: ${errorMessageText}`);
      return false;
    }
  }
}
