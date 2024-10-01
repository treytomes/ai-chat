import { Dispatch, SetStateAction, createContext } from "react";

export class ConversationContextProps {
    conversationId: string;
    setConversationId: Dispatch<SetStateAction<string>>;

    constructor(
        conversationId: string = "",
        setConversationId: Dispatch<SetStateAction<string>> = () => "",
    ) {
        this.conversationId = conversationId;
        this.setConversationId = setConversationId;
    }
}

export const ConversationContext = createContext(new ConversationContextProps());
