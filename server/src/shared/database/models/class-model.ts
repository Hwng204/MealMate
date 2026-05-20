import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const classSchema = new Schema(
  {
    className: { type: String, required: true, trim: true },
    classCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    nutritionistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

classSchema.plugin(mongoosePaginate);

export type Class = InferSchemaType<typeof classSchema>;

export const ClassModel = mongoose.model(
  'Class',
  classSchema
) as PaginateModel<Class>;
