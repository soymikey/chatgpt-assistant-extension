type ShortcutType = { id: string; title: string };
type CustomResponseType = { errno: number; data: any };
type UserInfoType = { username: string; userId: string; sub?: "" };
type PayloadType = { type: string; data: any };

export type { UserInfoType, ShortcutType, CustomResponseType, PayloadType };
