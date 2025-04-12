import { Alert, Animated, BackHandler, Image, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState, } from 'react'
import { Colors, Fonts, Images } from '../constants'
import { Display } from '../utils';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getFromStorage } from '../utils/mmkvStorage';
import Navigators from '../navigators';

const SplashScreen = ({ navigation }) => {

    const { isAuthenticated } = useSelector((state) => state.auth);

    // const [width, setWidth] = useState(0);

    // useEffect(() => {
    //     setTimeout(() => {
    //         setWidth(400);
    //     }, 2000)
    // }, [])


    const scale = useRef(new Animated.Value(0)).current; // Single value for scaling animation
    const fadeIn = useRef(new Animated.Value(0)).current; // Fade-in animation for image and text

    useEffect(() => {
        Animated.timing(scale, {
            toValue: 1, // Final scale value
            duration: 1000,
            useNativeDriver: true // Animates using transform (scale)
        }).start(() => {
            // After scale animation completes, start fade-in animation
            Animated.timing(fadeIn, {
                toValue: 1, // Fully visible
                duration: 500,
                useNativeDriver: true // Animates opacity
            }).start();
        });

        // Simulate a short delay for the splash screen
        const timer = setTimeout(() => {
            if (isAuthenticated) {
                navigation.navigate('DrawerNavigation'); // Go to the main navigators
            } else {
                navigation.navigate('Login'); // Go to login screen
            }
        }, 2000); // Adjust splash delay as needed

        return () => clearTimeout(timer);
    }, [isAuthenticated, navigation]);


    // useFocusEffect(
    //     React.useCallback(() => {
    //         const onBackPress = () => {
    //             Alert.alert(
    //                 'Exit App',
    //                 'Do you want to exit?',
    //                 [
    //                     {
    //                         text: 'Cancel',
    //                         onPress: () => null,
    //                         style: 'cancel'
    //                     },
    //                     { text: 'YES', onPress: () => BackHandler.exitApp() }
    //                 ],
    //                 { cancelable: false }
    //             );
    //         };

    //         const subscription = BackHandler.addEventListener(
    //             'hardwareBackPress',
    //             onBackPress
    //         );

    //         return () => subscription.remove();
    //     }, [])
    // );
    // ...


    // console.log("ENV FILE API", API_URL)
    // useFocusEffect(
    //     useCallback(() => {
    //         screenNavigation()

    //     }, [])
    // )


    // const screenNavigation = async () => {
    //     const data = await getFromStorage('users');
    //     // console.log("datadatadata", data);
    //     if (!data) {
    //         navigation.navigate('Login')
    //     }
    //     else {
    //         <Navigators />
    //     }
    // }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
            {/* <Separator height={StatusBar.currentHeight} /> */}
            {/* <Image source={Images.MAN} resizeMode='contain' style={styles.image} />
            <Text style={styles.splashScreenText}>HCC</Text> */}

            <Animated.View
                style={[
                    styles.animatedCircle,
                    {
                        transform: [{ scale: scale }], // Apply scale animation
                    },
                ]}
            // style={{
            //     backgroundColor: Colors.DEFAULT_DARK_BLUE,
            //     position: 'absolute',
            //     transform: [{ scale: scale }], // Use scale instead of width/height
            //     width: 900, // Final width
            //     height: 900, // Final height
            //     zIndex: -1,
            //     borderRadius: 600
            // }}
            />
            <Animated.View style={[styles.contentContainer, { opacity: fadeIn }]}>
                <Image source={Images.MONEY} resizeMode="contain" style={styles.image} />
                <Text style={styles.splashScreenText}>HCC</Text>
            </Animated.View>
        </View>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: Colors.DEFAULT_WHITE,
        alignItems: 'center',
        justifyContent: 'center'
    },

    animatedCircle: {
        position: 'absolute',
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
        width: 900,
        height: 950,
        // width: Display.setWidth(220),
        // height: Display.setHeight(130),
        borderRadius: 450, // Ensure it's a perfect circle
        zIndex: -1, // Place behind the content
    },
    contentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: Display.setWidth(80),
        height: Display.setHeight(20),
    },
    splashScreenText: {
        // marginTop: 10,
        fontSize: 40,
        lineHeight: 40 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_WHITE
    }
})