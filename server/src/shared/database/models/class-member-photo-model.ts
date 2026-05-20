import mongoose, { InferSchemaType, Schema } from 'mongoose';

const classMemberPhotoSchema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    images: [
      {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

classMemberPhotoSchema.index({ classId: 1, memberId: 1 }, { unique: true });

export type ClassMemberPhoto = InferSchemaType<typeof classMemberPhotoSchema>;

export const ClassMemberPhotoModel = mongoose.model(
  'ClassMemberPhoto',
  classMemberPhotoSchema
);

export const MAX_CLASS_MEMBER_PHOTOS = 10;
