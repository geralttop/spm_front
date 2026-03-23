export interface Container {
  id: string;
  title: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface CreateContainerRequest {
  title: string;
  description?: string;
  color: string;
}

export interface UpdateContainerRequest {
  title?: string;
  description?: string;
  color?: string;
}
