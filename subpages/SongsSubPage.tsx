import {View, Text, FlatList, Pressable, Image} from 'react-native';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {MMKV} from 'react-native-mmkv';
import HistorySongCard from '../components/HistorySongCard';
import {useFocusEffect} from '@react-navigation/native';

type itemtype = {
  title: string;
  id: string;
  artist: string;
  duration: number;
  plays: string;
  albumid: string;
  thumbnail: string;
};

const SongsSubPage = () => {
  const [confirmdelete, setconfirmdelete] = useState(false);
  const storage = new MMKV();
  const [data, setdata] = useState([]);
  const [selectedid, setselectedid] = useState('');
  const [thumbnail, setthumbnail] = useState('https://asdasdasdaskd.lolaa');
  const [defaulttitle, setdefaulttitle] = useState('');
  const [author, setauthor] = useState('');
  const functionobject = {
    setconfirmdelete,
    setselectedid,
    setthumbnail,
    setdefaulttitle,
    setauthor,
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };
  const renderItem = ({item}: {item: itemtype}) => (
    <HistorySongCard
      title={item.title}
      id={item.id}
      artist={item.artist}
      duration={item.duration}
      albumid={item.albumid}
      plays={item.plays} // assuming this was meant to be plays instead of duration again
      url={item.thumbnail}
      hdurl={item.thumbnail}
      functionobject={functionobject}
      confirmdelete={confirmdelete}
    />
  );

  const fetchdata = () => {
    const jsonString = storage.getString('history9');
    let myArray = [];
    if (jsonString) {
      try {
        // Convert JSON string back to array
        myArray = JSON.parse(jsonString);
      } catch (e) {
        console.error('Error parsing JSON string from MMKV', e);
      }
    }
    setdata(myArray);
  };

  useFocusEffect(
    useCallback(() => {
      fetchdata();
    }, []),
  );

  const handledelete = (fid: string) => {
    const jsonString = storage.getString('history9');
    let myArray = [];

    if (jsonString) {
      try {
        // Convert JSON string back to array
        myArray = JSON.parse(jsonString);
      } catch (e) {
        console.error('Error parsing JSON string from MMKV', e);
      }
    }
    let pos = 0;
    let found = 0;
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].id === fid) {
        found = 1;
        pos = i;
        break;
      }
    }
    if (found === 1) {
      myArray.splice(pos, 1);
    }
    const updatedJsonString = JSON.stringify(myArray);

    storage.set('history9', updatedJsonString);
    setdata(myArray);
  };

  return (
    <>
      <View className="flex flex-col ml-2">
        <View className="mt-9 ml-3 mb-3 justify-center">
          <Text className="text-white text-3xl">Your Songs</Text>
        </View>
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 5,
            paddingRight: 10,
            paddingBottom: 140,
          }}
          style={{height: '87%', width: '100%'}}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      {confirmdelete ? (
        <View
          className="absolute top-0 left-0 w-full h-full justify-center items-center   z-10"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}>
          <View className="w-fit h-fit bg-black flex flex-col justify-center items-center p-5 rounded-lg  mr-5 border border-white">
            <Text className="text-white text-xl mb-3 font-bold text-center ">
              Do you wish to Remove
            </Text>
            <View className="flex flex-row justify-between">
              <View className="flex flex-row p-2 border border-gray-500 rounded-xl w-full">
                <View className="w-16 h-16 rounded-xl">
                  <Image
                    className="w-full h-full rounded-xl"
                    source={{uri: thumbnail}}
                  />
                </View>
                <View className="flex flex-col justify-center ml-3">
                  <Text className="text-base text-white">
                    {truncateText(defaulttitle, 13)}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {truncateText(author, 15)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex flex-col">
              <Pressable
                className="border-2 border-white mt-5 mb-3 p-1 px-4 self-center rounded-md "
                onPress={() => {
                  handledelete(selectedid);
                  setconfirmdelete(false);
                }}>
                <Text className="text-white text-base">Confirm</Text>
              </Pressable>
              <Pressable
                className="border-2 border-black p-1 px-4 self-center rounded-md "
                onPress={() => {
                  setconfirmdelete(false);
                }}>
                <Text className="text-white font-bold text-base">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </>
  );
};

export default memo(SongsSubPage);
