import type { Meta, StoryObj } from "@storybook/react";
import { Button, ChatWidget, Input, MessageBubble, MetricCard } from "./index";
const meta = { title: "Airline UI/Components" } satisfies Meta;
export default meta;
export const ButtonStory: StoryObj = {
  render: () => <Button>Continue</Button>,
};
export const InputStory: StoryObj = {
  render: () => <Input aria-label="Email" placeholder="Email" />,
};
export const MetricCardStory: StoryObj = {
  render: () => <MetricCard label="Conversations" value={12} />,
};
export const MessageBubbleStory: StoryObj = {
  render: () => <MessageBubble role="assistant" content="How can I help?" />,
};
export const ChatWidgetStory: StoryObj = { render: () => <ChatWidget /> };
