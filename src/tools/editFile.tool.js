import { tool } from "langchain"
import * as z from "zod"
import path from "path"
import fs from "fs/promises"

const editFile = tool(
    async function ({ files }) {

        const responses = [];

        for (const file of files) {
            //Path Validation
            const workspace = process.cwd()

            const fullPath = path.resolve(workspace, file.path)

            const relativePath = path.relative(workspace, fullPath)

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

            //Fetching existing content and saving updated content 

            const oldContent = fs.readFile(fullPath, "utf-8");
            const parts = String(oldContent).split(oldText);
            let index = file.index;

            let updatedContent = "";

            for (let i = 0; i < parts.length; i++) {
                updatedContent += (index === i ? file.newText : file.oldText) + parts[i]
            }

            //Showing diff to the user 

            console.log("Changes (Y => YES, N => NO)");
            const patch = diffPatch(fullPath, oldContent, updatedContent);
            console.log(patch);
            let userInput = (await rl.question("[USER]: (Y / N)")).trim().toLowerCase()

            //Verification to avoid time-of-check and time-of-use error
            const isValid = (oldText.match(await fs.readFile(fullPath, "utf-8")))

            if (!isValid) {
                responses.push({
                    path: file.path,
                    status: "user changed the code in between"
                })

                continue;
            }


            if (userInput !== "y") {
                responses.push({
                    path: file.path,
                    status: "rejected"
                })
                continue;
            }




            try {
                await fs.writeFile(fullPath, updatedContent)

                responses.push({
                    path: file.path,
                    status: "success",
                })

            } catch (error) {
                responses.push({
                    path: file.path,
                    status: "error",
                    error: error.message,
                })

            }

        }


        return {
            responses
        }


    },
    {
        name: "editFile",
        description: "Edit UTF-8 text files within the current workspace by replacing a specified occurrence of exact text. The index is zero-based and refers to matching occurrences, not line numbers. Use -1 to append content.",
        schema: z.object({
            files: z.array(z.object({
                path: z.string().describe("File path of the file to be edited"),
                oldText: z.string().describe("Line or continuous group of line that would be changed"),
                newText: z.string().describe("Lines that are to be added in place of old lines"),
                index: z.number().int().min(-1).describe("zero based indexing to change the text. Keep its value -1 to add the lines in last of files")
            }))
        })
    }
)