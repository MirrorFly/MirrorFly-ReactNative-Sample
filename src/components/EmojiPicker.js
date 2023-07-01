import React from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, useWindowDimensions, Keyboard } from 'react-native';
import emoji from 'emoji-datasource';
import { groupBy, orderBy } from 'lodash/collection';
import { mapValues } from 'lodash/object';
import { TabView } from 'react-native-tab-view';
import Graphemer from 'graphemer';
import { BackSpaceIcon } from '../common/Icons';

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
            key={route.title}
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
          const slicedString = splittedString.slice(0, -1);
          setMessage(slicedString.join(''))
        }}>
          <BackSpaceIcon />
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

  React.useEffect(() => {
    Keyboard.addListener('keyboardDidShow', props.onClose);
  }, []);

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