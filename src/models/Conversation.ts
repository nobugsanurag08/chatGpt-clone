import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  edited?: boolean;
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
    size: number;
  }[];
}

export interface IConversation extends Document {
  userId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  attachments: [{
    type: { type: String, enum: ['image', 'document'] },
    url: String,
    name: String,
    size: Number
  }]
});

const ConversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false }
});

ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
