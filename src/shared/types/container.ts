export interface Container {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface CreateContainerRequest {
  title: string;
  description?: string;
}

export interface UpdateContainerRequest {
  title?: string;
  description?: string;
}
