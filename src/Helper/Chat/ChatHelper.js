import { SDK } from "../../SDK"
import { CHAT_TYPE_SINGLE } from "./Constant"

export const formatUserIdToJid = (userId, chatType = CHAT_TYPE_SINGLE) => {
    const jidResponse = chatType === CHAT_TYPE_SINGLE ? SDK.getJid(userId):SDK.getGroupJid(userId)
    if(jidResponse.statusCode === 200){
        return jidResponse.userJid || jidResponse.groupJid
    } 
}