import ChatApp from './chat-module';
import generateInitialPrompt from '../utils/initalPrompt';

import styles from "./index.module.css";

export default function Page() {

  return (
    <main className={styles.main}>
      <h1>AutoTrip</h1>

      <ChatApp className={styles.chatapp} initalPropmt={generateInitialPrompt()} />

    </main>
  );
}

