import { ChatGroq } from "@langchain/groq"

class GroqManager{
    #apiKey;
    #aiModel;
    #llm;

    initialise(apiKey, aiModel){
        if (!apiKey || !aiModel) {
            throw new Error("API key and model are required.");
        }
        this.#aiModel = aiModel;
        this.#apiKey = apiKey; 
        this.#createLLM()
    }

    #createLLM(){
        this.#llm = new ChatGroq({
            apiKey: this.#apiKey,
            model: this.#aiModel
        })
    }

    changeApiKey(apiKey){
        if(!apiKey){
            throw new Error("API key is required")
        }
        this.#apiKey = apiKey;
        this.#createLLM()
    }

    changeAiModel(aiModel){
        if(!aiModel){
            throw new Error("AI Model is required")
        }
        this.#aiModel = aiModel;
        this.#createLLM()
    }

    getLLM(){
        return this.#llm
    }

    getAiModel(){
        return this.#aiModel
    }


}


export const groqManager = new GroqManager();