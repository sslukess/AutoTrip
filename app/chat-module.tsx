'use client';

import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function ChatApp({ initalPropmt }) {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([initalPropmt]);
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  // data fetching
const getChat = async (chatHistory) => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatHistory: chatHistory }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }

    return data;

  } catch (error) {
    // Consider implementing your own error handling logic here
    console.error(error);
    alert(error.message);
  }
};

  async function onSubmit(event) {

    event.preventDefault();

    // set loading true
    setLoading(true);

    // determine what to send to the API. it is the first prompt then userInput will be false, so we just send the first prompt. If the user has entered something, we send the chat history plus the user input
    const promptToSend = userInput ? [...chatHistory, { 'role': "user", 'content': userInput }] : [...chatHistory];

    // update the chat history with the user input
    setChatHistory(promptToSend);

    const latestChatVerson = await getChat(promptToSend);

      // set the result
      setResult(latestChatVerson.result);
      // add response to chat history as a system user 
      setChatHistory([...promptToSend, { 'role': "system", 'content': latestChatVerson.result }]);

    //set loading false
    setLoading(false);
  }

  return (
    <div>
        {/* Start button */}
        {!started && <button onClick={(e) => {
          setStarted(true);
          onSubmit(e); 

        }} id='start-button'>Start</button>}


        {/* Once started, run the below content */}
        {started && <div>
          <div className={styles.result}>
            {chatHistory.map((item, index) => {

              if (index === 0) return;

              const splitContent = item.content.split('\n');

              return (
                <div key={index} className={item.role === 'system' ? styles.system : styles.user}>

                  {splitContent.map((line, index) => {
                    return (
                      <p key={index}>{line}</p>
                    )
                  })}

                </div>
              )
            })}
          </div>


          {loading && <p className='system'>Talking to OpenAI API...</p>}

          {!loading &&
          <div>
            <form onSubmit={onSubmit}>

              <input
                type="text"
                name="userInput"
                placeholder="Enter your message"

                onChange={(e) => setUserInput(e.target.value)}
              />
              <label htmlFor="userInput">The current user input is: <em>{userInput}</em></label>
              <input type="submit" value="Send" />
            </form>

          </div>
          }

        </div>
        }

    </div>

  );
}
