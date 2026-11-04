import { groqManager } from "../../providers/groq.models.js";
import { validateApiKey } from "../../providers/groq.service.js";
import { addApiKey } from "../../utils/file.utils.js";
import rl from "../../utils/readline.utils.js";

/**
 * @description Change API Key of llm on the requirement of user
 * @param {apiKey}
 */

export async function changeApiCommand() {
    while (true) {
        let userInput = (await rl.question("Please enter your Groq API Key = ")).trim();
        if (!userInput) {
            console.log("No API key provided. Please try again.");
            continue;
        }
        const isValidApi = await validateApiKey(userInput);

        if (!isValidApi) {
            userInput = await rl.question("Please enter your valid Groq API Key = ");
            console.log("Invalid or Expired Groq API Key. Please try again.");
            continue;
        }

        await addApiKey(userInput);
        groqManager.changeApiKey(userInput)
        break;
    }

}