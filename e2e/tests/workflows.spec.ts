import { test, expect } from "@playwright/test";

test("public chat selects fixed intent and displays a mocked answer", async ({
  page,
}) => {
  await page.route("**/api/airlines", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        items: [{ id: 1, name: "Airline One", code: "AO" }],
      }),
    }),
  );
  await page.route("**/api/intents", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ items: [{ id: 1, name: "baggage" }] }),
    }),
  );
  await page.route("**/api/conversations", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ id: 1, airline_id: 1, intent_id: 1 }),
    }),
  );
  await page.route("**/api/conversations/1/messages", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        user_message: { id: 1, role: "user", content: "Question" },
        assistant_message: {
          id: 2,
          role: "assistant",
          content: "Mocked answer",
        },
      }),
    }),
  );
  await page.goto("/chat");
  await page.selectOption("select", "1");
  await page.selectOption("select:nth-of-type(2)", "1");
  await page.getByRole("button", { name: "Start conversation" }).click();
  await page.getByPlaceholder("Ask a question").fill("Question");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Mocked answer")).toBeVisible();
});
