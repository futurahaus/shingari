export interface Reward {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  points_cost: number;
  stock: number | null;
  created_at: string | null;
}

export interface CreateRewardDto {
  name: string;
  description?: string;
  image_url?: string;
  points_cost: number;
  stock?: number;
}

export interface UpdateRewardDto {
  name?: string;
  description?: string;
  image_url?: string;
  points_cost?: number;
  stock?: number;
}

export interface RewardsResponse {
  rewards: Reward[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}
