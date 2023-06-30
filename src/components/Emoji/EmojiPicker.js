import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from 'react-native';
import emoji from 'emoji-datasource';
import { groupBy, orderBy, includes } from 'lodash/collection';
import { mapValues } from 'lodash/object';

const charFromUtf16 = utf16 => String.fromCodePoint(...utf16.split('-').map(u => '0x' + u));
const charFromEmojiObj = obj => charFromUtf16(obj.unified);
// const blacklistedEmojis = ['white_frowning_face', 'keycap_star', 'eject'];
const blacklistedEmojis = [];

const isAndroid = Platform.OS == 'android';
const letterSpacing = 10;
const defaultEmojiSize = 30;
const padding = 5;
const filteredEmojis = emoji.filter(e => (isAndroid ? !!e.google : !includes(blacklistedEmojis, e.short_name)));
const groupedAndSorted = groupBy(orderBy(filteredEmojis, 'sort_order'), 'category');
const emojisByCategory = mapValues(groupedAndSorted, group => group.map(charFromEmojiObj));

const CATEGORIES = ['Smileys & Emotion', 'People & Body', 'Component', 'People', 'Nature', 'Foods', 'Activity', 'Places', 'Objects', 'Symbols', 'Flags'];

const EmojiPicker = (props) => {
    const [categories, setCategories] = useState(CATEGORIES);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    const loadNextCategory = () => {
        if (categories.length < CATEGORIES.length) {
            setCategories(CATEGORIES.slice(0, categories.length + 1));
        }
    };

    const renderCategory = (category) => {
        return (
            <EmojiCategory
                {...props}
                key={category}
                category={category}
                finishedLoading={() => (timeoutRef.current = setTimeout(loadNextCategory, 100))}
            />
        );
    };

    return (
        <View style={[styles.container, props.style]}>
            <ScrollView horizontal={true}>
                {categories.map(renderCategory)}
            </ScrollView>
            {props.hideClearButton ? null : <ClearButon {...props} />}
        </View>
    );
};

const EmojiCategory = (props) => {
    useEffect(() => {
        props.finishedLoading();
    }, []);
    // console.log('emojisByCategory', emojisByCategory)
    const emojis = emojisByCategory[props.category];
    const size = props.emojiSize || defaultEmojiSize;
    const style = {
        fontSize: size - 4,
        color: 'black',
        textAlign: 'center',
        padding: padding,
    };
    return (
        <View style={style.categoryOuter}>
            <Text style={[styles.headerText, props.headerStyle]}>{props.category}</Text>
            <View style={styles.categoryInner}>
                {emojis && emojis.map((e) => (
                    <Text
                        style={style}
                        key={e}
                        onPress={() => props.onEmojiSelected(e)}>
                        {e}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const ClearButon = (props) => {
    return (
        <TouchableOpacity onPress={() => props.onEmojiSelected(null)}>
            <Text style={[styles.clearButton, props.clearButtonStyle]}>
                {props.clearButtonText || 'Clear'}
            </Text>
        </TouchableOpacity>
    );
};

const EmojiOverlay = (props) => (
    <View style={[styles.absolute, props.visible ? styles.visible : styles.hidden]}>
        <TouchableOpacity style={styles.absolute} onPress={props.onTapOutside}>
            <View style={styles.background} />
        </TouchableOpacity>
        {props.visible ? <EmojiPicker {...props} /> : null}
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: padding,
    },
    clearButton: {
        flex: 1,
        padding: 15,
        textAlign: 'center',
        color: 'black',
        textAlignVertical: 'center',
    },
    absolute: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    visible: {
        top: 0,
        flex: 1,
        justifyContent: 'center',
    },
    hidden: {
        top: 1000,
        flex: 1,
    },
    background: {
        flex: 1,
        backgroundColor: 'grey',
        opacity: 0.5,
    },
    categoryOuter: {
        flex: -1,
    },
    categoryInner: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'column',
    },
    headerText: {
        padding: padding,
        color: 'black',
        justifyContent: 'center',
        textAlignVertical: 'center',
    },
});

export { EmojiPicker as default, EmojiOverlay as EmojiOverlay };