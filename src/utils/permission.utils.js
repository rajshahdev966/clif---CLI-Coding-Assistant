import { diffPatch } from "./diff.utils.js";
import { fetchFileContent } from "./file.utils.js";
import rl from "./readline.utils.js";
import fs from "fs/promises"
import { ui } from "../ui/terminal.js";



export async function requestFileApproval(fullPath, oldContent, updatedContent) {
    const patch = diffPatch(fullPath, oldContent, updatedContent);
    ui.diff(fullPath, patch);
    let userInput = (await ui.question(rl, "approval")).trim().toLowerCase()

    //Verification to avoid time-of-check and time-of-use error
    
    if (userInput !== "y") {
        ui.warn("Change declined. File left unchanged.");
        return {
            isApproved: false,
            status: "rejected"
        }
    }
    
    const currentContent = await fetchFileContent(fullPath)

    if (oldContent !== currentContent) {
        ui.warn("File changed while you reviewed it. This change was not applied.");
        return {
            isApproved: false,
            status: "conflict"
        }
    }

    return {
        isApproved: true,
        status: "success" 
    }

}
