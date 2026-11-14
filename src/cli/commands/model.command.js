import { groqManager } from "../../providers/groq.manager.js";
import { getSupportedChatModels } from "../../providers/groq.service.js";
import { settingsFileManager } from "../../utils/file.utils.js";
import rl from "../../utils/readline.utils.js";
import { ui } from "../../ui/terminal.js";


/**
 * @description Change AI model of llm on the requirement of user
 */

export async function changeModelCommand() {
    let existingModels = await ui.activity("Finding available models...", () => getSupportedChatModels(settingsFileManager.get("apiKey")));

    ui.models(existingModels, groqManager.getAiModel());

    while (true) {
        let userInput = Number((await ui.question(rl, "model")).trim());
        if (!Number.isInteger(userInput) || userInput < 1 || userInput > existingModels.length) {
            ui.warn("Choose one of the model numbers above.");
            continue;
        }
        let aiModel = existingModels[userInput - 1].id;
        await settingsFileManager.save("aiModel", aiModel);
        groqManager.changeAiModel(aiModel)
        ui.success(`Model selected: ${aiModel}`);
        break;
    }
    
}
