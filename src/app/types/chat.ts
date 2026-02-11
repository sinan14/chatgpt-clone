export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  workspaceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  organization: 'EY';
  name: string;
  location: 'USA' | 'Australia' | 'Japan';
  description: string;
  role: 'Owner' | 'Contributor' | 'Viewer';
  serviceLines: string[];
  subServiceLines: string[];
  sectors: string[];
  areas: string[];
  countries: string[];
  createdAt: Date;
  updatedAt: Date;
}
