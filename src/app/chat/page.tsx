import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Textarea } from "@nextui-org/react";
import { KeyboardEvent, KeyboardEventHandler, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as queries from "../../queries";
import { v4 as uuidv4 } from 'uuid';
import Markdown from "../../components/Markdown";
import { Conversation } from "../../models/conversation";
import { Message } from "../../models/message";
import { ConversationRole } from "../../models/conversation-role";
import { emit, listen } from '@tauri-apps/api/event';
import { LoaderContext } from "../../context/LoaderContext";
import { SubmitIcon } from "../../components/icons/SubmitIcon";
import Sidebar from "../../components/Sidebar";

type ChatResponse = {
    response: string,
};
const AlwaysScrollToBottom = () => {
    const elementRef = useRef(null);
    useEffect(() => {
        if (!elementRef) return;
        if (!elementRef.current) return;

        (elementRef.current as HTMLDivElement).scrollIntoView()
    });
    return <div ref={elementRef} />;
};

export default function Chat() {
    const [prompt, setPrompt] = useState('');
    // const [conversationId, setConversationId] = useState('');
    const [conversation, setConversation] = useState(new Conversation());
    const loaderContext = useContext(LoaderContext);
    const promptRef = useRef(null);

    const conversationId = useMemo(() => {
        return 'aa1366a7-7f08-413f-94e8-445f71047ec2'; // uuidv4();
    }, []);

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

    const submitPrompt = async () => {
        try {
            if (!prompt) {
                return;
            }
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

    const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            submitPrompt();
        }
    };

    return <div>
        <Sidebar />

        <div className="pl-64">
            <div className="pb-32">
                {conversation?.messages.map(message => <Card className="mb-4">
                    <CardHeader>
                        <p className="text-large text-white font-bold">{message.role}</p>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Markdown text={message.text} isLoading={false} onRenderComplete={undefined} />
                    </CardBody>
                </Card>)}

                <AlwaysScrollToBottom />
            </div>

            <Card isFooterBlurred className="fixed bottom-0 left-0 w-full shadow-md-up z-50 px-0 py-0">
                <Textarea className="pb-8" label="prompt>" value={prompt} onValueChange={setPrompt} onKeyDown={handleInputKeyDown}
                    classNames={{
                        inputWrapper: "rounded-b-none"
                    }} />
                <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 py-0 justify-end">
                    <Button isIconOnly={true} size="sm" color="secondary" variant="flat" onPress={submitPrompt}><SubmitIcon /></Button>
                </CardFooter>
            </Card>
        </div>
    </div>
}