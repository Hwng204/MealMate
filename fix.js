const fs = require('fs');
const file = 'server/src/features/classes/class-controller.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'getMemberProgressPhotos: async (req: Request, res: Response) => {',
  'getMemberProgressPhotos: async (req: Request, res: Response) => {\n    const dateStr = req.query.date as string;'
).replace(
  '      requesterRole\r\n    );',
  '      requesterRole,\n      dateStr\n    );'
).replace(
  '      requesterRole\n    );',
  '      requesterRole,\n      dateStr\n    );'
).replace(
  'uploadMemberProgressPhotos: async (req: Request, res: Response) => {',
  'uploadMemberProgressPhotos: async (req: Request, res: Response) => {\n    const dateStr = req.query.date as string;'
).replace(
  '      files\r\n    );',
  '      files,\n      dateStr\n    );'
).replace(
  '      files\n    );',
  '      files,\n      dateStr\n    );'
);

fs.writeFileSync(file, content);
console.log('Success');
