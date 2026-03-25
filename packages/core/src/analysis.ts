import { Message, Conversation } from './types';

/**
 * Calculates metrics for a conversation, such as turn count, message lengths, etc.
 */
export const calculateConversationMetrics = (conversation: Conversation) => {
  const messages = conversation.messages;
  const turnCount = messages.length;
  const userMessages = messages.filter(m => m.speaker === 'user');
  const assistantMessages = messages.filter(m => m.speaker === 'assistant');

  return {
    turnCount,
    userTurnCount: userMessages.length,
    assistantTurnCount: assistantMessages.length,
    avgMsgLength: messages.reduce((acc, m) => acc + m.content.length, 0) / turnCount || 0,
    startTime: messages[0]?.timestamp,
    endTime: messages[messages.length - 1]?.timestamp,
  };
};

/**
 * Generates turn sequence for sequence analysis (e.g., U, A, U, A).
 */
export const getTurnSequence = (conversation: Conversation) => {
  return conversation.messages.map(m => m.speaker[0].toUpperCase()).join('');
};

/**
 * Extracts all unique roles from a conversation.
 */
export const extractRoles = (conversation: Conversation): string[] => {
  const roles = new Set<string>();
  conversation.messages.forEach(m => {
    if (m.role) roles.add(m.role);
  });
  return Array.from(roles);
};
