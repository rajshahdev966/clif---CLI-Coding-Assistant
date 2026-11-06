import { tool } from "langchain"
import fs from "fs/promises"
import * as z from "zod"
import path from "path"

export const readFiles = tool(
    async ({ paths }) => {
        const contentArray = await Promise.all(paths.map(async (filePath) => {
            try {
                const workspace = process.cwd()
                const fullPath = path.resolve(process.cwd(), filePath)

                const relative = path.relative(workspace, fullPath)

                if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
                    throw new Error("Access Outside the directory is denied")
                }

                const content = await fs.readFile(fullPath, "utf-8")

                return {
                    path: filePath,
                    content,
                    status: "success"
                }
            } catch (error) {
                return {
                    path: filePath,
                    error: error.message,
                    status: "error"
                }
            }
        }))

        console.log("HIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII=> ",await fs.readdir(process.cwd(), { withFileTypes: true }))


        return JSON.stringify({
            files: contentArray
        })
    },

    {
        name: "readFiles",
        description: "Read one or more UTF-8 text files within the current project workspace. Provide relative paths.",
        schema: z.object({
            paths: z.array(z.string().describe("Relative path of the file to read.")).min(1, "At least one file path is required.")
        })
    }
)