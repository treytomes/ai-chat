import { Button, Card, CardBody, CardHeader, Divider, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import * as queries from "../queries";
import { uuid } from 'uuidv4';
import Markdown from "../components/Markdown";
import { Conversation } from "@/models/conversation";
import { Message } from "../models/message";
import { ConversationRole } from "../models/conversation-role";

export default function Chat() {
    const [response, setResponse] = useState('');
    const [prompt, setPrompt] = useState('');
    const [conversationId, setConversationId] = useState('');
    const [conversation, setConversation] = useState<Conversation>();

    useEffect(() => {
        const conversationId = '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000';
        // const conversationId = uuid();
        setConversationId(conversationId);
    });

    useEffect(() => {
        if (conversationId.length > 0) {
            queries.loadConversation(conversationId).then(c => {
                setConversation(c);
            })
        }
    }, [conversationId]);

    // useEffect(() => {
    //     if (!conversation) {
    //         throw new Error('Conversation is undefined.');
    //     }
    //     conversation.messages.push(new Message(ConversationRole.User, prompt));
    // }, [prompt]);

    useEffect(() => {
        if (response.length == 0) {
            return;
        }

        if (!conversation) {
            throw new Error('Conversation is undefined.');
        }
        conversation.messages.push(new Message(ConversationRole.Assistant, response));
    }, [response]);

    const submitPrompt = async () => {
        try {
            if (!conversation) {
                throw new Error('Conversation is undefined.');
            }
            conversation.messages.push(new Message(ConversationRole.User, prompt));
            setConversation(conversation);

            const response = await queries.submitPrompt(prompt, conversationId);
            setPrompt("");
            setResponse(response);
        } catch (e) {
            console.error("Error: ", e);
        }
    }

    return <div>
        {conversation?.messages.map(message => <Card>
            <CardHeader>
                <p className="text-md">{message.role}</p>
            </CardHeader>
            <Divider />
            <CardBody>
                <Markdown text={message.text} isLoading={false} onRenderComplete={undefined} />
            </CardBody>
        </Card>)}
        <Input label="prompt>" value={prompt} onValueChange={setPrompt} />
        <Button onPress={submitPrompt}>Submit</Button>
    </div>
}