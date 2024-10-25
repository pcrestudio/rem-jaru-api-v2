declare namespace Express {
  export interface Request {
    sub?: string | number | string[];
    role?: string;
  }
}
