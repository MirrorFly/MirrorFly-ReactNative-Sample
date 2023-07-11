import React from "react";
import { useSelector } from "react-redux";
import { formatUserIdToJid } from "../Helper/Chat/ChatHelper";
import { getLastseen } from "../common/TimeStamp";
import { USER_PRESENCE_STATUS_OFFLINE, USER_PRESENCE_STATUS_ONLINE } from "../Helper/Chat/Constant";
import MarqueeText from "../common/MarqueeText";

const LastSeen = (props) => {
    const [lastSeenData, setLastSeenData] = React.useState({
        seconds: -1,
        lastSeen: "",
        userPresenceStatus: ""
    })
    let timer = 0;
    const [config] = React.useState({
        marqueeOnStart: true,
        speed: 0.3,
        loop: true,
        delay: 0,
        consecutive: false,
    })
    const marqueeRef = React.useRef(null);
    const presenseData = useSelector(state => state.user.userPresence)
    const { fromUserJid, status } = presenseData;
    const userJid = props.jid;

    React.useEffect(() => {
        if (userJid) {
            updateLastSeen(userJid);
        }
        return () => (clearTimeout(timer));
    }, [])

    React.useEffect(() => {
        if (fromUserJid === userJid && status !== lastSeenData.userPresenceStatus) {
            if (status === USER_PRESENCE_STATUS_OFFLINE) {
                timer = setTimeout(async () => {
                    updateLastSeen(userJid, status);
                }, 500);
            }
            else {
                updateLastSeen(userJid, status);
            }
        }
    }, [presenseData])

    const getLastSeenSeconds = async (user_Jid) => {
        if (!user_Jid) return -1;
        const lastSeenRes = await SDK.getLastSeen(user_Jid);
        if (lastSeenRes && lastSeenRes.statusCode === 200) {
            return lastSeenRes?.data?.seconds;
        }
        return -1;
    }

    const updateLastSeen = async (updateUserJid, userPresenceStatus, lastSeenSeconds) => {
        if (!updateUserJid) return;
        updateUserJid = formatUserIdToJid(updateUserJid);
        let seconds = "";
        let lastSeen = '';
        seconds = lastSeenSeconds || await getLastSeenSeconds(updateUserJid);
        lastSeen = (seconds != -1) ? getLastseen(seconds) : '';
        userPresenceStatus = userPresenceStatus || (seconds > 0 ? USER_PRESENCE_STATUS_OFFLINE : USER_PRESENCE_STATUS_ONLINE);
        setLastSeenData({
            ...lastSeenData,
            seconds, lastSeen, userPresenceStatus
        });
    }
    return <MarqueeText key={JSON.stringify(config)} ref={marqueeRef} {...config}>
        {lastSeenData.lastSeen}
    </MarqueeText>
}

export default LastSeen