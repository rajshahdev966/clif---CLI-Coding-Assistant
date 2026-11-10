import { tool } from "langchain"
import * as z from "zod"
import fs from "fs/promises"
import { diffPatch } from "../utils/diff.utils"
import rl from "../utils/readline.utils"
import path from "path"


const createNewFile = tool(
    async function ({ files }) {

        const responses = [];

        for (const file of files) {

            //Workspace validation

            const fullPath = path.resolve(process.cwd(), file.path);

            const relativePath = path.relative(process.cwd(), fullPath);

            if (
                relativePath === ".." ||
                relativePath.startsWith(`..${path.sep}`) ||
                path.isAbsolute(relativePath)
            ) {
                responses.push({
                    path: file.path,
                    status: "access denied"
                })

                continue;
            }



            //Fetch the oldText present in a file
            let oldText = "";
            try {
                await fs.access(fullPath);
                oldText = await fs.readFile(fullPath, "utf-8");
            } catch (error) {//Agar file bani hi nahi hai 
                if (error.code !== "ENOENT") {
                    throw error;
                }
                oldText = ""
            }

            //Asks for the user approval
            console.log("Changes (Y => YES, N => NO)");
            const patch = diffPatch(fullPath, oldText, file.content);
            console.log(patch);
            let userInput = (await rl.question("[USER]: (Y / N)")).trim().toLowerCase()


            //Verification to avoid time-of-check and time-of-use error
            const isValid = (oldText.match(await fs.readFile(fullPath, "utf-8")))

            if(!isValid){
                responses.push({
                    path: file.path,
                    status: "user changed the code in between"
                })

                continue;
            }

            //If user answers No
            if (userInput !== "y") {
                responses.push({
                    path: file.path,
                    status: "rejected"
                })

                continue;
            }


            //If user answwers yes
            try {
                await fs.mkdir(path.dirname(fullPath), {recursive: true})
                await fs.writeFile(fullPath, file.content);
                responses.push({
                    path: file.path,
                    status: "success"
                })
            } catch (error) {
                responses.push({
                    path: file.path,
                    status: "error",
                    message: error.message
                })
            }
        }

        return JSON.stringify({
            responses
        })
    },
    {
        name: "createNewFile",
        description: "Create a new UTF-8 text file or replaces the complete file within the current project workspace. Provide a relative path and content.",
        schema: z.object({
            files: z.array(z.object({
                path: z.string().describe("Relative path to the file"),
                content: z.string().describe("UTF-8 text content to write to the file")
            }))
        })
    }
)