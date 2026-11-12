import { changeApiCommand } from "./commands/api.command.js";
import { helpCommand } from "./commands/help.command.js";
import { changeModelCommand } from "./commands/model.command.js";
import { ui } from "../ui/terminal.js";


/**
 * @description Handle common commands => /help, /changeAPI, /changeModel
 * @param userInput 
 */
export async function commandHandler(userInput) {
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
        case "/exit":
            ui.goodbye();
            process.exit(0);
        default:
            ui.warn("Unknown command. Type /help to see your commands.");
            break;
    }
}
