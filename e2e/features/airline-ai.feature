Feature: Airline AI Agent workflows
  Scenario: administrator logs in and views the dashboard
    Given the administrator is on the login page
    When the administrator submits valid credentials
    Then the dashboard is displayed
  Scenario: administrator saves agent configuration
    Given the administrator is authenticated
    When the administrator saves the agent configuration
    Then the configuration is persisted
  Scenario: user selects airline and fixed intent and receives a response
    Given the administrator is authenticated
    When a user selects an airline and approved fixed intent
    And sends a question
    Then an assistant response is displayed
  Scenario: user rates and inspects a conversation
    Given a persisted conversation exists
    When the user rates the conversation
    Then the conversation can be inspected
