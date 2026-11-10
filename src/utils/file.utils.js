import { path } from "path"
import fs from "fs/promises"
import { CONFIG_DIR, SETTINGS_FILE_PATH } from "./constant.js"


class SettingsFileManager {
    #settings = {}
    #loaded = false;
    async load() {
        if(this.#loaded) return;
        try {
            await fs.access(CONFIG_DIR)
        } catch (error) {
            await fs.mkdir(CONFIG_DIR, { recursive: true });
        }

        try {
            await fs.access(SETTINGS_FILE_PATH)
            const settingsFileContent = JSON.parse(await fs.readFile(SETTINGS_FILE_PATH, "utf-8"));
            if (!settingsFileContent || typeof settingsFileContent !== "object" || Array.isArray(settingsFileContent)) {
                throw new Error("Settings file must contain a JSON object");
            }
            this.#settings = settingsFileContent
        } catch (error) {
            if (error.code !== "ENOENT" && !(error instanceof SyntaxError) && error.message !== "Settings file must contain a JSON object") {
                throw error;
            }
            await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify({}));
            this.#settings = {};
        }
        this.#loaded = true;
    }

    async save(key, value) {
        if(typeof value !== "string" || !value.trim()){
            throw new Error(`${key} can't be empty`)
        }
        await this.load();
        const updatedSettings = { ...this.#settings, [key]: value.trim() };
        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updatedSettings));
        this.#settings = updatedSettings
    }

    
    get(key) {
        return this.#settings[key];
    }
    
}


export const settingsFileManager = new SettingsFileManager()



export async function validateWorkspacePath(userRelativePath) {
    if (
        typeof userRelativePath !== "string" ||
        !userRelativePath.trim() ||
        path.isAbsolute(userRelativePath)
    ) {
        return "";
    }

    const fullPath = path.resolve(process.cwd(), userRelativePath);

    const relativePath = path.relative(process.cwd(), fullPath);

    if (
        relativePath === ".." ||
        relativePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativePath)
    ) {
        return ""
    }
    return fullPath
}

export async function fetchOldFileContent(fullPath) {
    let oldText = "";
    try {
        await fs.access(fullPath);
        oldText = await fs.readFile(fullPath, "utf-8");
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
        oldText = ""
    }

    return oldText
} 