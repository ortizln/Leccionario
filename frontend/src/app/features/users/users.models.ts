export type UserItem = {
  id: number;
  username: string;
  email: string;
  identification: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  institutionId: number;
  institutionName: string;
  specialization: string | null;
  roles: string[];
};

export type RoleItem = {
  name: string;
  description: string;
  permissions: string[];
};

export type InstitutionItem = {
  id: number;
  name: string;
};

export type UserSavePayload = {
  username: string;
  email: string;
  password: string;
  identification: string;
  firstName: string;
  lastName: string;
  institutionId: number;
  enabled: boolean;
  roles: string[];
};
