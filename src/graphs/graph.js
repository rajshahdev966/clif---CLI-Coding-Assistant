import {StateGraph, START, END} from "@langchain/langgraph"
import * as z from "zod"
import { LLMNode } from "./nodes.js"
import { HumanMessage, SystemMessage } from "langchain"
import rl from "../utils/readline.utils.js"


const stateFormat = z.object({
    messages: z.array(z.any())
})


const graph = new StateGraph(stateFormat)
    .addNode("LLMNode", LLMNode)
    .addEdge(START, "LLMNode")
    .addEdge("LLMNode", END)
    .compile()

export async function initGraph(){
    let messages = []

    while(true){
        let userInput = await rl.question("[USER]: ");

        messages.push(new HumanMessage(userInput))

        const response = await graph.invoke({messages})

        messages = response.messages
    }

}