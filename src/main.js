
import { HumanMessage } from "langchain";
import { commandHandler } from "./cli/commandHandler.js";
import { groqManager } from "./providers/groq.manager.js";
import { getSupportedChatModels, validateApiKey } from "./providers/groq.service.js";
import { settingsFileManager } from "./utils/file.utils.js";
import rl from "./utils/readline.utils.js";
import graph from "./graphs/graph.js";
import { ui } from "./ui/terminal.js";

export async function main() {
    //Fetch the content of the settings.json file
    await ui.activity("Preparing your workspace...", () => settingsFileManager.load())

    //Loop to get the valid API key from the user
    let inputForApiKey = settingsFileManager.get("apiKey")?.trim();
    while (true) {
        // let savedApiKey = settingsFileManager.get("apiKey")?.trim();
        if (!inputForApiKey) {
             let userInput = (await ui.question(rl, "api")).trim();
            if (!userInput) {
                ui.warn("No API key provided. Please try again.");
                continue;
            }
            inputForApiKey = userInput;
        }
        const isValidApi = await ui.activity("Checking your Groq connection...", () => validateApiKey(inputForApiKey));
        if (!isValidApi) {
            ui.error("Invalid or expired Groq API key. Please try again.");
            let userInput = (await ui.question(rl, "api")).trim();
            if (!userInput) {
                ui.warn("No API key provided. Please try again.");
                continue;
            }
            inputForApiKey = userInput;
            continue;
        }

            await settingsFileManager.save("apiKey", inputForApiKey);
        break;

    }


    //To check whether selected AI model is being served or not by the Groq API Key
    let availableModels = await ui.activity("Finding available models...", () => getSupportedChatModels(settingsFileManager.get("apiKey")));

    const modelExists = availableModels.some(model => String(model.id) === String(settingsFileManager.get("aiModel")?.trim()));

    if (!modelExists) {
        ui.models(availableModels);

        while (true) {
            const userInput = Number((await ui.question(rl, "model")).trim());
            if (!Number.isInteger(userInput) || userInput < 1 || userInput > availableModels.length) {
                ui.warn("Choose one of the model numbers above.");
                continue;
            }
            await settingsFileManager.save("aiModel", availableModels[userInput - 1].id)
            break;
        }

    }

    groqManager.initialise(settingsFileManager.get("apiKey")?.trim(), settingsFileManager.get("aiModel")?.trim())
    ui.ready(groqManager.getAiModel());

    while (true) {
        const userInput = (await ui.question(rl, "task")).trim();

        if (userInput.startsWith("/")) {
            await commandHandler(userInput)
            continue;
        }

        await graph.invoke({ messages: [new HumanMessage(userInput)] }, { configurable: { thread_id: "clif-main" } });

    }


}
