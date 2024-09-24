import { Button, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import * as queries from "../queries";
import { uuid } from 'uuidv4';
import Markdown from "../components/Markdown";

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
        <Markdown text={response} isLoading={false} onRenderComplete={undefined} />
        <Input label="prompt>" value={prompt} onValueChange={setPrompt} />
        <Button onPress={submitPrompt}>Submit</Button>
    </div>
}