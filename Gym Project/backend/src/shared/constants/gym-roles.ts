export const GYM_ROLES = [
  "member",
  "reception",
  "trainer",
  "manager",
  "owner",
] as const;

export type GymRole = (typeof GYM_ROLES)[number];

export const STAFF_ROLES: GymRole[] = [
  "reception",
  "trainer",
  "manager",
  "owner",
];
