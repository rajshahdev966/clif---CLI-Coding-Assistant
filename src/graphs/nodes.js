import { ChatGroq } from "@langchain/groq";
import { settingsFileManager } from "../utils/file.utils.js";
import { AIMessage } from "langchain";



export async function LLMNode(state, config){

    const model = new ChatGroq({
        model: settingsFileManager.get("aiModel"),
        apiKey: settingsFileManager.get("apiKey")
    })


    const stream = await model.stream(state.messages, config);
    let aiMessages = "";

    process.stdout.write("[AI]: ")

    for await(const chunk of stream){
        process.stdout.write(chunk.text);
        aiMessages += chunk.text
    }

    process.stdout.write("\n")

    return {
        messages: [
            ...state.messages,
            new AIMessage(aiMessages)
        ]
    };

}
