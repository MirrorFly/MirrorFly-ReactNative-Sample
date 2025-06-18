import emoji from 'emoji-datasource';
import Graphemer from 'graphemer';
import { groupBy, orderBy } from 'lodash-es/collection';
import { mapValues } from 'lodash-es/object';
import React from 'react';
import { Animated, FlatList, Keyboard, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { BackSpaceIcon } from '../common/Icons';
import Text from '../common/Text';
import { CHAT_INPUT } from '../helpers/constants';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import PropTypes from 'prop-types';

const charFromUtf16 = utf16 => String.fromCodePoint(...utf16.split('-').map(u => '0x' + u));
const charFromEmojiObj = obj => charFromUtf16(obj.unified);
const defaultEmojiSize = 30;
const padding = 5;
const filteredEmojis = emoji.filter(e => !!e.google);
const groupedAndSorted = groupBy(orderBy(filteredEmojis, 'sort_order'), 'category');
const emojisByCategory = mapValues(groupedAndSorted, group => group.map(charFromEmojiObj));

const emojiCategoriesTabs = Object.entries(emojisByCategory).map(([key, value]) => ({
   tabLabel: value[0],
   category: key,
}));

const TabBarCustom = ({ navigationState, setIndex, state, setState, themeColorPalatte }) => {
   const splitter = new Graphemer();
   return (
      <View style={styles.tabcontainer}>
         {navigationState.routes.map((route, index) => {
            const isActive = index === navigationState.index;
            return (
               <Pressable
                  key={route.title}
                  style={[
                     styles.tab,
                     isActive && styles.activeTab,
                     { borderBottomColor: themeColorPalatte.primaryColor },
                  ]}
                  onPress={() => setIndex(index)}>
                  <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>{route.title}</Text>
               </Pressable>
            );
         })}
         <View
            style={{
               justifyContent: 'center',
               alignItems: 'center',
               marginRight: 4,
            }}>
            <Pressable
               onPress={() => {
                  const splittedString = splitter.splitGraphemes(state);
                  const slicedString = splittedString.slice(0, -1);
                  setState(slicedString.join(''));
               }}>
               <BackSpaceIcon />
            </Pressable>
         </View>
      </View>
   );
};

TabBarCustom.propTypes = {
   navigationState: PropTypes.object,
   setIndex: PropTypes.func,
   state: PropTypes.string,
   setState: PropTypes.func,
   themeColorPalatte: PropTypes.object,
};

const EmojiCategory = ({ category, onSelect }) => {
   const emojis = emojisByCategory[category];
   const size = defaultEmojiSize;
   const style = {
      fontSize: size - 4,
      color: 'black',
      textAlign: 'center',
      padding: padding,
   };

   const renderEmoji = ({ item }) => {
      return (
         <Pressable style={{ width: '11.2%' }} onPress={() => onSelect(item)}>
            <Text style={style}>{item}</Text>
         </Pressable>
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

EmojiCategory.propTypes = {
   category: PropTypes.string,
   onSelect: PropTypes.func,
};

const EmojiOverlay = ({ state, setState, onClose, visible, onSelect, place = '' }) => {
   const layout = useWindowDimensions();
   const themeColorPalatte = useThemeColorPalatte();
   const [index, setIndex] = React.useState(0);
   const [routes] = React.useState(
      emojiCategoriesTabs.map(tab => ({
         key: tab.category,
         title: tab.tabLabel,
      })),
   );
   const translateY = React.useRef(new Animated.Value(layout.height)).current;
   React.useEffect(() => {
      if (visible) {
         // Animate in if visible
         Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
         }).start();
      } else {
         // Animate out if not visible
         Animated.timing(translateY, {
            toValue: layout.height,
            duration: 300,
            useNativeDriver: true,
         }).start();
      }
   }, [visible, translateY, layout.height]);

   const renderScene = React.useCallback(
      ({ route }) => {
         if (route.key === routes[index].key) {
            const { category } = emojiCategoriesTabs.find(tab => tab.category === route.key);
            return <EmojiCategory category={category} onSelect={onSelect} />;
         }
         return null;
      },
      [index, onSelect, routes],
   );

   React.useEffect(() => {
      Keyboard.addListener('keyboardDidShow', onClose);
   }, [onClose]);

   if (!visible) {
      return <></>;
   }

   const animationContainerStyle = [
      styles.emojiContainer,
      { transform: [{ translateY }], backgroundColor: themeColorPalatte.screenBgColor },
      commonStyles.positionAbsolute,
   ];

   if (place === CHAT_INPUT) {
      animationContainerStyle.pop();
   }

   return (
      <Animated.View style={animationContainerStyle}>
         <TabView
            keyExtractor={(item, _index) => _index.toString()}
            renderTabBar={e => (
               <TabBarCustom
                  setIndex={setIndex}
                  setState={setState}
                  state={state}
                  themeColorPalatte={themeColorPalatte}
                  {...e}
               />
            )}
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
            initialLayout={{ width: layout.width }}
         />
      </Animated.View>
   );
};

const styles = StyleSheet.create({
   emojiContainer: {
      height: '40%',
      bottom: 0,
      left: 0,
      right: 0,
   },
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
   },
   container: {
      padding: padding,
   },
});

EmojiOverlay.propTypes = {
   state: PropTypes.string,
   setState: PropTypes.func,
   onClose: PropTypes.func,
   visible: PropTypes.bool,
   onSelect: PropTypes.func,
   place: PropTypes.string,
};

export default EmojiOverlay;
