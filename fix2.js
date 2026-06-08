const fs = require('fs');
const file = 'server/src/features/classes/class-service.ts';
let content = fs.readFileSync(file, 'utf8');

const oldStr1 = `  getMemberProgressPhotos: async (
    classId: string,
    memberId: string,
    requesterId: string,
    requesterRole: string
  ) => {`;
const newStr1 = `  getMemberProgressPhotos: async (
    classId: string,
    memberId: string,
    requesterId: string,
    requesterRole: string,
    dateStr?: string
  ) => {`;

const oldStr2 = `    const doc = await ClassMemberPhotoModel.findOne({ classId, memberId });`;
const newStr2 = `    const targetDate = dateStr || new Date().toLocaleDateString('en-CA');
    const doc = await ClassMemberPhotoModel.findOne({ classId, memberId, date: targetDate });`;

const oldStr3 = `  uploadMemberProgressPhotos: async (
    classId: string,
    memberId: string,
    files: Express.Multer.File[]
  ) => {`;
const newStr3 = `  uploadMemberProgressPhotos: async (
    classId: string,
    memberId: string,
    files: Express.Multer.File[],
    dateStr?: string
  ) => {`;

const oldStr4 = `    let doc = await ClassMemberPhotoModel.findOne({ classId, memberId });
    const currentCount = doc?.images?.length || 0;

    if (currentCount >= MAX_CLASS_MEMBER_PHOTOS) {
      throw createHttpError(
        400,
        \`Bạn chỉ có thể gửi tối đa \${MAX_CLASS_MEMBER_PHOTOS} ảnh\`
      );
    }`;

const newStr4 = `    const targetDate = dateStr || new Date().toLocaleDateString('en-CA');
    let doc = await ClassMemberPhotoModel.findOne({ classId, memberId, date: targetDate });
    const currentCount = doc?.images?.length || 0;

    if (currentCount >= MAX_CLASS_MEMBER_PHOTOS) {
      throw createHttpError(
        400,
        \`Bạn chỉ có thể gửi tối đa \${MAX_CLASS_MEMBER_PHOTOS} ảnh trong ngày này\`
      );
    }`;

const oldStr5 = `      const uploadResult = await uploadImage(file.buffer, {
        folder: 'class-progress-photos',
        public_id: \`\${classId}-\${memberId}-\${Date.now()}-\${i}\`
      });`;
const newStr5 = `      const uploadResult = await uploadImage(file.buffer, {
        folder: 'class-progress-photos',
        public_id: \`\${classId}-\${memberId}-\${targetDate}-\${Date.now()}-\${i}\`
      });`;

const oldStr6 = `    if (!doc) {
      doc = await ClassMemberPhotoModel.create({
        classId,
        memberId,
        images: newImages
      });`;
const newStr6 = `    if (!doc) {
      doc = await ClassMemberPhotoModel.create({
        classId,
        memberId,
        date: targetDate,
        images: newImages
      });`;

const normalize = s => s.replace(/\r\n/g, '\n');
content = normalize(content);

content = content.replace(normalize(oldStr1), normalize(newStr1))
                 .replace(normalize(oldStr2), normalize(newStr2))
                 .replace(normalize(oldStr3), normalize(newStr3))
                 .replace(normalize(oldStr4), normalize(newStr4))
                 .replace(normalize(oldStr5), normalize(newStr5))
                 .replace(normalize(oldStr6), normalize(newStr6));

fs.writeFileSync(file, content);
console.log('Success service update');
