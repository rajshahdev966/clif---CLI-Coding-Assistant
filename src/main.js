
import { commonHandler } from "./cli/commonHandler.js";
import {  groqManager } from "./providers/groq.models.js";
import { getAllAIModels, validateApiKey } from "./providers/groq.service.js";
import { addAIModel, addApiKey, getSettingsFileContent } from "./utils/file.utils.js";
import rl from "./utils/readline.utils.js";


export async function main() {
    //Fetch the content of the settings.json file
    const settingsFile = await getSettingsFileContent();

    //Editable variables to store the API key and AI model
    let apiKey = String(settingsFile.apiKey)?.trim() || "";
    let aiModel = String(settingsFile.aiModel)?.trim() || "";

    //Loop to get the valid API key from the user
    while (true) {        
        if (!apiKey) {
            const userInput = (await rl.question("Please enter your Groq API Key = ")).trim();
            if (!userInput) {
                console.log("No API key provided. Please try again.");
                continue;
            }
            apiKey = userInput;
        }

        const isValidApi = await validateApiKey(apiKey);

        if (!isValidApi) {
            const userInput = await rl.question("Please enter your valid Groq API Key = ");
            apiKey = userInput;
            console.log("Invalid or Expired Groq API Key. Please try again.");
            continue;
        }

        await addApiKey(apiKey);
        break;
    }


    //To check whether selected AI model is being served or not by the Groq API Key
    let existingModels = await getAllAIModels(apiKey);

    const modelExists = existingModels.some(model => String(model.id) === String(aiModel));

    if (!modelExists) {
        console.log("\nChoose your preferred AI model:");

        existingModels.forEach((model, index) => {
            console.log(
                `${index + 1}. ${model.id} (${model.owned_by})`
            );
        });

        const userInput = Number((await rl.question("Model Number: ")).trim());
        while(true){
            if (!Number.isInteger(userInput) || userInput < 1 || userInput > existingModels.length) {
                console.log("Invalid selection. Try again.");
                continue;
            }
            aiModel = existingModels[userInput - 1].id;
            await addAIModel(aiModel)
            break;
        }

    }

    groqManager.initialise(apiKey, aiModel)

    while (true) {
        const userInput = (await rl.question("Enter your query: ")).trim();

        if(userInput.startsWith("/")){
            await commonHandler(userInput)
        }
        const stream = await groqManager.getLLM().stream(userInput);

        for await (const chunk of stream) {
            process.stdout.write(chunk.content);
        }
        process.stdout.write("\n");
    }


}