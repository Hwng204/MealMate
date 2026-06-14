import mongoose, { InferSchemaType, type PaginateModel, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const nutritionistReviewSchema = new Schema(
  {
    nutritionistId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, required: true, trim: true },
  },
  {
    timestamps: true
  }
);

// Prevent a user from reviewing the same class more than once
nutritionistReviewSchema.index({ classId: 1, userId: 1 }, { unique: true });

nutritionistReviewSchema.plugin(mongoosePaginate);

export type NutritionistReview = InferSchemaType<typeof nutritionistReviewSchema>;

export const NutritionistReviewModel = mongoose.model(
  'NutritionistReview',
  nutritionistReviewSchema
) as PaginateModel<NutritionistReview>;
