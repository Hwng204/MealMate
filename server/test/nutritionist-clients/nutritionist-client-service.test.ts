import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NutritionistClientService } from '~/features/nutritionist-clients/nutritionist-client-service';
import { UserService } from '~/features/users/user-service';
import { NUTRITIONIST_CLIENT_STATUS } from '~/shared/constants/nutritionist-client-status';
import { ROLE } from '~/shared/constants/role';
import {
  NutritionistClientModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findById: vi.fn()
  },
  NutritionistClientModel: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    paginate: vi.fn()
  },
  ScheduleModel: {
    find: vi.fn()
  }
}));

vi.mock('~/features/users/user-service', () => ({
  UserService: {
    updateProfile: vi.fn()
  }
}));

const mockUserFindById = vi.mocked(UserModel.findById);
const mockRelationFindOne = vi.mocked(NutritionistClientModel.findOne);
const mockRelationCreate = vi.mocked(NutritionistClientModel.create);
const mockRelationFindById = vi.mocked(NutritionistClientModel.findById);
const mockScheduleFind = vi.mocked(ScheduleModel.find);
const mockUserServiceUpdateProfile = vi.mocked(UserService.updateProfile);

const nutritionistId = '507f1f77bcf86cd799439011';
const userId = '507f191e810c19729de860ea';

const makeUserDoc = ({
  id,
  name,
  role,
  avatar = '',
  isActive = true
}: {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isActive?: boolean;
}) => ({
  _id: id,
  name,
  avatar,
  role,
  isActive
});

describe('NutritionistClientService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-18T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should create a pending invite when nutritionist invites a user', async () => {
    mockUserFindById
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(
          makeUserDoc({
            id: nutritionistId,
            name: 'Coach A',
            role: ROLE.NUTRITIONIST
          })
        )
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(
          makeUserDoc({
            id: userId,
            name: 'User A',
            role: ROLE.USER
          })
        )
      } as any);

    mockRelationFindOne.mockResolvedValue(null);
    mockRelationCreate.mockResolvedValue({
      _id: 'relation-1',
      status: NUTRITIONIST_CLIENT_STATUS.PENDING
    } as any);

    const result = await NutritionistClientService.inviteClient(nutritionistId, {
      userId,
      notes: 'Invite'
    });

    expect(mockRelationFindOne).toHaveBeenCalledWith({
      'user._id': userId,
      status: {
        $in: [
          NUTRITIONIST_CLIENT_STATUS.PENDING,
          NUTRITIONIST_CLIENT_STATUS.ACTIVE
        ]
      }
    });
    expect(mockRelationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        initiatedBy: ROLE.NUTRITIONIST,
        status: NUTRITIONIST_CLIENT_STATUS.PENDING,
        notes: 'Invite'
      })
    );
    expect(result).toMatchObject({
      _id: 'relation-1',
      status: NUTRITIONIST_CLIENT_STATUS.PENDING
    });
  });

  it('should reject duplicate active or pending relation', async () => {
    mockUserFindById
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(
          makeUserDoc({
            id: nutritionistId,
            name: 'Coach A',
            role: ROLE.NUTRITIONIST
          })
        )
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(
          makeUserDoc({
            id: userId,
            name: 'User A',
            role: ROLE.USER
          })
        )
      } as any);
    mockRelationFindOne.mockResolvedValue({ _id: 'existing' } as any);

    await expect(
      NutritionistClientService.inviteClient(nutritionistId, { userId })
    ).rejects.toMatchObject({
      status: 409,
      message: 'Học viên này đã có lời mời hoặc đang thuộc một chuyên gia khác'
    });
  });

  it('should allow user to request a nutritionist', async () => {
    mockUserFindById
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(
          makeUserDoc({
            id: userId,
            name: 'User A',
            role: ROLE.USER
          })
        )
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(
          makeUserDoc({
            id: nutritionistId,
            name: 'Coach A',
            role: ROLE.NUTRITIONIST
          })
        )
      } as any);
    mockRelationFindOne.mockResolvedValue(null);
    mockRelationCreate.mockResolvedValue({
      _id: 'relation-2',
      initiatedBy: ROLE.USER
    } as any);

    const result = await NutritionistClientService.requestNutritionist(userId, {
      nutritionistId
    });

    expect(mockRelationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        initiatedBy: ROLE.USER,
        status: NUTRITIONIST_CLIENT_STATUS.PENDING
      })
    );
    expect(result).toMatchObject({ _id: 'relation-2' });
  });

  it('should allow counterparty to accept a pending invite', async () => {
    const save = vi.fn();
    mockRelationFindById.mockResolvedValue({
      status: NUTRITIONIST_CLIENT_STATUS.PENDING,
      initiatedBy: ROLE.NUTRITIONIST,
      nutritionist: { _id: { toString: () => nutritionistId } },
      user: { _id: { toString: () => userId } },
      save
    } as any);

    const result = await NutritionistClientService.updateStatus(
      '507f1f77bcf86cd799439099',
      userId,
      ROLE.USER,
      { status: NUTRITIONIST_CLIENT_STATUS.ACTIVE }
    );

    expect(save).toHaveBeenCalled();
    expect(result.status).toBe(NUTRITIONIST_CLIENT_STATUS.ACTIVE);
  });

  it('should reject when creator tries to accept their own invite', async () => {
    mockRelationFindById.mockResolvedValue({
      status: NUTRITIONIST_CLIENT_STATUS.PENDING,
      initiatedBy: ROLE.NUTRITIONIST,
      nutritionist: { _id: { toString: () => nutritionistId } },
      user: { _id: { toString: () => userId } },
      save: vi.fn()
    } as any);

    await expect(
      NutritionistClientService.updateStatus(
        '507f1f77bcf86cd799439099',
        nutritionistId,
        ROLE.NUTRITIONIST,
        { status: NUTRITIONIST_CLIENT_STATUS.ACTIVE }
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Chỉ bên nhận lời mời hoặc yêu cầu mới có thể phản hồi'
    });
  });

  it('should allow nutritionist to update active client physical stats', async () => {
    mockRelationFindOne.mockResolvedValue({
      _id: 'relation-active',
      status: NUTRITIONIST_CLIENT_STATUS.ACTIVE
    } as any);
    mockUserServiceUpdateProfile.mockResolvedValue({ _id: userId } as any);

    const payload = {
      height: 175,
      weight: 72,
      dob: '2000-01-01',
      gender: 'Male',
      bodyfat: 'Medium',
      activityLevel: 'Active_Daily_Frequent'
    } as any;

    const result = await NutritionistClientService.updateClientPhysicalStats(
      nutritionistId,
      userId,
      payload
    );

    expect(mockRelationFindOne).toHaveBeenCalledWith({
      'nutritionist._id': nutritionistId,
      'user._id': userId,
      status: NUTRITIONIST_CLIENT_STATUS.ACTIVE
    });
    expect(mockUserServiceUpdateProfile).toHaveBeenCalledWith(userId, payload);
    expect(result).toMatchObject({ _id: userId });
  });

  it('should reject updating client profile when relation is not active', async () => {
    mockRelationFindOne.mockResolvedValue(null);

    await expect(
      NutritionistClientService.updateClientRestrictions(nutritionistId, userId, {
        diet: 'Anything'
      } as any)
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền quản lý học viên này'
    });
  });

  it('should return client dashboard with weight history and progress', async () => {
    mockRelationFindOne.mockResolvedValue({
      _id: 'rel-active',
      status: NUTRITIONIST_CLIENT_STATUS.ACTIVE,
      nutritionist: { _id: { toString: () => nutritionistId } },
      user: { _id: { toString: () => userId } }
    } as any);

    mockUserFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: userId,
          role: ROLE.USER,
          name: 'User A',
          avatar: '',
          height: 170,
          activityLevel: 'LightlyActive',
          goal: { target: 'Giảm mỡ' },
          diet: 'Anything',
          nutritionTarget: { caloriesTarget: 2200 },
          weightRecord: [
            { weight: 72, date: '2026-05-01T00:00:00.000Z' },
            { weight: 71, date: '2026-05-10T00:00:00.000Z' }
          ]
        })
      })
    } as any);

    mockScheduleFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            date: new Date(),
            meals: [
              {
                dishes: [
                  { isEaten: true, energy: 300 },
                  { isEaten: false, energy: 500 }
                ]
              }
            ],
            workout: [{ isCompleted: true }, { isCompleted: false }]
          }
        ])
      })
    } as any);

    const result = await NutritionistClientService.viewMyClientDashboard(
      nutritionistId,
      userId
    );

    expect(result.profile.currentWeight).toBe(71);
    expect(result.profile.bmi).toBe(24.57);
    expect(result.weightHistory).toHaveLength(2);
    expect(result.mealProgress.today.completedDishes).toBe(1);
    expect(result.mealProgress.today.totalDishes).toBe(2);
    expect(result.workoutProgress.today.completedExercises).toBe(1);
    expect(result.workoutProgress.today.totalExercises).toBe(2);
  });

  it('should search my clients by keyword on user name', async () => {
    const mockPaginate = vi
      .mocked(NutritionistClientModel.paginate)
      .mockResolvedValue({ docs: [], totalDocs: 0 } as any);

    await NutritionistClientService.viewMyClients(nutritionistId, {
      filter: { keyword: 'an' },
      page: 1,
      limit: 10
    } as any);

    expect(mockPaginate).toHaveBeenCalledWith(
      expect.objectContaining({
        'nutritionist._id': nutritionistId,
        'user.name': expect.any(RegExp)
      }),
      expect.any(Object)
    );
  });

  it('should view inbox for user', async () => {
    const mockPaginate = vi
      .mocked(NutritionistClientModel.paginate)
      .mockResolvedValue({ docs: [], totalDocs: 0 } as any);

    await NutritionistClientService.viewInbox(userId, ROLE.USER, {
      filter: { status: NUTRITIONIST_CLIENT_STATUS.PENDING, keyword: 'lan' },
      page: 1,
      limit: 10
    } as any);

    expect(mockPaginate).toHaveBeenCalledWith(
      expect.objectContaining({
        'user._id': userId,
        initiatedBy: ROLE.NUTRITIONIST,
        status: NUTRITIONIST_CLIENT_STATUS.PENDING,
        'nutritionist.name': expect.any(RegExp)
      }),
      expect.any(Object)
    );
  });

  it('should view inbox for nutritionist', async () => {
    const mockPaginate = vi
      .mocked(NutritionistClientModel.paginate)
      .mockResolvedValue({ docs: [], totalDocs: 0 } as any);

    await NutritionistClientService.viewInbox(
      nutritionistId,
      ROLE.NUTRITIONIST,
      {
      filter: { keyword: 'an' },
      page: 1,
      limit: 10
      } as any
    );

    expect(mockPaginate).toHaveBeenCalledWith(
      expect.objectContaining({
        'nutritionist._id': nutritionistId,
        initiatedBy: ROLE.USER,
        'user.name': expect.any(RegExp)
      }),
      expect.any(Object)
    );
  });

  it('should view outbox for nutritionist', async () => {
    const mockPaginate = vi
      .mocked(NutritionistClientModel.paginate)
      .mockResolvedValue({ docs: [], totalDocs: 0 } as any);

    await NutritionistClientService.viewOutbox(
      nutritionistId,
      ROLE.NUTRITIONIST,
      {
        filter: { keyword: 'an' },
        page: 1,
        limit: 10
      } as any
    );

    expect(mockPaginate).toHaveBeenCalledWith(
      expect.objectContaining({
        'nutritionist._id': nutritionistId,
        initiatedBy: ROLE.NUTRITIONIST,
        'user.name': expect.any(RegExp)
      }),
      expect.any(Object)
    );
  });

  it('should return tracking detail for 7 days', async () => {
    mockRelationFindOne.mockResolvedValue({
      _id: 'rel-active',
      status: NUTRITIONIST_CLIENT_STATUS.ACTIVE
    } as any);

    mockUserFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: userId,
          role: ROLE.USER,
          name: 'User A',
          avatar: '',
          height: 170,
          goal: { target: 'Giảm mỡ' },
          weightRecord: [
            { weight: 72, date: '2026-05-12T00:00:00.000Z' },
            { weight: 71.5, date: '2026-05-16T00:00:00.000Z' },
            { weight: 71, date: '2026-05-18T00:00:00.000Z' }
          ]
        })
      })
    } as any);

    mockScheduleFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            date: new Date('2026-05-18T00:00:00.000Z'),
            meals: [
              {
                mealType: 'Breakfast',
                dishes: [{ isEaten: true }, { isEaten: false }]
              }
            ],
            workout: [
              { exerciseName: 'Run', isCompleted: true },
              { exerciseName: 'Push Up', isCompleted: false }
            ]
          },
          {
            date: new Date('2026-05-16T00:00:00.000Z'),
            meals: [
              {
                mealType: 'Lunch',
                dishes: [{ isEaten: true }]
              }
            ],
            workout: [{ exerciseName: 'Run', isCompleted: false }]
          }
        ])
      })
    } as any);

    const result = await NutritionistClientService.viewMyClientTracking(
      nutritionistId,
      userId,
      7
    );

    expect(result.range.days).toBe(7);
    expect(result.weightProgress).toHaveLength(3);
    expect(result.dailyAdherence).toHaveLength(7);
    expect(result.mealBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mealType: 'Breakfast',
          totalDishes: 2,
          completedDishes: 1,
          missedDishes: 1
        }),
        expect.objectContaining({
          mealType: 'Lunch',
          totalDishes: 1,
          completedDishes: 1,
          missedDishes: 0
        })
      ])
    );
    expect(result.workoutBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          exerciseName: 'Run',
          totalExercises: 2,
          completedExercises: 1,
          missedExercises: 1
        }),
        expect.objectContaining({
          exerciseName: 'Push Up',
          totalExercises: 1,
          completedExercises: 0,
          missedExercises: 1
        })
      ])
    );
  });
});
