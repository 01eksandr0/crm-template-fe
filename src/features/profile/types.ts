export interface Profile {
  email: string;
  role: string;
  roleDisplayName: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone: string | null;
}
