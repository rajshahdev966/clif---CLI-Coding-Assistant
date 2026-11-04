import { groqManager } from "../../providers/groq.models.js";
import { getAllAIModels } from "../../providers/groq.service.js";
import { addAIModel, getSettingsFileContent } from "../../utils/file.utils.js";
import rl from "../../utils/readline.utils.js";


/**
 * @description Change AI model of llm on the requirement of user
 */

export async function changeModelCommand() {
    const settingsFileContent = await getSettingsFileContent();    
    let existingModels = await getAllAIModels(settingsFileContent.apiKey);

    console.log("\nChoose your preferred AI model:");
    existingModels.forEach((model, index) => {
        console.log(
            `${index + 1}. ${model.id} (${model.owned_by})`
        );
    });

    while (true) {
        let userInput = Number((await rl.question("Model Number: ")).trim());
        if (!Number.isInteger(userInput) || userInput < 1 || userInput > existingModels.length) {
            console.log("Invalid selection. Try again.");
            userInput = rl.question("Enter valid Model Number: ")
            continue;
        }
        let aiModel = existingModels[userInput - 1].id;
        await addAIModel(aiModel);
        groqManager.changeAiModel(aiModel)
        break;
    }
    
}