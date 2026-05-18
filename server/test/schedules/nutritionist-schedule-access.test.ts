import { afterEach, describe, expect, it, vi } from 'vitest';

import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { NUTRITIONIST_CLIENT_STATUS } from '~/shared/constants/nutritionist-client-status';
import { ROLE } from '~/shared/constants/role';
import { ScheduleService } from '~/features/schedules/schedule-service';
import {
  NutritionistClientModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findById: vi.fn()
  },
  ScheduleModel: {
    create: vi.fn(),
    findById: vi.fn(),
    paginate: vi.fn()
  },
  DishModel: {
    find: vi.fn()
  },
  ExerciseModel: {
    findById: vi.fn()
  },
  NutritionistClientModel: {
    find: vi.fn(),
    findOne: vi.fn()
  }
}));

const mockUserFindById = vi.mocked(UserModel.findById);
const mockScheduleCreate = vi.mocked(ScheduleModel.create);
const mockScheduleFindById = vi.mocked(ScheduleModel.findById);
const mockSchedulePaginate = vi.mocked(ScheduleModel.paginate);
const mockRelationFind = vi.mocked(NutritionistClientModel.find);
const mockRelationFindOne = vi.mocked(NutritionistClientModel.findOne);

const NUTRI_ID = '507f1f77bcf86cd799439011';
const USER_ID = '507f191e810c19729de860ea';
const SCHEDULE_ID = '507f1f77bcf86cd799439013';
const DISH_ID = '507f1f77bcf86cd799439014';

describe('ScheduleService nutritionist access', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow nutritionist to create schedule for active client', async () => {
    mockRelationFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: 'rel-1' })
      })
    } as any);
    mockUserFindById.mockResolvedValue({
      _id: USER_ID,
      name: 'Client A',
      mealSettings: [{ name: 'Breakfast' }, { name: 'Lunch' }]
    } as any);
    mockScheduleCreate.mockResolvedValue({ _id: SCHEDULE_ID } as any);

    await ScheduleService.createSchedule(
      NUTRI_ID,
      'Coach A',
      ROLE.NUTRITIONIST,
      {
        userId: USER_ID,
        date: new Date('2026-05-18'),
        dayOfWeek: DAY_OF_WEEK.MONDAY
      } as any
    );

    expect(mockScheduleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        user: {
          _id: USER_ID,
          name: 'Client A'
        }
      })
    );
  });

  it('should return only schedules of active clients for nutritionist', async () => {
    mockRelationFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            user: { _id: { toString: () => USER_ID } },
            status: NUTRITIONIST_CLIENT_STATUS.ACTIVE
          }
        ])
      })
    } as any);
    mockSchedulePaginate.mockResolvedValue({ docs: [], totalDocs: 0 } as any);

    await ScheduleService.viewSchedules(NUTRI_ID, ROLE.NUTRITIONIST, {
      filter: {},
      page: 1,
      limit: 10
    } as any);

    expect(mockSchedulePaginate).toHaveBeenCalledWith(
      {
        'user._id': { $in: [USER_ID] }
      },
      expect.any(Object)
    );
  });

  it('should allow nutritionist to tick eaten status for active client schedule', async () => {
    mockRelationFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: 'rel-1' })
      })
    } as any);
    const scheduleDoc = {
      user: { _id: { toString: () => USER_ID } },
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [{ dishId: { toString: () => DISH_ID }, isEaten: false }]
        }
      ],
      save: vi.fn()
    };
    mockScheduleFindById.mockResolvedValue(scheduleDoc as any);

    const result = await ScheduleService.updateScheduleDishStatus(
      SCHEDULE_ID,
      NUTRI_ID,
      ROLE.NUTRITIONIST,
      MEAL_TYPE.BREAKFAST,
      DISH_ID,
      { isEaten: true } as any
    );

    expect(result.meals[0].dishes[0].isEaten).toBe(true);
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should reject nutritionist when client relation is not active', async () => {
    mockRelationFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null)
      })
    } as any);
    mockScheduleFindById.mockResolvedValue({
      user: { _id: { toString: () => USER_ID } },
      meals: []
    } as any);

    await expect(
      ScheduleService.updateScheduleDishStatus(
        SCHEDULE_ID,
        NUTRI_ID,
        ROLE.NUTRITIONIST,
        MEAL_TYPE.BREAKFAST,
        DISH_ID,
        { isEaten: true } as any
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền cập nhật lịch ăn này'
    });
  });
});
