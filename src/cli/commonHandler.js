import { changeApiCommand } from "./commands/api.command.js";
import { helpCommand } from "./commands/help.command.js";
import { changeModelCommand } from "./commands/model.command.js";


/**
 * @description Handle common commands => /help, /changeAPI, /changeModel
 * @param userInput 
 */
export async function commonHandler(userInput) {
    switch(String(userInput).toLowerCase()){
        case "/help":
            helpCommand();
            break;
        case "/changeapi":
            await changeApiCommand();
            break;
        case "/changemodel":
            await changeModelCommand();
            break;
        default:
            console.log("Invalid command. Type /help for a list of available commands.");
            break;
    }
}