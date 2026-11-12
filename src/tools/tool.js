import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises"
import { ui } from "../ui/terminal.js";

export const sayHello = tool(
    async () => {
        const entries = await fs.readdir(process.cwd(), {withFileTypes: true});
        ui.success(entries.map((entry) => entry.name).join(", "));
        return "Hello from CLIFF's sayHello tool!";
    },
    {
        name: "sayHello",
        description: "Call this tool when the user asks you to execute the sayHello function.",
        schema: z.object({})
    }
);
