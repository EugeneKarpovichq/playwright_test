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
  private errorMessage = "*[class^='site-error']";
  private productSelector =
    "//div[@class='note-list row']//div[@class='col-3 mb-5']";
  private noPromoProductSelector =
    "//div[@class='note-list row']//div[@class='note-item card h-100']";
  private promoProductSelector =
    "//div[@class='note-list row']//div[contains(@class, 'hasDiscount')]";
  private paginationBtn = "//a[@class='page-link']";
  private buyBtnSelector = "*[class^='actionBuyProduct']:has-text('Купить')";

  constructor(page: Page) {
    this.page = page;
    this.mainPage = new MainPagePO(page);
  }

  async addNoPromoProduct(productName: string) {
    const productElements = await this.page.$$(this.noPromoProductSelector);

    for (const productElement of productElements) {
      const textContent = await productElement?.textContent();

      if (textContent && textContent.includes(productName)) {
        const buyButton = await productElement.$(this.buyBtnSelector);

        if (buyButton) {
          await buyButton.click();
          await this.page.waitForResponse((response) => {
            return (
              response.url() === "https://enotes.pointschool.ru/basket/get" &&
              response.status() === 200
            );
          });
          return;
        }
      }
    }

    throw new Error(`Не удалось найти элемент с именем: ${productName}`);
  }

  async goToBasketPage() {
    await this.page.click(this.goToBasketSelector);
  }

  async isErrorMessageNotDisplayed() {
    const errorMessageElement = await this.page.$(this.errorMessage);
    return !errorMessageElement;
  }

  async isBasketPageOpened() {
    const currentUrl = this.page.url();
    const isBasketPage = currentUrl.endsWith("/basket");

    if (!isBasketPage) {
      return false;
    }

    const isErrorMessageHidden = await this.isErrorMessageNotDisplayed();

    if (!isErrorMessageHidden) {
      throw new Error("На странице корзины отображается сообщение об ошибке.");
    }

    return true;
  }

  async clearBasket() {
    const isCleared = await this.isBasketCleared();
    if (isCleared) {
      console.log("Корзина пуста, операция очистки корзины не требуется.");
    } else {
      await this.mainPage.clickBasketBtn();

      try {
        await this.page.waitForSelector(this.dropdownBasket, {
          state: "visible",
          timeout: 5000,
        });
      } catch (error) {
        console.log("Выпадающий список корзины не открылся.");
      }

      await this.page.click(this.clearBasketBtn);
      await this.page.waitForResponse((response) => {
        return (
          response.url() === "https://enotes.pointschool.ru/basket/get" &&
          response.status() === 200
        );
      });
    }
  }

  async isBasketCleared() {
    const cartItemCountText = await this.page.textContent(
      this.basketItemsCount
    );

    if (cartItemCountText === "0") {
      return true;
    } else {
      return false;
    }
  }

  async countProductsInBasket() {
    const cartItemCountText = await this.page.textContent(
      this.basketItemsCount
    );
    return cartItemCountText;
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
}
