import { Message } from "@/model/User";

export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessagr?: boolean
    messages?: Array<Message>
}