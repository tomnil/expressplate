import { InitializeExpress, PrintRoutes } from './expresshelper';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Initialize Express
const app = InitializeExpress();

// Print some debugging
PrintRoutes(app);
