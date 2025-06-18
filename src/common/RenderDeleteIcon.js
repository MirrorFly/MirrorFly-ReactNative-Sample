import React from 'react';
import { MIX_BARE_JID } from '../helpers/constants';
import { useRecentChatData } from '../redux/reduxHook';
import IconButton from './IconButton';
import { DeleteIcon } from './Icons';
import PropTypes from 'prop-types';

function RenderDeleteIcon({ onDelete }) {
    const recentChatData = useRecentChatData();
    const filtered = recentChatData.filter(item => item.isSelected === 1);
    const isUserLeft = filtered.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));

    return isUserLeft ? (
        <IconButton onPress={onDelete}>
            <DeleteIcon />
        </IconButton>
    ) : null;
}

RenderDeleteIcon.propTypes = {
    onDelete: PropTypes.func,
};

export default RenderDeleteIcon;
