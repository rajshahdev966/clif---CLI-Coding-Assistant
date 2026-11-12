import { tool } from "langchain"
import * as z from "zod"
import fs from "fs/promises"
import path from "path"
import { fetchFileContent, validateWorkspacePath } from "../utils/file.utils.js"
import { requestFileApproval } from "../utils/permission.utils.js"
import enqueueMutation from "../utils/queue.utils.js"
import { ui } from "../ui/terminal.js";

const writeOneFile = async (file) => {
    const resolvedPath = await validateWorkspacePath(file.path)

    if (!String(resolvedPath).trim()) {
        return {
            path: file.path,
            status: "access denied"
        }
    }

    //Fetch the oldText present in a file

    const oldText = await fetchFileContent(resolvedPath)

    //Asks for the user approval
    const { isApproved, status } = await requestFileApproval(resolvedPath, oldText, file.content)

    if (!isApproved) {
        return {
            path: file.path,
            status
        }
    }

    await fs.mkdir(path.dirname(resolvedPath), { recursive: true })
    await fs.writeFile(resolvedPath, file.content);
    return {
        path: file.path,
        status,
    }
}



export const writeFile = tool(
    async function ({ files }) {

        const responses = [];

        for (const file of files) {

            try {
                const result = await enqueueMutation(() => writeOneFile(file))
                responses.push(result)
            } catch (error) {
                responses.push({
                    path: file.path,
                    status: "error",
                    message: error.message
                })
            }
        }

        ui.toolResults("Write", responses);
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
