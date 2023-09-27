import { Page } from "@playwright/test";

export default class basketPO {
  private page: Page;

  private errorMessage = "*[class^='site-error']";

  constructor(page: Page) {
    this.page = page;
  }

  async isErrorMessageNotDisplayed() {
    const errorMessageElement = await this.page.$(this.errorMessage);
    return !errorMessageElement;
  }
}
