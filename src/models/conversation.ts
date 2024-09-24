import { ConversationDto } from "./conversation-dto";
import { Message } from "./message";

export class Conversation {
    messages: Message[];

    constructor(messages: Message[]) {
        this.messages = messages
    }

    static fromDto(dto: ConversationDto): Conversation {
        return new Conversation(dto.messages.map(Message.fromDto));
    }
}