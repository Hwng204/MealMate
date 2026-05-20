import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import {
  NUTRITIONIST_CLIENT_SOURCE,
  NUTRITIONIST_CLIENT_STATUS
} from '~/shared/constants/nutritionist-client-status';

const nutritionistClientSchema = new Schema(
  {
    nutritionistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    source: {
      type: String,
      enum: Object.values(NUTRITIONIST_CLIENT_SOURCE),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(NUTRITIONIST_CLIENT_STATUS),
      default: NUTRITIONIST_CLIENT_STATUS.PENDING,
      index: true
    },
    notes: { type: String, default: '' },
    respondedAt: { type: Date },
    endedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

nutritionistClientSchema.plugin(mongoosePaginate);

nutritionistClientSchema.index(
  { nutritionistId: 1, userId: 1 }
);

export type NutritionistClient = InferSchemaType<
  typeof nutritionistClientSchema
>;

export const NutritionistClientModel = mongoose.model(
  'NutritionistClient',
  nutritionistClientSchema
) as PaginateModel<NutritionistClient>;
