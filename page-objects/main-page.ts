import { Page } from "@playwright/test";
import { testConfig } from "../config";

export default class MainPagePO {
  private page: Page; 

  private navigationBar = ".navbar";
  private basketBtn = `${this.navigationBar} #basketContainer`;
  private userField = '#dropdownUser';
  private userAvatar = `${this.userField} .user-avatar`;
  private userName = `${this.userField} .text-uppercase`;

  constructor(page: Page) {
    this.page = page;
  }

  async clickBasketBtn() {
    await this.page.click(this.basketBtn);
  }

  async isLoggedIn() {
    const userAvatar = await this.page.$(this.userAvatar);
    const userName = await this.page.$(this.userName + `:has-text('${testConfig.username}')`);

    return !!userAvatar && !!userName;
  }
}
