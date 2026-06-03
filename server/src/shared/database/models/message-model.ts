import mongoose, { InferSchemaType, type PaginateModel, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

messageSchema.plugin(mongoosePaginate);

export type Message = InferSchemaType<typeof messageSchema>;

export const MessageModel = mongoose.model(
  'Message',
  messageSchema
) as PaginateModel<Message>;
