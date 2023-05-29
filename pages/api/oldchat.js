import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const chatHistory = req.body.chatHistory || '';
  if (chatHistory.length === 0) {
    res.status(400).json({
      error: {
        message: "ERROR - prompt is required",
      }
    });
    return;
  }

  console.log('THE CHAT HISTORY SENT IS: ', chatHistory);

  try {
    const chatReponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
      temperature: 0.6,
    });

    console.log('THE CHAT RESPONSE IS: ', chatReponse.data.choices);

    res.status(200).json({ result: chatReponse.data.choices[0].message.content });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
};