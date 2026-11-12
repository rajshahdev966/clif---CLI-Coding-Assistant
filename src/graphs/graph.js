import { StateGraph, START, END, MemorySaver, MessagesAnnotation } from "@langchain/langgraph"
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { llmNode, toolNode } from "./nodes.js";


const graph = new StateGraph(MessagesAnnotation)
    .addNode("llm", llmNode)
    .addNode("tools", toolNode)
    .addEdge(START, "llm")
    .addConditionalEdges(
        "llm",
        toolsCondition,
        ["tools", END]
    )
    .addEdge("tools", "llm")
    .compile({checkpointer: new MemorySaver()})



export default graph;