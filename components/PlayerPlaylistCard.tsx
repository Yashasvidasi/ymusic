import {View, Text, Image, TouchableHighlight} from 'react-native';
import React, {useEffect, useState, memo} from 'react';
import 'event-target-polyfill';
import 'web-streams-polyfill';
import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';
import Innertube from 'youtubei.js';
import TrackPlayer from 'react-native-track-player';
import {MMKV} from 'react-native-mmkv';

const PlayerPlaylistCard = (props: {
  title: string;
  url: string;
  hdurl: string;
  id: string;
  artist: string;
  duration: number;
  plays: string;
  albumid: string;
  isactive: boolean;
  fetchstring: string;
  changeactive: (data: any) => void;
}) => {
  const storage = new MMKV();
  const [pause, setpause] = useState(false);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  //-----AIzaSyDTI8s_USJq4SxFGRLZoTcdrZfgP5RvO-c

  const checkifdownloaded = () => {
    const jsonString = storage.getString('downloads');
    let myArray = [];

    if (jsonString) {
      try {
        // Convert JSON string back to array
        myArray = JSON.parse(jsonString);
      } catch (e) {
        console.error('Error parsing JSON string from MMKV', e);
      }
    }
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].id === props.id) {
        return myArray[i];
      }
    }
    return null;
  };

  const handlepush = async () => {
    await TrackPlayer.reset();
    props.changeactive(props.id);
    const getstring = checkifdownloaded();
    if (getstring !== null) {
      await TrackPlayer.add({
        id: getstring.id,
        url: getstring.url,
        title: getstring.title,
        artist: getstring.artist,
        artistid: getstring.artistid,
        albumid: getstring.albumid,
        plays: getstring.plays,
        artwork: getstring.thumbnail,
        duration: getstring.duration,
        fromtype: props.fetchstring,
      });
    } else {
      try {
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
        let songurl = '';

        const tube = await Innertube.create();
        const data = await tube.music.getInfo(props.id);
        const other = data.getStreamingInfo();
        songurl = `${other.audio_sets[0].representations[0].segment_info?.base_url}.mp3`;

        myArray.forEach(async (element: any) => {
          if (element.id === props.id) {
            await TrackPlayer.add({
              id: element.id,
              url: songurl, //ignore
              title: element.title,
              artist: element.artist,
              artistid: element.artistid,
              albumid: element.albumid,
              plays: element.plays,
              artwork: element.thumbnail,
              duration: element.duration,
              fromtype: props.fetchstring,
            });
          }
        });
      } catch (error) {
        console.error('Error playing music:', error);
      }
    }

    await TrackPlayer.play();
  };

  useEffect(() => {
    async () => {
      const currentTrack = await TrackPlayer.getPlaybackState();

      if (currentTrack.state === 'paused') setpause(true);
      else setpause(false);
    };
  }, []);

  return (
    <TouchableHighlight
      className={`border mr-2 my-1 rounded-xl ${
        props.isactive ? 'border-white' : 'border-gray-600'
      }`}
      onPress={() => {
        handlepush();
      }}>
      <View
        className={`flex flex-row h-20 border pl-0 p-2 my-1 rounded-xl w-full`}>
        <View className="h-12 w-12 self-center ml-3">
          <Image className="h-full w-full" source={{uri: props.url}} />
        </View>
        <View className="flex flex-col ml-5 self-center flex-1">
          <Text className="text-sm text-white mb-1">
            {props.isactive ? 'Playing: ' : ''}
            {truncateText(props.title, 20)}
          </Text>
          <View className="flex flex-row justify-between ">
            <Text className="text-xs text-gray-400">
              {truncateText(props.artist, 20)}
            </Text>
            <Text className="text-xs text-gray-400">
              {Math.floor(props.duration / 60)}:
              {String(Math.floor(props.duration % 60)).padStart(2, '0')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default memo(PlayerPlaylistCard);
