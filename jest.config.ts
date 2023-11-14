import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    modulePathIgnorePatterns: ["UPDATED", "node_modules"]
};

export default config