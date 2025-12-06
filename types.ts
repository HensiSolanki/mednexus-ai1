export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export enum MessageType {
  TEXT = 'text',
  ERROR = 'error',
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  previewUrl?: string;
}

export interface Message {
  id: string;
  role: Role;
  type: MessageType;
  content: string;
  timestamp: Date;
  attachment?: Attachment;
  isAudioPlaying?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
