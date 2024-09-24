import { ConversationRole } from "./conversation-role";
import { MessageDto } from "./message-dto";

export class Message {
    role: ConversationRole;
    text: string;

    constructor(role: ConversationRole, text: string) {
        this.role = role;
        this.text = text;
    }
    
    static fromDto(dto: MessageDto): Message {
        return new Message(dto.role == 'Assistant' ? ConversationRole.Assistant : ConversationRole.User, dto.text);
    }
}
