import fs from "fs/promises"
import { CONFIG_DIR, HOME_DIR, SETTINGS_FILE_PATH } from "./constant.js"

/**
 * @description This function is used to get the content of the settings file. If the settings file does not exist, it will create a new one with an empty object.
 * @returns content of the settings file as an object
 */

export async function getSettingsFileContent(){
    try {
        await fs.access(CONFIG_DIR)
    } catch (error) {
        await fs.mkdir(CONFIG_DIR, {recursive: true})
    }

    try {
        await fs.access(SETTINGS_FILE_PATH);
        const settingsFileContent = await fs.readFile(SETTINGS_FILE_PATH, "utf-8");
        console.log("Settings file content:", settingsFileContent);
        return JSON.parse(settingsFileContent)        

    } catch (error) {
        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify({}));
        return {}
    }
}

/**
 * @description This function is used to add the API key to the settings file.
 * @param apiKey 
 */

export async function addApiKey(apiKey) {
    const fileContent = await getSettingsFileContent();

    const newContent = {...fileContent, apiKey};
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(newContent));
};

/**
 * @description This function is used to add the AI model to the settings file.
 * @param aiModel 
 */

export async function addAIModel(aiModel) {
    const fileContent  = await getSettingsFileContent();

    const newContent = {...fileContent, aiModel};
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(newContent));
}



class SettingsFileManager {
    #apiKey;
    #aiModel;

    async loadSettingsFileContent(){
        try {
            await fs.access(CONFIG_DIR)
        } catch (error) {
            await fs.mkdir(HOME_DIR, ".clif")
        }

        try {
            await fs.access(SETTINGS_FILE_PATH)
            const settingsFileContent = await fs.readFile(SETTINGS_FILE_PATH, "utf-8");
            return JSON.parse(settingsFileContent)
        } catch (error) {
            await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify({}));
            return {}
        }
    }

    async addApiKey(apiKey){
        if(!apiKey){
            throw new Error("API Key is required");
        }
        const settingsContent = await this.loadSettingsFileContent();
        const newContent = {...settingsContent, apiKey};
        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(newContent));
        this.#apiKey = apiKey;
    }

    async addAiModel(aiModel){
        if(!aiModel){
            throw new Error("AI Model is required");
        }
        const settingsContent = await this.loadSettingsFileContent();
        const newContent = {...settingsContent, apiKey};
        await fs.writeFile(SETTINGS_FILE_PATH, newContent);
        this.#aiModel = aiModel;
    }
}