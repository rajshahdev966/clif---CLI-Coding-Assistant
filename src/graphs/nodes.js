import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "langchain"
import { groqManager } from "../providers/groq.models.js";
import { sayHello } from "../tools/tool.js";
import { settingsFileManager } from "../utils/file.utils.js";


const tools = [sayHello]

export const toolNode = new ToolNode(tools);

export async function llmNode(state) {
    const llm = groqManager
        .getLLM()
        .bindTools(tools, { tool_choice: "auto" });
    const response = await llm.invoke(state.messages);
    process.stdout.write("[AI]: ")
    let aiMessage = new AIMessage({ content: response.content });

    console.log("RES TEXT =>",response.text)
    console.log("Tool calls:", response.tool_calls);

    process.stdout.write("\n");

    return {
        messages: [
            aiMessage
        ]
    }
}




