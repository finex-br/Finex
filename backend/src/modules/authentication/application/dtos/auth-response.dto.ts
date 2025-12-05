export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
  };
}
