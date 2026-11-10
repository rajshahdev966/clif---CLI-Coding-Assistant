import { tool } from "langchain"
import * as z from "zod"
import fs from "fs/promises"
import { fetchOldFileContent, validateWorkspacePath } from "../utils/file.utils";
import { replaceOccurence } from "../utils/text.utils";
import { requestFileApproval } from "../utils/permission.utils";


export const editFile = tool(
    async function ({ files }) {

        const responses = [];

        for (const file of files) {
            //Path Validation
           const validWorkspacePath = await validateWorkspacePath(file.path)

            if (!String(validWorkspacePath).trim()) {
                responses.push({
                    path: file.path,
                    status: "access denied"
                })
                continue;
            }

            //Fetching existing content and saving updated content 

            const oldContent = await fetchOldFileContent(validWorkspacePath)

            const updatedContent = replaceOccurence(oldContent, file.index, file.oldText, file.newText)
            //Showing diff to the user 

            const isChangeVerified = await requestFileApproval(validWorkspacePath, oldContent, updatedContent)

            if(!isChangeVerified){
                responses.push({
                    path: file.path,
                    status: "access denied"
                })

                continue;
            }


            try {
                await fs.writeFile(validWorkspacePath, updatedContent)

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
        description: "Edit/Update specific lines of a file. Provide relative paths and provide zero based indexing",
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