import { Given, Then, When } from "@cucumber/cucumber";
Given("the administrator is on the login page", async function () {
  await this.page?.goto("http://localhost:3000/login");
});
Given("the administrator is authenticated", async function () {});
Given("a persisted conversation exists", async function () {});
When("the administrator submits valid credentials", async function () {});
When("the administrator saves the agent configuration", async function () {});
When(
  "a user selects an airline and approved fixed intent",
  async function () {},
);
When("sends a question", async function () {});
When("the user rates the conversation", async function () {});
Then("the dashboard is displayed", async function () {});
Then("the configuration is persisted", async function () {});
Then("an assistant response is displayed", async function () {});
Then("the conversation can be inspected", async function () {});
