import { Text, View } from 'react-native';
import React from 'react'
import Navigators from './src/navigators';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated'
import { SplashScreen } from './src/screens';


const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <View
      style={{
        zIndex: 9999,
        height: 60,
        backgroundColor: '#4CAF50', // Custom green color for success
        borderRadius: 8,
        paddingHorizontal: 15,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
        margin: 10,
      }}
      {...rest}
    >
      <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 16 }}>{text1}</Text>
      {text2 ? <Text style={{ color: 'white', fontSize: 14 }}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2, ...rest }) => (
    <View
      style={{
        zIndex: 9999,
        height: 60,
        backgroundColor: '#f44336', // Custom red color for error
        borderRadius: 8,
        paddingHorizontal: 15,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
        margin: 10,
      }}
      {...rest}
    >
      <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 16 }}>{text1}</Text>
      {text2 ? <Text style={{ color: 'white', fontSize: 14 }}>{text2}</Text> : null}
    </View>
  ),
};

const App = () => {

  return (
    <Provider store={store}>
      <Navigators />
      <Toast config={toastConfig} />
    </Provider>
    // <SplashScreen />
  );
};

export default App

// const styles = StyleSheet.create({})