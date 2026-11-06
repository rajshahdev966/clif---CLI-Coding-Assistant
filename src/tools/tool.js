import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises"

export const sayHello = tool(
    async () => {
        console.log(await fs.readdir(process.cwd(), {withFileTypes: true}))
        return "Hello from CLIFF's sayHello tool!";
    },
    {
        name: "sayHello",
        description: "Call this tool when the user asks you to execute the sayHello function.",
        schema: z.object({})
    }
);