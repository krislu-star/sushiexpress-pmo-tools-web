import { meetingEditableOf } from './features';

describe('meetingEditableOf（spec FR-017）', () => {
  it('只有 "true" 開啟會議編輯；未設定或其他值皆為唯讀', () => {
    expect(meetingEditableOf({ NEXT_PUBLIC_PMO_MEETING_EDIT: 'true' })).toBe(
      true
    );
    for (const value of [undefined, '', 'false', '1', 'TRUE', 'yes']) {
      expect(meetingEditableOf({ NEXT_PUBLIC_PMO_MEETING_EDIT: value })).toBe(
        false
      );
    }
    expect(meetingEditableOf({})).toBe(false);
  });
});
