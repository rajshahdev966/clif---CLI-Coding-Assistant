import { diffPatch } from "./diff.utils";
import rl from "./readline.utils";
import fs from "fs/promises"



export async function requestFileApproval(fullPath, oldContent, updatedContent) {

    console.log("Changes (Y => YES, N => NO)");
    const patch = diffPatch(fullPath, oldContent, updatedContent);
    console.log(patch);
    let userInput = (await rl.question("[USER]: (Y / N)")).trim().toLowerCase()

    //Verification to avoid time-of-check and time-of-use error
    let isVerified = (oldText.match(await fs.readFile(fullPath, "utf-8")))

    if (userInput !== "y") {
        isVerified = false;
    }

    return isVerified;

}
