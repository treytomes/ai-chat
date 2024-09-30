import { listConversations } from "../queries";

export class ConversationSummary {
    readonly id: string;
    title: string;
    
    constructor(id: string, title: string) {
        this.id = id;
        this.title = title;
    }

    static fromDto(dto: ConversationSummaryDto): ConversationSummary {
        return new ConversationSummary(dto.id, dto.title);
    }

    static async getAll(): Promise<ConversationSummary[]> {
        return await listConversations();
    }
}