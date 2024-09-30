import { MessageDto } from "./message-dto"

export type ConversationDto = {
    id: string,
    title: string,
    messages: MessageDto[],
}