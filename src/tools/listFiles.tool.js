import { tool } from "langchain"
import path from "path"
import fs from "fs/promises"
import * as z from "zod"

export const listFiles = tool(
    async ({ paths }) => {
        const dirArray = await Promise.all(paths.map(async (filePath) => {
            try {
                const workspace = process.cwd()
                const fullPath = path.resolve(workspace, filePath)

                const relative = path.relative(workspace, fullPath)

                if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
                    throw new Error("Access Outside the directory is denied")
                }

                const directory = await fs.readdir(fullPath, { withFileTypes: true });

                const entries = directory.map((entry) => {
                    return {
                        name: entry.name,
                        type: entry.isDirectory() ? "directory" : entry.isFile() ? "file" : entry.isSymbolicLink() ? "symlink" : "other"
                    }
                })

                return {
                    path: filePath,
                    status: "success",
                    entries,
                }
            } catch (error) {
                return {
                    status: "error",
                    error: error.message,
                    path: filePath
                }

            }
        }))
        return JSON.stringify({
            directories: dirArray
        })

    },
    {
        name: "listFiles",
        description: "List the directory, folder structure with file types of current directory",
        schema: z.object({
            paths: z.array(z.string().describe("Relative path of the file to read").min(1, "Atlleast one file path is required").default(["."]))
        })

    }
)