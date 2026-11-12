import { tool } from "langchain"
import * as z from "zod"
import fs from "fs/promises"
import { fetchFileContent, validateWorkspacePath } from "../utils/file.utils.js";
import { replaceOccurrence } from "../utils/text.utils.js";
import { requestFileApproval } from "../utils/permission.utils.js";
import enqueueMutation from "../utils/queue.utils.js";
import { ui } from "../ui/terminal.js";

const editOneFile = async (file) => {
    const resolvedPath = await validateWorkspacePath(file.path)

    if (!String(resolvedPath).trim()) {
        return {
            path: file.path,
            status: "access denied"
        }

    }

    //Fetching existing content and saving updated content 

    const oldContent = await fetchFileContent(resolvedPath)

    const updatedContent = replaceOccurrence(oldContent, file.occurrenceIndex, file.oldText, file.newText)
    //Showing diff to the user 

    const {isApproved, status} = await requestFileApproval(resolvedPath, oldContent, updatedContent)

    if (!isApproved) {
        return {
            path: file.path,
            status
        }
    }

    await fs.writeFile(resolvedPath, updatedContent)

    return {
        path: file.path,
        status,
    }
}

export const editFile = tool(
    async function ({ files }) {

        const responses = [];

        for (const file of files) {
            try {
                const result = await enqueueMutation(() => editOneFile(file))
                responses.push(result)

            } catch (error) {
                responses.push({
                    path: file.path,
                    status: "error",
                    error: error.message,
                })

            }
        }


        ui.toolResults("Edit", responses);
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
                occurrenceIndex: z.number().int().min(-1).describe("zero based indexing to change the text. Keep its value -1 to add the lines in last of files")
            }))
        })
    }
)
