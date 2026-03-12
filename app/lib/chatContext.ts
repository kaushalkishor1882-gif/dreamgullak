import { ChatIntent } from "./chatIntents";

export type ChatContext = {
  lastIntent?: ChatIntent;
  lastMessage?: string;
};
