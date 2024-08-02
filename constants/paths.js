import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PATHS = {
    CODE: __dirname + "/../files/code.txt",
    TOKEN: __dirname + "/../files/token.txt",
    MEDIA: __dirname + "/../files/media.csv",
    INSIGHTS: __dirname + "/../files/insights.csv",
    OUTPUT: __dirname + "/../out/insights.csv",
}