type ShortcutType = { id: string; title: string };
type CustomResponseType = { errno: number; data: any };
type UserInfoType = {
  id: string;
  email: string;
  email_verified: string;
  family_name: string;
  given_name: string;
  locale: string;
  name: string;
  picture: string;
  sub: string;
};
type PayloadType = { type: string; data: any };

export type { UserInfoType, ShortcutType, CustomResponseType, PayloadType };
