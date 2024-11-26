export async function fetchChatCompletion(messages) {
    const endpoint = " https://llama38bize483jb30-5ace32af5f2c5f78.tec-s1.onthetaedgecloud.com/v1/chat/completions";
    
    const payload = {
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: messages,
        max_tokens: 2048,
        temperature: 0.5,
        top_p: 0.7
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.choices && result.choices.length > 0) {
            return result.choices[0].message.content;
        }

        return null; // Handle case where choices array is empty

    } catch (error) {
        console.error("Error fetching chat completion:", error);
        return null;
    }
}
