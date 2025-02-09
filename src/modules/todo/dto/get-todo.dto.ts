export interface GetTodoDto {
  id: number;
  check: boolean;
  alert: boolean;
  title: string;
  description: string;
  creatorId: number;
  responsibleId: number;
  createdAt: Date;
  updatedAt: Date;
  todoStateId: number;
  entityReference: string;
  entityStepReference?: string;
  dateExpiration?: string;
}
