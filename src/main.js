
import { commonHandler } from "./cli/commonHandler.js";
import { groqManager } from "./providers/groq.models.js";
import { getAllAIModels, validateApiKey } from "./providers/groq.service.js";
import { settingsFileManager } from "./utils/file.utils.js";
import rl from "./utils/readline.utils.js";


export async function main() {
    //Fetch the content of the settings.json file
    await settingsFileManager.load()

    //Loop to get the valid API key from the user
    while (true) {
        let userInput = settingsFileManager.get("apiKey")?.trim();
        if (!userInput) {
            userInput = (await rl.question("Please enter your Groq API Key = ")).trim();
            if (!userInput) {
                console.log("No API key provided. Please try again.");
                continue;
            }

            const isValidApi = await validateApiKey(userInput);
            if (!isValidApi) {
                console.log("Invalid or Expired Groq API Key. Please try again.");
                continue;
            }

            await settingsFileManager.save("apiKey", userInput);
            break;
        }
        break;
    }


    //To check whether selected AI model is being served or not by the Groq API Key
    let existingModels = await getAllAIModels(settingsFileManager.get("apiKey"));

    const modelExists = existingModels.some(model => String(model.id) === String(settingsFileManager.get("aiModel")?.trim()));

    if (!modelExists) {
        console.log("\nChoose your preferred AI model:");

        existingModels.forEach((model, index) => {
            
            console.log(
                `${index + 1}. ${model.id} (${model.owned_by})`
            );
        });

        while (true) {
            const userInput = Number((await rl.question("Model Number: ")).trim());
            if (!Number.isInteger(userInput) || userInput < 1 || userInput > existingModels.length) {
                console.log("Invalid selection. Try again.");
                continue;
            }
            await settingsFileManager.save("aiModel", existingModels[userInput - 1].id)
            break;
        }

    }

    groqManager.initialise(settingsFileManager.get("apiKey")?.trim(), settingsFileManager.get("aiModel")?.trim())

    while (true) {
        const userInput = (await rl.question("Enter your query: ")).trim();

        if (userInput.startsWith("/")) {
            await commonHandler(userInput)
            continue;
        }
        const stream = await groqManager.getLLM().stream(userInput);

        for await (const chunk of stream) {
            process.stdout.write(chunk.content);
        }
        process.stdout.write("\n");
    }

}
