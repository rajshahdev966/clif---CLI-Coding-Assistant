import { groqManager } from "../../providers/groq.manager.js";
import { validateApiKey } from "../../providers/groq.service.js";
import { settingsFileManager } from "../../utils/file.utils.js";
import rl from "../../utils/readline.utils.js";
import { ui } from "../../ui/terminal.js";

/**
 * @description Change API Key of llm on the requirement of user
 * @param {apiKey}
 */

export async function changeApiCommand() {
    while (true) {
        let userInput = (await ui.question(rl, "api")).trim();
        if (!userInput) {
            ui.warn("No API key provided. Please try again.");
            continue;
        }
        const isValidApi = await ui.activity("Checking your Groq connection...", () => validateApiKey(userInput));

        if (!isValidApi) {
            ui.error("Invalid or expired Groq API key. Please try again.");
            continue;
        }

        await settingsFileManager.save("apiKey", userInput);
        groqManager.changeApiKey(userInput);
        ui.success("Groq API key updated.");
        break;
    }

}
