export interface CinemarcResponse<T = any> {
  status: number;
  message: string | null;
  data: T | null;
}