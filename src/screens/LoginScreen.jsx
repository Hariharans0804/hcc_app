import { ActivityIndicator, Alert, BackHandler, Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState, } from 'react'
import { Colors, Fonts, Images } from '../constants'
import { Display } from '../utils'
import { Separator } from '../components'
import Feather from 'react-native-vector-icons/Feather'
import { useDispatch } from 'react-redux'
import { loginUser } from '../api/authApi'
import { loginSuccess } from '../redux/slices/authSlice'
import { getFromStorage, saveToStorage, removeFromStorage } from '../utils/mmkvStorage'
import Navigators from '../navigators'
import { useFocusEffect } from '@react-navigation/native'
import { RFValue } from "react-native-responsive-fontsize";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [storedData, setStoredData] = useState(null);
  const [Loader, setLoader] = useState(true);


  const dispatch = useDispatch();

  const fetchStoredData = async () => {
    const data = await getFromStorage('users');
    console.log("ggggggggggggggggg", data);
    setStoredData(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchStoredData();
    }, [])
  )


  const handleLogin = async () => {
    // Check if email or password is empty
    if (!email.trim() || !password.trim()) {
      // Alert.alert('Validation Error', 'Please provide both email and password.');
      setErrorMessage('Please provide both Email and Password!')
      return;
    }

    try {
      const data = await loginUser(email, password);
      if (data.userFound) {

        const { user, token } = data;
        console.log('8888888', token);

        const userID = user.user_id;
        const name = user.username;
        const email = user.email;
        const role = user.role;


        console.log('userID', userID, 'name', name, 'email', email, 'Role', role);

        if (role === 'Collection Agent' || role === 'Collection Manager' || role === 'Admin') {
          dispatch(loginSuccess({ user, role }));
          // await saveToStorage('users', { user, role });
          await saveToStorage('users', { userID, name, email, role });
          await saveToStorage('token', token);
          <Navigators />
          // navigation.replace('DrawerNavigation'); // Navigate to the main screen
        } else {
          Alert.alert('Access Denied', 'Only Collection Agents or Managers can log in.');
        }
      } else {
        Alert.alert('Invalid Credentials', 'Invalid email or password.');
      }
    } catch (error) {
      // Show a user-friendly error message instead of raw error
      // Alert.alert('Login Failed', 'Invalid email or password.');
      setErrorMessage('Invalid Email or Password!')
    }
  };



  //  useFocusEffect(
  //           React.useCallback(() => {
  //             const onBackPress = () => {
  //               Alert.alert(
  //                 'Exit App',
  //                 'Do you want to exit?',
  //                 [
  //                   {
  //                     text: 'Cancel',
  //                     onPress: () => null,
  //                     style: 'cancel'
  //                   },
  //                   { text: 'YES', onPress: () => BackHandler.exitApp() }
  //                 ],
  //                 { cancelable: false }
  //               );
  //             };

  //             const subscription = BackHandler.addEventListener(
  //               'hardwareBackPress',
  //               onBackPress
  //             );

  //             return () => subscription.remove();
  //           }, [])
  //         );

  
  //BackHandler Function
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Exit App',
          'Do you want to exit?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel'
            },
            {
              text: 'YES',
              onPress: () => {
                // Save a flag to indicate app exit
                saveToStorage('appExited', 'true');
                BackHandler.exitApp();
              }
            }
          ],
          { cancelable: false }
        );
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );


  return (


    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.DEFAULT_LIGHT_WHITE} translucent />
      <Separator height={StatusBar.currentHeight} />
      {/* <Image source={Images.LOGO} resizeMode='contain' style={styles.image} /> */}
      {storedData && (
        <View style={{ marginVertical: 20, color: Colors.DEFAULT_WHITE }}>
          <Text>Saved Data:</Text>
          <Text>ID: {storedData.userID}</Text>
          <Text>Name: {storedData.name}</Text>
          <Text>Email: {storedData.email}</Text>
          <Text>Role: {storedData.role}</Text>
        </View>
      )}
      <Text style={styles.titleText}>HCC</Text>
      <View style={[styles.inputContainer, errorMessage ? styles.errorInput : null]}>
        <View style={styles.inputSubContainer}>
          <Feather
            name="user"
            size={24}
            color={Colors.DEFAULT_DARK_BLUE}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder='Enter Your Email ID'
            // keyboardType='numeric'
            placeholderTextColor={Colors.DEFAULT_DARK_BLUE}
            selectionColor={Colors.DEFAULT_DARK_BLUE}
            style={styles.inputText}
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>
      <Separator height={20} />
      <View style={[styles.inputContainer, errorMessage ? styles.errorInput : null]}>
        <View style={styles.inputSubContainer}>
          <Feather
            name="lock"
            size={24}
            color={Colors.DEFAULT_DARK_BLUE}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder='Enter Your Password'
            keyboardType='numeric'
            secureTextEntry={isPasswordShow ? false : true}
            placeholderTextColor={Colors.DEFAULT_DARK_BLUE}
            selectionColor={Colors.DEFAULT_DARK_BLUE}
            style={styles.inputText}
            value={password}
            onChangeText={setPassword}
          />
          <Feather
            name={isPasswordShow ? "eye" : "eye-off"}
            size={24}
            color={Colors.DEFAULT_DARK_BLUE}
            style={{ marginRight: 10 }}
            onPress={() => setIsPasswordShow(!isPasswordShow)}
          />
        </View>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity
        style={styles.loginButton}
        activeOpacity={0.8}
        onPress={handleLogin}
      // disabled={loading}
      // onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.loginButtonText}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
  },
  image: {
    width: Display.setWidth(80),
    height: Display.setHeight(20),
    marginHorizontal: 'auto',
    marginTop: 120,
  },
  titleText: {
    color: Colors.DEFAULT_DARK_BLUE,
    fontSize: 28,
    fontFamily: Fonts.POPPINS_EXTRA_BOLD,
    // marginHorizontal: 50,
    // marginTop: 10,
    textAlign: 'center',
    fontWeight: 800,
    letterSpacing: 2,
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: Colors.DEFAULT_WHITE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.DEFAULT_LIGHT_BLUE,
    justifyContent: 'center',
    marginTop: 10,
  },
  inputSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    // fontSize: 16,
    // lineHeight: 16 * 1.4,
    fontSize: RFValue(14),
    lineHeight: 14 * 1.4,
    textAlignVertical: 'center',
    paddingVertical: 0,
    height: Display.setHeight(6),
    color: Colors.DEFAULT_LIGHT_BLUE,
    flex: 1,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    // borderWidth:1,
    textAlignVertical: 'center',
  },
  loginButton: {
    backgroundColor: Colors.DEFAULT_DARK_BLUE,
    borderRadius: 30,
    marginHorizontal: 30,
    // paddingVertical:15,
    height: Display.setHeight(7),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 2,
    elevation: 2,
    borderColor: Colors.DEFAULT_DARK_BLUE,
  },
  loginButtonText: {
    fontSize: 16,
    lineHeight: 16 * 1.4,
    color: Colors.DEFAULT_WHITE,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    fontWeight: 800
  },
  errorText: {
    color: 'red',
    // marginBottom: 5,
    marginTop: 10,
    color: Colors.DEFAULT_WHITE,
    fontFamily: Fonts.POPPINS_REGULAR,
    fontSize: 14,
    marginHorizontal: 35
  },
  errorText: {
    color: Colors.DEFAULT_DARK_RED,
    textAlign: 'center',
    marginBottom: 10,
  },
  successText: {
    color: Colors.DEFAULT_LIGHT_WHITE,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    color: Colors.DEFAULT_DARK_RED,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    fontSize: 15,
    lineHeight: 15 * 1.4,
    marginTop: 10,
    textAlign: 'center'
  },
  // errorInput: {
  //   borderColor: Colors.DEFAULT_DARK_RED, // Red border for errors
  //   borderWidth: 2
  // },
})