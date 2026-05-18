import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate,
  validateQuery
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { NutritionistClientController } from './nutritionist-client-controller';
import {
  clientTrackingQuerySchema,
  createNutritionistClientInvitationSchema,
  createNutritionistClientRequestSchema,
  nutritionistClientQuerySchema,
  updateNutritionistClientStatusSchema
} from './nutritionist-client-dto';
import {
  updateAllergensSchema,
  updateNutritionTargetSchema,
  updatePhysicalStatsSchema,
  updateRestrictionsSchema
} from '../users/user-dto';

const router = Router();

router.post(
  '/invitations',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  parseFormData,
  validate(createNutritionistClientInvitationSchema.shape),
  asyncHandler(NutritionistClientController.inviteClient)
);

router.post(
  '/requests',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(createNutritionistClientRequestSchema.shape),
  asyncHandler(NutritionistClientController.requestNutritionist)
);

router.get(
  '/my-clients',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  validateQuery(nutritionistClientQuerySchema.shape),
  asyncHandler(NutritionistClientController.viewMyClients)
);

router.get(
  '/inbox',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  validateQuery(nutritionistClientQuerySchema.shape),
  asyncHandler(NutritionistClientController.viewInbox)
);

router.get(
  '/outbox',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  validateQuery(nutritionistClientQuerySchema.shape),
  asyncHandler(NutritionistClientController.viewOutbox)
);

router.get(
  '/my-clients/:userId/dashboard',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  asyncHandler(NutritionistClientController.viewMyClientDashboard)
);

router.get(
  '/my-clients/:userId/tracking',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  validateQuery(clientTrackingQuerySchema.shape),
  asyncHandler(NutritionistClientController.viewMyClientTracking)
);

router.get(
  '/my-clients/:userId',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  asyncHandler(NutritionistClientController.viewMyClientDetail)
);

router.put(
  '/my-clients/:userId/physical-stats',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  parseFormData,
  validate(updatePhysicalStatsSchema.shape),
  asyncHandler(NutritionistClientController.updateClientPhysicalStats)
);

router.put(
  '/my-clients/:userId/nutrition-target',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  parseFormData,
  validate(updateNutritionTargetSchema.shape),
  asyncHandler(NutritionistClientController.updateClientNutritionTarget)
);

router.put(
  '/my-clients/:userId/restrictions',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  parseFormData,
  validate(updateRestrictionsSchema.shape),
  asyncHandler(NutritionistClientController.updateClientRestrictions)
);

router.put(
  '/my-clients/:userId/allergens',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  parseFormData,
  validate(updateAllergensSchema.shape),
  asyncHandler(NutritionistClientController.updateClientAllergens)
);

router.patch(
  '/:id/status',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  parseFormData,
  validate(updateNutritionistClientStatusSchema.shape),
  asyncHandler(NutritionistClientController.updateStatus)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  asyncHandler(NutritionistClientController.deleteRelation)
);

export default router;
