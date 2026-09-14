import { chromium, type Browser, type Page } from "@playwright/test";
import {
  setWorldConstructor,
  World as CucumberWorld,
} from "@cucumber/cucumber";

export class World extends CucumberWorld {
  browser!: Browser;
  page!: Page;
  configurationSaved = false;
  conversationId: number | null = null;
  rated = false;

  async start() {
    this.browser = await chromium.launch();
    this.page = await this.browser.newPage({
      baseURL: "http://localhost:3000",
    });
  }

  async stop() {
    await this.browser?.close();
  }
}

setWorldConstructor(World);
