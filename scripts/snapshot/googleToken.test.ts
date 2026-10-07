/**
 * @jest-environment node
 */
const mockGetAccessToken = jest.fn();
const mockGoogleAuth = jest.fn().mockImplementation(() => ({
  getClient: async () => ({ getAccessToken: mockGetAccessToken }),
}));
jest.mock('google-auth-library', () => ({
  GoogleAuth: jest.fn((...args: unknown[]) => mockGoogleAuth(...args)),
}));

import { tokenFromEnv } from './googleToken';

describe('tokenFromEnv', () => {
  beforeEach(() => jest.clearAllMocks());

  it('以服務帳號 JSON 取得唯讀權杖', async () => {
    mockGetAccessToken.mockResolvedValue({ token: 'TOKEN' });
    const key = { client_email: 'a@b', private_key: 'k' };
    const getToken = tokenFromEnv({
      GOOGLE_SERVICE_ACCOUNT_KEY: JSON.stringify(key),
    });
    await expect(getToken()).resolves.toBe('TOKEN');
    expect(mockGoogleAuth).toHaveBeenCalledWith({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  });

  it('未設定、格式錯誤或取不到權杖時拋錯，且訊息不含金鑰內容', async () => {
    await expect(tokenFromEnv({})()).rejects.toThrow(
      /GOOGLE_SERVICE_ACCOUNT_KEY/
    );
    await expect(
      tokenFromEnv({ GOOGLE_SERVICE_ACCOUNT_KEY: 'SECRET{' })()
    ).rejects.toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining('SECRET'),
      })
    );
    mockGetAccessToken.mockResolvedValue({ token: null });
    await expect(
      tokenFromEnv({ GOOGLE_SERVICE_ACCOUNT_KEY: '{}' })()
    ).rejects.toThrow(/權杖/);
  });
});
