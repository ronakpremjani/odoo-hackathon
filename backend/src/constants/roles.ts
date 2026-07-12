export enum UserRole {
  ADMIN = 'Admin',
  FLEET_MANAGER = 'Fleet Manager',
  SAFETY_OFFICER = 'Safety Officer',
  FINANCIAL_ANALYST = 'Financial Analyst'
}

export const ALL_ROLES = Object.values(UserRole);
