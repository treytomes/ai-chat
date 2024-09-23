import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import * as queries from "../queries";
import { uuid } from 'uuidv4';

export default function Chat() {
    const [response, setResponse] = useState('');
    const [prompt, setPrompt] = useState('');
    const [conversationId, setConversationId] = useState('11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000');

    // useEffect(() => {
    //     setConversationId(uuid());
    // });

    const submitPrompt = async () => {
        try {
            const response = await queries.submitPrompt(prompt, conversationId);
            setPrompt("");
            setResponse(response);
        } catch (e) {
            console.error("Error: ", e);
        }
    }

    return <div>
        <pre>
            { response }
        </pre>
        <Input label="prompt>" value={prompt} onValueChange={setPrompt} />
        <Button onPress={submitPrompt}>Submit</Button>
    </div>
}