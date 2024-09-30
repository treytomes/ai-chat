import { ConversationDto } from "./conversation-dto";
import { Message } from "./message";
import { v4 as uuidv4 } from 'uuid';

export class Conversation {
    readonly id: string;
    title: string;
    messages: Message[];

    constructor(id?: string, title?: string, messages: Message[] = []) {
        if (!id) id = uuidv4();
        if (!title) title = id;

        this.id = id;
        this.title = title;
        this.messages = messages
    }

    static fromDto(dto: ConversationDto): Conversation {
        return new Conversation(dto.id, dto.title, dto.messages.map(Message.fromDto));
    }
}