'use client';

import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function ChatApp({ initalPropmt, className }) {
  // App Controls
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  // Chat Elements 
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState<String>("");
  const [chatHistory, setChatHistory] = useState([initalPropmt]);

  async function onSubmit(event) {

    event.preventDefault();

    // set loading true
    setLoading(true);

    // determine what to send to the API. it is the first prompt then userInput will be false, so we just send the first prompt. If the user has entered something, we send the chat history plus the user input
    const promptToSend = userInput ? [...chatHistory, { 'role': "user", 'content': userInput }] : [...chatHistory];

    // update the chat history with the user input
    setChatHistory(promptToSend);
    console.log('attempting to contact streamchat')

    try {
      const response = await fetch("/api/streamchat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatHistory: promptToSend }),
        cache: 'no-store',
      });

      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let result = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        result += chunkValue;
        setResponse((prev) => prev + chunkValue);

        // add response to chat history as a system user 
        setChatHistory([...promptToSend, { 'role': "system", 'content': result }]);
      }

    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }

    // clear user input 
    setUserInput('');

    // set loading false
    setLoading(false);

  }

  return (
    <div className={className}>
      {/* Start button */}
      {!started && <button onClick={(e) => {
        setStarted(true);
        onSubmit(e);

      }} className={styles.startbutton}>Start</button>}


      {/* Once started, run the below content */}
      {started && <div className={styles.chatwidget}>
        <div className={styles.result}>

          {chatHistory.map((item, index) => {

            if (index === 0) return;

            return (
              <div key={index} className={item.role === 'system' ? styles.system + ' ' + styles.chatbox : styles.user + ' ' + styles.chatbox}>
                

                {item.content.split('\n').map((str, index) => {
                const expression = /(mytrip\.travelworld\.com\/.*&directSubmit=true)/gi;
                const regex = new RegExp(expression);

                // Replacing raw Google URLs with an <a> tag.
                const cleanStrArray = str.split(regex).map((urlCandidateString) => {
                      if (regex.test(urlCandidateString)) {
                        return <a href={`${urlCandidateString}`} target="_blank" className={styles.bookinglink}> click me</a>
                      } else {
                        return urlCandidateString
                      }   
                })
                return <p>{cleanStrArray}</p>;

                //return <p key={index}>{str}</p>
                
                })}

              </div>
            )
          })}
        </div>


        {loading && <p className='system'>... tumbleWorld AutoTrip is thinking ...</p>}

        {!loading &&
          <div>
            <form onSubmit={onSubmit}>

              <input
                type="text"
                name="userInput"
                placeholder="Enter your message"

                onChange={(e) => setUserInput(e.target.value)}
              />
              <input type="submit" value="Send" />
            </form>

          </div>
        }

      </div>
      }

    </div>

  );
}
