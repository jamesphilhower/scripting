"use strict";
// The purpose of this file is to load environment variables from a .env file 
// and check that all environment variables used in the project are defined in .env
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnvironmentVariables = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
function loadEnvironmentVariables() {
    const envFilePath = path_1.default.join(__dirname, ".env");
    const envFileContents = fs_1.default.readFileSync(envFilePath, "utf8");
    // Split on new lines
    const lines = envFileContents.split("\n");
    function castEnvValue(value) {
        if (value === "true") {
            return true;
        }
        else if (value === "false") {
            return false;
        }
        else if (Number(value).toString() !== "NaN") {
            return Number(value);
        }
        else {
            return value;
        }
    }
    const envVariables = [];
    for (let line of lines) {
        // Skip comments
        if (line.startsWith("#")) {
            continue;
        }
        const [key, value] = line.replace(/[ \t]/g, "").split("=");
        if (!key) {
            console.log("Got empty key:", key, "value", value);
            continue;
        }
        if (key !== key.toUpperCase() || !/^[_A-Z]+$/.test(key)) {
            let errorText = `Invalid environment variable name: ${key}. All env vars should be uppercase with _`;
            throw new Error(errorText);
        }
        // Split the key and value
        // Assign to process.env
        process.env[key] = castEnvValue(value);
        envVariables.push(key);
    }
    // This will search for all .ts and .js files recursively in the current directory
    const projectFiles = glob_1.default.sync("{,!(node_modules)/**}/*.@(ts|js|tsx)", {
        nodir: true,
    });
    const usedEnvVariables = projectFiles
        .map((file) => fs_1.default.readFileSync(file, "utf8"))
        .join("\n")
        .match(/process\.env\.([A-Z_]+)/g)
        .map((match) => match.split(".")[2]);
    const missingInEnv = usedEnvVariables.filter((v) => !envVariables.includes(v));
    if (missingInEnv.length) {
        console.error(`The following variables are used in the project but not defined in .env: ${missingInEnv.join(", ")}`);
        process.exit(1);
    }
    const unusedInProject = envVariables.filter((v) => !usedEnvVariables.includes(v));
    if (unusedInProject.length) {
        console.error(`The following variables are defined in .env but not used in the project: ${unusedInProject.join(", ")}`);
        process.exit(1);
    }
}
exports.loadEnvironmentVariables = loadEnvironmentVariables;
//# sourceMappingURL=environmentVariableLoader.js.map