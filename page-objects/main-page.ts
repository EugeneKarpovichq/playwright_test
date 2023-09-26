import { Page } from "@playwright/test";
import { testConfig } from "../config";

export default class MainPagePO {
  private page: Page;

  private basketBtn = "#basketContainer";
  private userField = "#dropdownUser";
  private userAvatar = `${this.userField} *[class^='user-avatar']`;
  private userName = `${this.userField} .text-uppercase`;
  private authButtonsSelector =
    "//*[@id='navbarNav']/ul/li[3]/a[contains(text(), 'Вход')]";
  private loginFieldSelector = "//*[@id='loginform-username']";
  private passwordFieldSelector = "//*[@id='loginform-password']";
  private loginButtonSelector = "//*[@name='login-button']";

  constructor(page: Page) {
    this.page = page;
  }

  async clickBasketBtn() {
    await this.page.click(this.basketBtn);
  }

  async logIn(login: string, password: string) {
    await this.page.click(this.authButtonsSelector);
    await this.page.fill(this.loginFieldSelector, login);
    await this.page.fill(this.passwordFieldSelector, password);
    await this.page.click(this.loginButtonSelector);
    await this.page.waitForLoadState("networkidle");
  }

  async isLoggedIn() {
    const userAvatar = await this.page.$(this.userAvatar);
    const userName = await this.page.$(this.userName + `:has-text('${testConfig.username}')`);

    return !!userAvatar && !!userName;
  }
}
