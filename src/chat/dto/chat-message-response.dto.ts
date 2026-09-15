export type ChatMessageResponseDto = {
  id: number;
  roomId: number;
  message: string;
  clientId: string;
  userId: number;
  email: string;
  createdAt: Date;
};
