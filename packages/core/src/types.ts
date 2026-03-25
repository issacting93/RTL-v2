/**
 * Represents a single turn in a conversation.
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** The participant who sent the message */
  speaker: 'user' | 'assistant' | 'system';
  /** The textual content of the message */
  content: string;
  /** ISO 8601 timestamp or temporal index */
  timestamp?: string;
  /** Assigned AROMA role or functional category */
  role?: string;
  /** Extensible key-value store for research-specific data (e.g., tension, status) */
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  messages: Message[];
  metadata?: Record<string, any>;
}

export interface Annotation {
  id: string;
  targetId: string; // Message ID or Conversation ID
  type: string;
  value: any;
  annotator: string;
  timestamp: string;
}
