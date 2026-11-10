import { tool } from "langchain"
import * as z from "zod"
import fs from "fs/promises"
import path from "path"
import { fetchOldFileContent, validateWorkspacePath } from "../utils/file.utils.js"
import { requestFileApproval } from "../utils/permission.utils.js"



export const createNewFile = tool(
    async function ({ files }) {

        const responses = [];

        for (const file of files) {

            //Workspace validation
            const validWorkspacePath = await validateWorkspacePath(file.path)

            if (!String(validWorkspacePath).trim()) {
                responses.push({
                    path: file.path,
                    status: "access denied"
                })
                continue;
            }

            //Fetch the oldText present in a file
            
            const oldText = await fetchOldFileContent(validWorkspacePath)

            //Asks for the user approval
           const isChangeVerified = await requestFileApproval(validWorkspacePath, oldText, file.content)

           if(!isChangeVerified){
            responses.push({
                path: file.path,
                status: "access denied"
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