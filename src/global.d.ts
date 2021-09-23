import { User } from './types';

declare global {

    namespace Express {
        interface Request {
            User: User
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
            JWTENCRYPTIONKEY: string;
            NODE_ENV: 'development' | 'production';
            PORT: string;       // All environment variables are strings
        }
    }
}

export { };
