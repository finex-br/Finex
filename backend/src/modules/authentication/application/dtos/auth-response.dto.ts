export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    role: string;
    createdAt: Date;
  };
}
