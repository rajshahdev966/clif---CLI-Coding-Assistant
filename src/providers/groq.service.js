import axios from "axios";


/**
 * @description Get all the models offfered by groq API Key
 * @params apiKey
 * @returns error if not valid API key or other reason
 * @returns [{id, owned_by}] if successful 
 */

export async function getAllAIModels(apiKey) {
    try {
        const response = await axios.get("https://api.groq.com/openai/v1/models", {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        return response.data.data.map(({ id, owned_by }) => ({ id, owned_by }))
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error("Invalid or Expired Groq API Key")
        }
        throw error;
    }
}


/**
 * @description Validate the Groq API key by calling getALlAIModel Function
 * @params apiKey 
 * @returns bollean in context of valid API Key
 */
export async function validateApiKey(apiKey) {
    try {
        await getAllAIModels(apiKey);
        return true;
    } catch (error) {
        if (error.message === "Invalid or Expired Groq API Key") {
            return false;
        }

        throw error;
    }
}






