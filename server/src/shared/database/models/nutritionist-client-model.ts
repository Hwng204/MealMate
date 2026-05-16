import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { NUTRITIONIST_CLIENT_STATUS } from '~/shared/constants/nutritionist-client-status';
import { ROLE } from '~/shared/constants/role';

const participantSnapshotSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  { _id: false }
);

const nutritionistClientSchema = new Schema(
  {
    nutritionist: {
      type: participantSnapshotSchema,
      required: true
    },
    user: {
      type: participantSnapshotSchema,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(NUTRITIONIST_CLIENT_STATUS),
      default: NUTRITIONIST_CLIENT_STATUS.PENDING,
      required: true
    },
    initiatedBy: {
      type: String,
      enum: [ROLE.NUTRITIONIST, ROLE.USER],
      required: true
    },
    notes: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

nutritionistClientSchema.plugin(mongoosePaginate);

nutritionistClientSchema.index(
  {
    'user._id': 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          NUTRITIONIST_CLIENT_STATUS.PENDING,
          NUTRITIONIST_CLIENT_STATUS.ACTIVE
        ]
      }
    }
  }
);

nutritionistClientSchema.index(
  {
    'nutritionist._id': 1,
    'user._id': 1
  },
  {
    unique: true
  }
);

nutritionistClientSchema.index({ 'nutritionist._id': 1, status: 1 });
nutritionistClientSchema.index({ 'user._id': 1, status: 1 });

export type NutritionistClient = InferSchemaType<
  typeof nutritionistClientSchema
>;

export const NutritionistClientModel = mongoose.model(
  'NutritionistClient',
  nutritionistClientSchema
) as PaginateModel<NutritionistClient>;
