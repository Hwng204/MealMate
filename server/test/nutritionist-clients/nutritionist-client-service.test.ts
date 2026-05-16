import { afterEach, describe, expect, it, vi } from 'vitest';

import { NutritionistClientService } from '~/features/nutritionist-clients/nutritionist-client-service';
import { NUTRITIONIST_CLIENT_STATUS } from '~/shared/constants/nutritionist-client-status';
import { ROLE } from '~/shared/constants/role';
import {
  NutritionistClientModel,
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
  }
}));

const mockUserFindById = vi.mocked(UserModel.findById);
const mockRelationFindOne = vi.mocked(NutritionistClientModel.findOne);
const mockRelationCreate = vi.mocked(NutritionistClientModel.create);
const mockRelationFindById = vi.mocked(NutritionistClientModel.findById);

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
  afterEach(() => {
    vi.clearAllMocks();
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
});
