import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();

export const saveToStorage = (key, value) => MMKV.setStringAsync(key, JSON.stringify(value));
export const getFromStorage = async (key) => JSON.parse(await MMKV.getStringAsync(key));
export const removeFromStorage = (key) => MMKV.removeItem(key);

export default MMKV;
