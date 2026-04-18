const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db');

// Initialize Gemini with your hidden API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handleChat = async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) return res.status(400).json({ error: "Message is required" });

        // 1. Fetch live inventory context from your database
        const [products] = await db.query("SELECT name, price, category, gender, notes FROM products");
        
        // 2. Build the "System Context" so Gemini knows exactly how to act
        const systemContext = `
            You are the elegant Virtual Concierge for Maison Vyra, a luxury Parisian perfumery.
            Your tone must be highly sophisticated, poetic, polite, and brief (keep answers under 3-4 sentences).
            Do not use markdown formatting like asterisks or bold text, just plain elegant text.
            
            Here is our current live inventory:
            ${JSON.stringify(products)}

            Boutique Policies to remember:
            - Shipping is complimentary globally.
            - We offer a 14-day return policy on unopened flacons.
            - Prices are in Indian Rupees (₹).
            
            The client says: "${userMessage}"
            
            Respond gracefully as the Vyra Concierge:
        `;

        // 3. Connect to Gemini 1.5 Flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemContext);
        const response = await result.response;
        const aiText = response.text();

        // 4. Send the response back to the frontend
        res.json({ reply: aiText });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "The Concierge is currently assisting another client. Please try again." });
    }
};