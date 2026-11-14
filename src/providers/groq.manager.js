import { ChatGroq } from "@langchain/groq"

class GroqManager {
    #apiKey;
    #aiModel;
    #llm;

    initialise(apiKey, aiModel) {
        if (typeof apiKey !== "string" || typeof aiModel !== "string" || !apiKey.trim() || !aiModel.trim()) {
            throw new Error("API key and model are required.");
        }
        this.#aiModel = aiModel.trim();
        this.#apiKey = apiKey.trim();
        this.#createLLM()
    }

    #createLLM() {
        this.#llm = new ChatGroq({
            apiKey: this.#apiKey,
            model: this.#aiModel,
            temperature: 0,
            maxTokens: 2048,
        })
    }

    changeApiKey(apiKey) {
        if (typeof apiKey !== "string" || !apiKey.trim()) {
            throw new Error("API key is required")
        }
        this.#apiKey = apiKey.trim();
        this.#createLLM()
    }

    changeAiModel(aiModel) {
        if (typeof aiModel !== "string" || !aiModel.trim()) {
            throw new Error("AI Model is required")
        }
        this.#aiModel = aiModel.trim();
        this.#createLLM()
    }

    getLLM() {
        return this.#llm
    }

    getAiModel() {
        return this.#aiModel
    }


}


export const groqManager = new GroqManager();