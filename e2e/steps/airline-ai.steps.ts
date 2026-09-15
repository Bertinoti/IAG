import {
  After,
  Before,
  Given,
  Then,
  When,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { World } from "../support/world";

const admin = { id: 1, email: "admin@example.com", role: "admin" as const };
setDefaultTimeout(15000);

Before(async function (this: World) {
  await this.start();
  await this.page.route("**/api/**", async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const method = request.method();
    if (pathname === "/api/auth/session" || pathname === "/api/auth/login")
      return route.fulfill({ status: 200, body: JSON.stringify({ admin }) });
    if (pathname === "/api/dashboard")
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          kpis: {},
          conversations_by_airline: [],
          intent_distribution: [],
          feedback_distribution: [],
        }),
      });
    if (pathname === "/api/agent-config" && method === "GET")
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          context: "Demo context",
          guardrails: "Be safe",
          content: "Airline policies",
          language: "English",
        }),
      });
    if (pathname === "/api/agent-config" && method === "PUT") {
      this.configurationSaved = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 1,
          context: "Updated context",
          guardrails: "Updated guardrails",
          content: "Updated content",
          language: "English",
        }),
      });
    }
    if (pathname === "/api/airlines")
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          items: [{ id: 1, name: "Vueling", code: "VY" }],
        }),
      });
    if (pathname === "/api/intents")
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ items: [{ id: 1, name: "cancellation" }] }),
      });
    if (pathname === "/api/conversations" && method === "POST") {
      this.conversationId = 42;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ id: 42, airline_id: 1, intent_id: 1 }),
      });
    }
    if (pathname === "/api/conversations/42/messages")
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          user_message: { id: 1, role: "user", content: "How was my flight?" },
          assistant_message: {
            id: 2,
            role: "assistant",
            content: "This is a controlled assistant response.",
          },
        }),
      });
    if (pathname === "/api/conversations/42/rating" && method === "PUT") {
      this.rated = true;
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ rating: "positive" }),
      });
    }
    if (pathname === "/api/conversations" && method === "GET")
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          items: [
            {
              id: 42,
              airline_code: "VY",
              intent_name: "cancellation",
              message_count: 2,
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        }),
      });
    if (pathname === "/api/conversations/42" && method === "GET")
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          conversation: { id: 42, airline_id: 1, intent_id: 1 },
          messages: [
            { id: 1, role: "user", content: "How was my flight?" },
            {
              id: 2,
              role: "assistant",
              content: "This is a controlled assistant response.",
            },
          ],
          rating: "positive",
        }),
      });
    return route.continue();
  });
});

After(async function (this: World) {
  await this.stop();
});

Given("the administrator is on the login page", async function (this: World) {
  await this.page.goto("/login");
});
When(
  "the administrator submits valid credentials",
  async function (this: World) {
    await this.page.getByLabel("Email").fill("admin@example.com");
    await this.page.getByLabel("Password").fill("local-password");
    await this.page.getByRole("button", { name: "Sign in" }).click();
  },
);
Then("the dashboard is displayed", async function (this: World) {
  await expect(
    this.page.getByRole("heading", { name: "Dashboard" }),
  ).toBeVisible();
});
Given("the administrator is authenticated", async function (this: World) {
  await this.page.goto("/agent");
});
When(
  "the administrator saves the agent configuration",
  async function (this: World) {
    await this.page.getByLabel("context").fill("Updated context");
    await this.page.getByRole("button", { name: "Save configuration" }).click();
  },
);
Then("the configuration is persisted", async function (this: World) {
  await expect(this.page.getByText("Saved")).toBeVisible();
  expect(this.configurationSaved).toBe(true);
});
When(
  "a user selects an airline and approved fixed intent",
  async function (this: World) {
    await this.page.goto("/chat");
    await this.page.getByLabel("Choose airline").selectOption("1");
    await this.page.getByLabel("Choose intent").selectOption("1");
  },
);
When("sends a question", async function (this: World) {
  await this.page.getByPlaceholder("Ask a question").fill("How was my flight?");
  await this.page.getByPlaceholder("Ask a question").press("Enter");
});
Then("an assistant response is displayed", async function (this: World) {
  await expect(
    this.page.getByText("This is a controlled assistant response."),
  ).toBeVisible();
});
Given("a persisted conversation exists", async function (this: World) {
  await this.page.goto("/chat");
  await this.page.getByLabel("Choose airline").selectOption("1");
  await this.page.getByLabel("Choose intent").selectOption("1");
  await expect(this.page.getByPlaceholder("Ask a question")).toBeEnabled();
});
When("the user rates the conversation", async function (this: World) {
  await this.page.getByRole("button", { name: "👍" }).click();
});
Then("the conversation can be inspected", async function (this: World) {
  expect(this.rated).toBe(true);
  await this.page.goto("/conversations");
  await expect(this.page.getByRole("link", { name: "42" })).toBeVisible();
  await this.page.goto("/conversations/42");
  await expect(
    this.page.getByText("This is a controlled assistant response."),
  ).toBeVisible();
});
