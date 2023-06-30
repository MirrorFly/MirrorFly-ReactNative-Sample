import React from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, useWindowDimensions } from 'react-native';
import emoji from 'emoji-datasource';
import { groupBy, orderBy } from 'lodash/collection';
import { mapValues } from 'lodash/object';
import { TabView } from 'react-native-tab-view';
import Graphemer from 'graphemer';

const charFromUtf16 = utf16 => String.fromCodePoint(...utf16.split('-').map(u => '0x' + u));
const charFromEmojiObj = obj => charFromUtf16(obj.unified);
const defaultEmojiSize = 30;
const padding = 5;
const filteredEmojis = emoji.filter(e => !!e.google)
const groupedAndSorted = groupBy(orderBy(filteredEmojis, 'sort_order'), 'category');
const emojisByCategory = mapValues(groupedAndSorted, group => group.map(charFromEmojiObj));

const emojiCategoriesTabs = Object.entries(emojisByCategory).map(([key, value]) => ({
  tabLabel: (value[0]),
  category: key
}));

const TabBarCustom = ({ navigationState, position, setIndex, inputRef, message, setMessage }) => {
  const splitter = new Graphemer();
  return (
    <View style={styles.tabcontainer}>
      {navigationState.routes.map((route, index) => {
        const isActive = index === navigationState.index;
        return (
          <Pressable
            key={index}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setIndex(index)}
          >
            <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>{route.title}</Text>
          </Pressable>
        );
      })}
      <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 4 }}>
        <Pressable onPress={() => {
          const splittedString = splitter.splitGraphemes(message)
          const  slicedString = splittedString.slice(0,-1);
          setMessage(slicedString.join(''))
        }}>
          <Text>Bac</Text>
        </Pressable>
      </View>
    </View>
  );
};

const EmojiCategory = ({ category, handleEmojiSelect }) => {
  const emojis = emojisByCategory[category];
  const size = defaultEmojiSize;
  const style = {
    fontSize: size - 4,
    color: 'black',
    textAlign: 'center',
    padding: padding
  };

  const renderEmoji = ({ item }) => {
    return (
      <Text style={style} onPress={() => handleEmojiSelect((item))}>
        {(item)}
      </Text>
    );
  };

  return (
    <FlatList
      data={emojis}
      renderItem={renderEmoji}
      keyExtractor={(item, index) => index.toString()}
      numColumns={9}
    />
  );
};

const EmojiOverlay = (props) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState(emojiCategoriesTabs.map(tab => ({ key: tab.category, title: tab.tabLabel })));

  const renderScene = React.useCallback(
    ({ route }) => {
      if (route.key === routes[index].key) {
        const { category } = emojiCategoriesTabs.find(tab => tab.category === route.key);
        return <EmojiCategory category={category} handleEmojiSelect={props.handleEmojiSelect} />;
      }
      return null;
    },
    [index, routes]
  );

  return (
    <>
      {props.visible ? (
        <>
          <TabView
            {...props}
            keyExtractor={(item, index) => index.toString()}
            renderTabBar={(e) => <TabBarCustom setIndex={setIndex} message={props.message} setMessage={props.setMessage} inputRef={props.inputRef} {...e} />}
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
            initialLayout={{ width: layout.width }}
          />
        </>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  tabcontainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  activeTab: {
    borderBottomWidth: 1.3,
    borderBottomColor: '#3276E2',
  },
  container: {
    padding: padding,
  },
});

export default EmojiOverlay;

// const obj = {
//   "_children": [],
//   "_internalFiberInstanceHandleDEV": {
//     "_debugHookTypes": null,
//     "_debugNeedsRemount": false,
//     "_debugOwner": {
//       "_debugHookTypes": [Array],
//       "_debugNeedsRemount": false,
//       "_debugOwner": [FiberNode],
//       "_debugSource": undefined,
//       "actualDuration": 0.35220800060778856,
//       "actualStartTime": 8211668.916872,
//       "alternate": [FiberNode],
//       "child": [FiberNode],
//       "childLanes": 0,
//       "deletions": null,
//       "dependencies": null,
//       // "elementType": [Function InternalTextInput],
//       "flags": 8388609,
//       "index": 0,
//       "key": null,
//       "lanes": 0,
//       "memoizedProps": [Object],
//       "memoizedState": [Object],
//       "mode": 2,
//       "pendingProps": [Object],
//       "ref": null,
//       "return": [FiberNode],
//       "selfBaseDuration": 0.30312500055879354,
//       "sibling": null,
//       "stateNode": null,
//       "subtreeFlags": 516,
//       "tag": 0,
//       "treeBaseDuration": 0.34054100047796965,
//       // "type": [Function InternalTextInput],
//       "updateQueue": [Object]
//     },
//     "_debugSource": undefined,
//     "actualDuration": 0.01899900007992983,
//     "actualStartTime": 8211669.34908,
//     "alternate": {
//       "_debugHookTypes": null,
//       "_debugNeedsRemount": false,
//       "_debugOwner": [FiberNode],
//       "_debugSource": undefined,
//       "actualDuration": 0.010834000073373318,
//       "actualStartTime": 8210588.798496,
//       "alternate": [Circular],
//       "child": null,
//       "childLanes": 0,
//       "deletions": null,
//       "dependencies": null,
//       "elementType": "AndroidTextInput",
//       "flags": 516,
//       "index": 0,
//       "key": null,
//       "lanes": 0,
//       "memoizedProps": [Object],
//       "memoizedState": null,
//       "mode": 2,
//       "pendingProps": [Object],
//       // "ref": [Function forwardRef],
//       "return": [FiberNode],
//       "selfBaseDuration": 0.006874999962747097,
//       "sibling": null,
//       "stateNode": [Circular],
//       "subtreeFlags": 0,
//       "tag": 5,
//       "treeBaseDuration": 0.006874999962747097,
//       "type": "AndroidTextInput",
//       "updateQueue": null
//     },
//     "child": null,
//     "childLanes": 0,
//     "deletions": null,
//     "dependencies": null,
//     "elementType": "AndroidTextInput",
//     "flags": 516,
//     "index": 0,
//     "key": null,
//     "lanes": 0,
//     "memoizedProps": {
//       "accessibilityLabelledBy": undefined,
//       "accessibilityState": [Object],
//       "accessible": true,
//       "allowFontScaling": true,
//       "autoCapitalize": "sentences",
//       "autoComplete": undefined,
//       "autoFocus": true,
//       "caretHidden": undefined,
//       "contextMenuHidden": undefined,
//       "contextMenuHiddenOnChange": false,
//       "dataDetectorTypes": undefined,
//       "defaultValue": undefined,
//       "disableFullscreenUI": undefined,
//       "editable": true,
//       "importantForAutofill": undefined,
//       "inputAccessoryViewID": undefined,
//       "keyboardAppearance": undefined,
//       "keyboardType": undefined,
//       "maxFontSizeMultiplier": undefined,
//       "maxLength": undefined,
//       "multiline": undefined,
//       "numberOfLines": 1,
//       // "onBlur": [Function onBlur],
//       // "onChange": undefined,
//       // "onChangeText": [Function onChangeText],
//       // "onContentSizeChange": [Function onContentSizeChange],
//       // "onEndEditing": [Function onEndEditing],
//       // "onFocus": [Function onFocus],
//       // "onKeyPress": [Function onKeyPress],
//       // "onScroll": [Function onScroll],
//       // "onSelectionChange": [Function onSelectionChange],
//       // "onSubmitEditing": [Function onSubmitEditing],
//       "placeholder": "Start Typing...",
//       "placeholderTextColor": undefined,
//       "rejectResponderTermination": true,
//       "returnKeyLabel": undefined,
//       "returnKeyType": undefined,
//       "secureTextEntry": undefined,
//       "selectTextOnFocus": undefined,
//       "selection": undefined,
//       "selectionColor": undefined,
//       "style": [Array],
//       "textAlign": undefined,
//       "textAlignVertical": undefined,
//       "textBreakStrategy": undefined,
//       "underlineColorAndroid": undefined,
//       "value": "aa"
//     },
//     "memoizedState": null,
//     "mode": 2,
//     "pendingProps": {
//       "accessibilityLabelledBy": undefined,
//       "accessibilityState": [Object],
//       "accessible": true,
//       "allowFontScaling": true,
//       "autoCapitalize": "sentences",
//       "autoComplete": undefined,
//       "autoFocus": true,
//       "caretHidden": undefined,
//       "contextMenuHidden": undefined,
//       "contextMenuHiddenOnChange": false,
//       "dataDetectorTypes": undefined,
//       "defaultValue": undefined,
//       "disableFullscreenUI": undefined,
//       "editable": true,
//       "importantForAutofill": undefined,
//       "inputAccessoryViewID": undefined,
//       "keyboardAppearance": undefined,
//       "keyboardType": undefined,
//       "maxFontSizeMultiplier": undefined,
//       "maxLength": undefined,
//       "multiline": undefined,
//       "numberOfLines": 1,
//       // "onBlur": [Function onBlur],
//       // "onChange": undefined,
//       // "onChangeText": [Function onChangeText],
//       // "onContentSizeChange": [Function onContentSizeChange],
//       // "onEndEditing": [Function onEndEditing],
//       // "onFocus": [Function onFocus],
//       // "onKeyPress": [Function onKeyPress],
//       // "onScroll": [Function onScroll],
//       // "onSelectionChange": [Function onSelectionChange],
//       // "onSubmitEditing": [Function onSubmitEditing],
//       "placeholder": "Start Typing...",
//       "placeholderTextColor": undefined,
//       "rejectResponderTermination": true,
//       "returnKeyLabel": undefined,
//       "returnKeyType": undefined,
//       "secureTextEntry": undefined,
//       "selectTextOnFocus": undefined,
//       "selection": undefined,
//       "selectionColor": undefined,
//       "style": [Array],
//       "textAlign": undefined,
//       "textAlignVertical": undefined,
//       "textBreakStrategy": undefined,
//       "underlineColorAndroid": undefined,
//       "value": "aa"
//     },
//     "ref": null,
//     "return": {
//       "_debugHookTypes": [Array],
//       "_debugNeedsRemount": false,
//       "_debugOwner": [FiberNode],
//       "_debugSource": undefined,
//       "actualDuration": 0.35220800060778856,
//       "actualStartTime": 8211668.916872,
//       "alternate": [FiberNode],
//       "child": [FiberNode],
//       "childLanes": 0,
//       "deletions": null,
//       "dependencies": null,
//       // "elementType": [Function InternalTextInput],
//       "flags": 8388609,
//       "index": 0,
//       "key": null,
//       "lanes": 0,
//       "memoizedProps": [Object],
//       "memoizedState": [Object],
//       "mode": 2,
//       "pendingProps": [Object],
//       "ref": null,
//       "return": [FiberNode],
//       "selfBaseDuration": 0.30312500055879354,
//       "sibling": null,
//       "stateNode": null,
//       "subtreeFlags": 516,
//       "tag": 0,
//       "treeBaseDuration": 0.34054100047796965,
//       // "type": [Function InternalTextInput],
//       "updateQueue": [Object]
//     },
//     "selfBaseDuration": 0.01899900007992983,
//     "sibling": null,
//     "stateNode": {
//       "_children": [],
//       "_internalFiberInstanceHandleDEV": [FiberNode],
//       "_internalInstanceHandle": [FiberNode],
//       "_lastNativeText": "aa",
//       "_nativeTag": 13,
//       "_nativeText": "aa",
//       "_nativeTextRef": null,
//       "_viewConfig": [Object],
//       "backfaceVisibility": "visible",
//       "backgroundColor": 0,
//       "borderBottomColor": undefined,
//       "borderBottomLeftRadius": undefined,
//       "borderBottomRightRadius": undefined,
//       "borderBottomWidth": undefined,
//       "borderColor": undefined,
//       "borderLeftColor": undefined,
//       "borderLeftWidth": undefined,
//       "borderRadius": undefined,
//       "borderRightColor": undefined,
//       "borderRightWidth": undefined,
//       "borderStyle": undefined,
//       "borderTopColor": undefined,
//       "borderTopLeftRadius": undefined,
//       "borderTopRightRadius": undefined,
//       "borderTopWidth": undefined,
//       "borderWidth": undefined,
//       "bottom": undefined,
//       "color": -16777216,
//       "display": undefined,
//       "elevation": undefined,
//       "flex": undefined,
//       "flexBasis": undefined,
//       "flexDirection": undefined,
//       "flexGrow": undefined,
//       "flexShrink": undefined,
//       "flexWrap": undefined,
//       "fontFamily": undefined,
//       "fontSize": 14,
//       "fontStyle": undefined,
//       "fontWeight": "normal",
//       "height": undefined,
//       "includeFontPadding": undefined,
//       "justifyContent": undefined,
//       "left": undefined,
//       "letterSpacing": undefined,
//       "lineHeight": undefined,
//       "margin": undefined,
//       "marginBottom": undefined,
//       "marginHorizontal": undefined,
//       "marginLeft": undefined,
//       "marginRight": undefined,
//       "marginTop": undefined,
//       "marginVertical": undefined,
//       "maxHeight": undefined,
//       "maxWidth": undefined,
//       "minHeight": undefined,
//       "minWidth": undefined,
//       "opacity": undefined,
//       "overflow": undefined,
//       "overlayColor": undefined,
//       "padding": undefined,
//       "paddingBottom": undefined,
//       "paddingHorizontal": undefined,
//       "paddingLeft": undefined,
//       "paddingRight": undefined,
//       "paddingTop": undefined,
//       "paddingVertical": undefined,
//       "position": undefined,
//       "resizeMode": undefined,
//       "right": undefined,
//       "rotation": undefined,
//       "scaleX": undefined,
//       "scaleY": undefined,
//       "shadowColor": undefined,
//       "shadowOffset": undefined,
//       "shadowOpacity": undefined,
//       "shadowRadius": undefined,
//       "textAlign": undefined,
//       "textAlignVertical": undefined,
//       "textDecorationColor": undefined,
//       "textDecorationLine": undefined,
//       "textDecorationStyle": undefined,
//       "textShadowColor": undefined,
//       "textShadowOffset": undefined,
//       "textShadowRadius": undefined,
//       "tintColor": undefined,
//       "top": undefined,
//       "transform": undefined,
//       "transformMatrix": undefined,
//       "translateX": undefined,
//       "translateY": undefined,
//       "width": undefined,
//       "writingDirection": undefined,
//       "zIndex": undefined
//     },
//     "subtreeFlags": 0,
//     "tag": 5,
//     "treeBaseDuration": 0.01899900007992983,
//     "type": "AndroidTextInput",
//     "updateQueue": null
//   }
// }

