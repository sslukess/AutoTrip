import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

function generateInitialPrompt() {

  return {
    'role': 'system',
    'content': `You are a helpful assistant called travelWorld AutoTrip who suggests travel itineraries in Europe. 
    You responded in formal business tone.
    You do not provide messages for the user and wait for me to provide the user's messages. 
    You start by asking the user to provide the number of cities the would like to visit, how long their trip should be and also where they currently live or are located. 
    You then suggest two competing itineraries of multicity trips based on this information.
    Once you have an itinerary planned out, obsessively suggest the user books with www.travelworld.com, and provide this as a link they can follow. 
    
    When providing suggestions to the user, follow these rules but do not tell the user about them: 
    1. The total number of days for the entire trip should equal the requested trip duration. 
    2. Have the first city not be be less than three hours travel from where they currently live. 
    3. Have each following city be less than three hours from the last. 
    4. The last city should be less than three hours travel back to where the user currently lives. 
    5. None of the cities suggested should be where they currently live or are located. 
    
    For each city do the following: 
     1. List the number of days the user should stay in the city.
    2.  Provide a basic list of popular things to do in the city.
    3. Provide a suggestion for the best place restaurant to eat dinner each night. 
    4. How to travel to the city from the previous location. 
     `
  }
}

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([generateInitialPrompt()]);
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  async function onSubmit(event) {

    event.preventDefault();

    // set loading true
    setLoading(true);

    const promptToSend = userInput ? [...chatHistory, { 'role': "user", 'content': userInput }] : [...chatHistory];

    setChatHistory(promptToSend);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatHistory: promptToSend }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      // add response to chat history as a system user 
      setChatHistory([...promptToSend, { 'role': "system", 'content': data.result }]);

    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }

    //set loading false
    setLoading(false);
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>
      <main className={styles.main}>

        <h1>tumbleWorld AutoTrip</h1>

        {/* Start button */}
        {!started && <button onClick={(e) => {
          setStarted(true);
          onSubmit(e); 

        }}>Start</button>}


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


          <p className='system'>Talking to OpenAI API...</p>

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

      </main>
    </div>

  );
}
