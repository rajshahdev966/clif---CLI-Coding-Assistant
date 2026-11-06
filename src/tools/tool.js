import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const sayHello = tool(
    async () => {
        return "Hello from CLIFF's sayHello tool!";
    },
    {
        name: "sayHello",
        description: "Call this tool when the user asks you to execute the sayHello function.",
        schema: z.object({})
    }
);