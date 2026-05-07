import { TokenPayload } from '../interfaces/Auth.js';
import { IUser } from '../interfaces/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser | TokenPayload;
    }
  }
}
