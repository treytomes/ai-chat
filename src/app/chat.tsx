import { Button, Card, CardBody, CardHeader, Divider, Input } from "@nextui-org/react";
import { useContext, useEffect, useMemo, useState } from "react";
import * as queries from "../queries";
import { v4 as uuidv4 } from 'uuid';
import Markdown from "../components/Markdown";
import { Conversation } from "../models/conversation";
import { Message } from "../models/message";
import { ConversationRole } from "../models/conversation-role";
import { emit, listen } from '@tauri-apps/api/event';
import { LoaderContext } from "../context/LoaderContext";

type ChatResponse = {
    response: string,
};

export default function Chat() {
    // const [response, setResponse] = useState('');
    const [prompt, setPrompt] = useState('');
    // const [conversationId, setConversationId] = useState('');
    const [conversation, setConversation] = useState(new Conversation());
    const loaderContext = useContext(LoaderContext);

    const conversationId = useMemo(() => {
        return uuidv4();
    }, [])

    // useEffect(() => {
    //     // const conversationId = '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000';
    //     const conversationId = uuidv4();
    //     setConversationId(conversationId);
    // }, []);

    useEffect(() => {
        if (conversationId.length > 0) {
            loaderContext.show("Where was I?");
            queries.loadConversation(conversationId).then(c => {
                console.log("Loaded conversation id:", conversationId);
                setConversation(c);
            }).catch((e: Error) => {
                console.log(e);
            }).finally(() => {
                loaderContext.hide();
            })
        }
    }, [conversationId]);

    // Subscribe to the chat-response tauri event.
    useEffect(() => {
        const unlisten = listen<string>('chat-response', (event) => {
            console.log('Got event:', event);
            const response: ChatResponse = event.payload as any;
            console.log("response", response);

            console.log("conversation", conversation);
            if (conversation) {
                conversation.messages.push(new Message(ConversationRole.Assistant, response.response));
                // console.log('conversation', conversation);
                setConversation(() => {
                    console.log('done');
                    return conversation;
                });
            } else {
                console.log("Where's my conversation?");
            }

            loaderContext.hide();
        });

        return () => {
            unlisten.then(x => x());
        }
    }, []);

    const submitPrompt = async () => {
        try {
            if (!conversation) {
                throw new Error('Conversation is undefined.');
            }

            loaderContext.show("Thinking...");
            conversation.messages.push(new Message(ConversationRole.User, prompt));
            
            let cachedPrompt = prompt;
            setPrompt("");

            // const onEvent = new Channel<LLMResponseEvent>();
            // onEvent.onmessage = (message: LLMResponseEvent) => {
            //     console.log('Message: ', message);
            // }

            await queries.submitPrompt(cachedPrompt, conversationId);

            // await emit('submit-prompt', { prompt: cachedPrompt, conversation_id: conversationId });
        } catch (e) {
            console.error("Error: ", e);
        }
    }

    return <div>
        {conversation?.messages.map(message => <Card className="mb-4">
            <CardHeader>
                <p className="text-large text-white font-bold">{message.role}</p>
            </CardHeader>
            <Divider />
            <CardBody>
                <Markdown text={message.text} isLoading={false} onRenderComplete={undefined} />
            </CardBody>
        </Card>)}

        <div className="flex">
            <Input classNames={{
                inputWrapper: "rounded-r-none"
            }} label="prompt>" value={prompt} onValueChange={setPrompt} />
            <Button color="primary" className="rounded-l-none h-14" onPress={submitPrompt}>Submit</Button>
        </div>
    </div>
}