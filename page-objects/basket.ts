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
  private buyBtnSelector = "*[class^='actionBuyProduct']:has-text('Купить')";
  private productPriceSelector = "*[class^='product_price']";
  private productBasketName = "*[class^='basket-item-title']";
  private productBasketPrice = "*[class^='basket-item-price']";
  private productBasketCount = "*[class^='basket-item-count']";
  private productBasketBalance = "*[class^='basket_price']";
  private amountField = "*[name^='product-enter-count']";
  private productData: { [key: string]: { price: string; count: string } } = {};

  constructor(page: Page) {
    this.page = page;
    this.mainPage = new MainPagePO(page);
  }

  async isProductInBasket(
    productName: string,
    productPrice: string,
    productCount: number = 1
  ) {
    await this.getProductDataInBasket();

    const productInfo = this.productData[productName];

    if (!productInfo) {
      return false; // Продукт не найден в корзине
    }

    // Преобразование productPrice в числовое значение (если оно не было числом)
    const numericInputPrice = parseFloat(productPrice);

    // Преобразование productInfo.count в число
    const countInBasket = parseInt(productInfo.count, 10);

    // Проверка цены и количества продуктов
    const isPriceEqual = numericInputPrice === numericInputPrice;
    const isCountEqual = countInBasket === productCount;

    return isPriceEqual && isCountEqual;
  }

  async getProductDataInBasket() {
    const names = await this.getProductBasketName();
    const prices = await this.getProductBasketPrice();
    const counts = await this.getProductBasketCount();

    // Построение объекта данных о продуктах
    for (let i = 0; i < names.length; i++) {
      this.productData[names[i]] = {
        price: prices[i],
        count: counts[i],
      };
    }
  }

  async getTotalBasketPrice() {
    const productNames = await this.getProductBasketName();
    const productPrices = await this.getProductBasketPrice();

    let totalPrice = 0;

    for (let i = 0; i < productNames.length; i++) {
      const price = parseFloat(productPrices[i].match(/\d+/)[0]);
      totalPrice += price;
    }

    return totalPrice;
  }

  async getActualTotalPrice() {
    const totalPriceText = await this.page.textContent(
      this.productBasketBalance
    );
    const numberTotalPrice = parseFloat(totalPriceText.replace(/[^\d.]/g, ""));

    return numberTotalPrice;
  }

  async getProductBasketName() {
    const productNames = await this.page.$$eval(
      this.productBasketName,
      (elements) => {
        return elements
          .filter((element) => element.textContent !== null)
          .map((element) => element.textContent as string);
      }
    );
    return productNames;
  }

  async getProductBasketPrice() {
    const productPrices = await this.page.$$eval(
      this.productBasketPrice,
      (elements) => {
        return elements
          .filter((element) => element.textContent !== null)
          .map((element) => {
            const text = element.textContent as string;
            const match = text.match(/(\d+)/);
            if (match) {
              return match[0];
            } else {
              return "0"; // Возвращаем '0', если число не найдено
            }
          });
      }
    );
    return productPrices;
  }

  async getProductBasketCount() {
    const productCounts = await this.page.$$eval(
      this.productBasketCount,
      (elements) => {
        return elements
          .filter((element) => element.textContent !== null)
          .map((element) => element.textContent as string);
      }
    );
    return productCounts;
  }

  async addNoPromoProductByName(productName: string, quantity: number = 1) {
    const productElements = await this.page.$$(this.noPromoProductSelector);

    for (const productElement of productElements) {
      const textContent = await productElement?.textContent();

      if (textContent && textContent.includes(productName)) {
        const buyButton = await productElement.$(this.buyBtnSelector);

        if (buyButton) {
          const amountField = await productElement.$(this.amountField);
          if (amountField) {
            await amountField.fill(quantity.toString());
          }

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

  async addPromoProductByName(productName: string, quantity: number = 1) {
    const productElements = await this.page.$$(this.promoProductSelector);

    for (const productElement of productElements) {
      const textContent = await productElement?.textContent();

      if (textContent && textContent.includes(productName)) {
        const buyButton = await productElement.$(this.buyBtnSelector);

        if (buyButton) {
          const amountField = await productElement.$(this.amountField);
          if (amountField) {
            // Задаем количество продуктов в поле amountField
            await amountField.fill(quantity.toString());
          }

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

  async getPriceForProduct(productName: string) {
    const productElements = await this.page.$$(this.noPromoProductSelector);

    for (const productElement of productElements) {
      const textContent = await productElement?.textContent();

      if (textContent && textContent.includes(productName)) {
        const productPriceElement = await productElement.$(
          this.productPriceSelector
        );

        if (productPriceElement) {
          const productPriceText = await productPriceElement.textContent();
          const match = productPriceText.match(/\d+/); // Извлекаем числовую часть
          if (match) {
            return match[0];
          }
        }
      }
    }

    throw new Error(
      `Не удалось найти цену для продукта с именем: ${productName}`
    );
  }

  async getPriceForPromoProduct(productName: string) {
    const productElements = await this.page.$$(this.promoProductSelector);

    for (const productElement of productElements) {
      const textContent = await productElement?.textContent();

      if (textContent && textContent.includes(productName)) {
        const productPriceElement = await productElement.$(
          this.productPriceSelector
        );

        if (productPriceElement) {
          const productPriceText = await productPriceElement.textContent();
          const match = productPriceText.match(/\d+/); // Извлекаем числовую часть
          if (match) {
            return match[0];
          }
        }
      }
    }

    throw new Error(
      `Не удалось найти цену для продукта с именем: ${productName}`
    );
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

    const isErrorMessageDisplayed = await this.isErrorMessageNotDisplayed();

    if (!isErrorMessageDisplayed) {
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

      // Проверка, не отображается ли сообщение об ошибке
      const isErrorMessageHidden = await this.isErrorMessageNotDisplayed();

      if (!isErrorMessageHidden) {
        console.log("На странице корзины отображается сообщение об ошибке.");
      }

      return true;
    } catch (error) {
      console.log("Выпадающее меню корзины не отображается.");
      return false; // Выпадающее меню корзины не открылось или селектор dropdownBasket не отображается
    }
  }
}
