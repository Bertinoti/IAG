import type { Meta, StoryObj } from "@storybook/react";
import {
  Alert,
  Badge,
  Button,
  ChatWidget,
  Input,
  MessageBubble,
  MetricCard,
  Modal,
  Select,
  Spinner,
} from "./index";
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
export const AlertStory: StoryObj = {
  render: () => (
    <Alert variant="success">Configuration saved successfully.</Alert>
  ),
};
export const AlertErrorStory: StoryObj = {
  render: () => <Alert variant="error">Unable to send your message.</Alert>,
};
export const BadgeStory: StoryObj = {
  render: () => <Badge tone="brand">Vueling</Badge>,
};
export const SpinnerStory: StoryObj = {
  render: () => <Spinner label="Sending message" />,
};
export const SelectStory: StoryObj = {
  render: () => (
    <Select label="Airline" defaultValue="vueling">
      <option value="vueling">Vueling</option>
      <option value="iberia">Iberia</option>
    </Select>
  ),
};
export const ModalStory: StoryObj = {
  render: () => (
    <Modal open title="Start a new conversation?" onClose={() => undefined}>
      <p className="text-sm text-slate-600">
        Changing the selection will clear the current messages.
      </p>
    </Modal>
  ),
};
