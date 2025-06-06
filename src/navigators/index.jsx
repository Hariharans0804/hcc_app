import React, { useCallback, useEffect, useState } from 'react'
import { CommonActions, NavigationContainer, useFocusEffect, useNavigation, useNavigationState, useScrollToTop } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { DeviceEventEmitter, EventEmitter, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Images } from '../constants';
import { Display } from '../utils';
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Foundation from 'react-native-vector-icons/Foundation'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fontisto from 'react-native-vector-icons/Fontisto'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { LoginScreen, SplashScreen } from '../screens';
import {
    HomeScreen,
    CollectionListScreen,
    TodayCollectionAmountScreen,
    HistoryScreen,
    PaidCompletedListScreen,
    EmployeeListScreen,
    SingleEmployeeDetailsScreen,
    SingleClientDetailsScreen,
    SingleClientPaidCompletedListScreen,
    ManagerDashboardScreen,
    ManagerListScreen,
    SingleManagerDetailsScreen,
    AddNewClientScreen,
    SingleClientViewScreen,
    UpdateClientScreen,
    AddNewEmployeeScreen,
    UpdateEmployeeScreen,
    SendClientsToAgentsScreen,
    SingleClientPaymentListScreen,
    SingleEmployeeClientListScreen,
    PaidAmountEditScreen,
    DistributorHome,
} from '../screens/cashierScreens';
import {
    CollectionClientListScreen,
    CollectionClientPaidCompletedListScreen,
    CollectionHistoryScreen,
    CollectionHomeScreen,
    CollectionPaidAmountEditScreen,
    CollectionPaidCompletedListScreen,
    CollectionTodayAmountScreen,
} from '../screens/collectionScreens';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../redux/slices/authSlice';
import { getFromStorage, removeFromStorage, saveToStorage } from '../utils/mmkvStorage';
import { Screen } from 'react-native-screens';
import { Badge } from "react-native-paper";
import axios from 'axios';
import { API_HOST } from "@env";
// import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const Navigators = () => {

    const { isAuthenticated, role, user } = useSelector((state) => state.auth);// Role and auth state from Redux
    // const userName = user?.name || 'User';
    // console.log(user);

    const dispatch = useDispatch();

    useEffect(() => {
        const checkLoginStatus = async () => {
            const userData = await getFromStorage('users'); // Fetch user data from storage
            if (userData) {
                dispatch(loginSuccess({ user: userData, role: userData.role })); // Set auth state
            }
        };

        checkLoginStatus();
    }, [dispatch]);


    return (
        <>
            {/* <Toast /> */}
            <NavigationContainer>
                <Stack.Navigator
                // initialRouteName={isAuthenticated ? 'DrawerNavigation' : 'Login'} // Dynamically set the initial route
                // screenOptions={{ headerShown: false, }}
                >
                    <Stack.Screen
                        name='Splash'
                        component={SplashScreen}
                        options={{ headerShown: false }}
                    />
                    {!isAuthenticated ? (
                        <>
                            <Stack.Screen
                                name='Login'
                                component={LoginScreen}
                                options={{ headerShown: false }}
                            />
                        </>
                    ) : (
                        <Stack.Screen name='DrawerNavigation'
                            options={{ headerShown: false }}
                            component={
                                role === 'Collection Manager' || role === 'Admin'
                                    ? () => <CollectionManagerDrawerNavigation />
                                    : () => <CollectionAgentDrawerNavigation />
                            }
                        />
                    )}

                    {/* Conditionally render this screen only for Collection Managers */}
                    {(role === 'Collection Manager' || role === 'Admin') && (
                        <>
                            {/* <Stack.Screen
                                name="ManagerDashboard"
                                component={ManagerDashboardScreen}
                                options={{ title: 'Manager Dashboard' }}
                            /> */}
                            <Stack.Screen
                                name="SingleManagerDetails"
                                component={SingleManagerDetailsScreen}
                                options={{ title: 'Single Employee Details' }}
                            />
                            <Stack.Screen
                                name="SingleEmployeeDetails"
                                component={SingleEmployeeDetailsScreen}
                                // options={{ title: 'Collection Lists' }}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name='SingleClientDetails'
                                component={SingleClientDetailsScreen}
                                // options={{ title: 'Collection Details' }}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name='SingleClientPaidCompletedList'
                                component={SingleClientPaidCompletedListScreen}
                                options={{ title: 'Single Client Full Paid Details' }}
                            />
                            <Stack.Screen
                                name='AddNewClient'
                                component={AddNewClientScreen}
                                options={{ title: 'Add New Client', }}
                            />
                            <Stack.Screen
                                name='SingleClientView'
                                component={SingleClientViewScreen}
                                options={{ title: 'Single Client View', }}
                            />
                            <Stack.Screen
                                name='UpdateClient'
                                component={UpdateClientScreen}
                                options={{ title: 'Update Client', }}
                            />
                            <Stack.Screen
                                name='AddNewEmployee'
                                component={AddNewEmployeeScreen}
                                options={{ title: 'Add New Employee', }}
                            />
                            <Stack.Screen
                                name='UpdateEmployee'
                                component={UpdateEmployeeScreen}
                                options={{ title: 'Update Employee', }}
                            />
                            <Stack.Screen
                                name='SendClientsToAgents'
                                component={SendClientsToAgentsScreen}
                                options={{ title: 'Assign Employee', }}
                            />
                            <Stack.Screen
                                name='SingleClientPaymentList'
                                component={SingleClientPaymentListScreen}
                                options={{ title: 'Single Client Payment List', }}
                            />
                            <Stack.Screen
                                name='SingleEmployeeClientList'
                                component={SingleEmployeeClientListScreen}
                                options={{ title: 'Single Employee Client List', }}
                            />
                            <Stack.Screen
                                name='PaidAmountEditList'
                                component={PaidAmountEditScreen}
                                options={{ title: 'Paid Amount Edit List', }}
                            />
                        </>
                    )}

                    {/* Conditionally render this screen only for Collection Agents */}
                    {role === 'Collection Agent' && (
                        <>
                            <Stack.Screen
                                name="CollectionClientPaidCompletedList"
                                component={CollectionClientPaidCompletedListScreen}
                                options={{ title: 'Client Full Paid Details' }}
                            />
                            <Stack.Screen
                                name='CollectionPaidAmountEditList'
                                component={CollectionPaidAmountEditScreen}
                                options={{ title: 'Paid Amount Edit List', }}
                            />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </>
    )
}

// Drawer for Collection Manager
const CollectionManagerDrawerNavigation = ({ role, }) => {


    return (
        <Drawer.Navigator
            screenOptions={({ navigation }) => ({
                // headerRight: () => (
                //     <TouchableOpacity
                //         onPress={() => alert('Notifications')}
                //         // onPress={handleNotificationPress}
                //         style={{ marginRight: 15 }}>
                //         <View>
                //             <MaterialCommunityIcons
                //                 name="bell-outline"
                //                 size={30}
                //                 color={Colors.DEFAULT_LIGHT_BLUE}
                //             />
                //         </View>
                //     </TouchableOpacity>
                // ),
                drawerStyle: {
                    backgroundColor: Colors.DEFAULT_WHITE,
                    width: 320,
                },
            })}
            initialRouteName="ManagerDashboard"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen
                options={{ headerTitle: 'Dashboard', }}
                name="ManagerDashboard"
                component={ManagerDashboardScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Home', }}
                name="Home"
                component={HomeScreen}
            // initialParams={{ clearNotifications: () => setNotificationCount(0) }}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Collection List', }}
                name="CollectionList"
                component={CollectionListScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'History', }}
                name="History"
                component={HistoryScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Today Collection Amount', }}
                name="TodayCollectionAmount"
                component={TodayCollectionAmountScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Paid Completed List', }}
                name="PaidCompletedList"
                component={PaidCompletedListScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Employees List', }}
                name="ManagerList"
                component={ManagerListScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Distributor & Agent Client List', }}
                name="EmployeeList"
                component={EmployeeListScreen}
            />
            <Drawer.Screen
                options={{ title: 'Distributor Home', }}
                name='DistributorClientHome'
                component={DistributorHome}
            />
        </Drawer.Navigator>
    )
};


// Drawer for Collection Agent
// const CollectionAgentDrawerNavigation = () => {

//     const [notificationCount, setNotificationCount] = useState(0);
//     const [agentloginUserData, setAgentLoginUserData] = useState(null);
//     const [unpaidClientIds, setUnpaidClientIds] = useState([]);
//     const [seenUnpaidClientIds, setSeenUnpaidClientIds] = useState([]);

//     const navigation = useNavigation();
//     // console.log('---------', unpaidClientIds);
//     // console.log('++++++++++', seenUnpaidClientIds);


//     const axiosInstance = axios.create({
//         baseURL: API_HOST,
//         timeout: 5000, // Set timeout to 5 seconds
//     });


//     const fetchGetAgentLoginUserData = async () => {
//         try {
//             const data = await getFromStorage('users');
//             // console.log('010101', data);
//             const agentLoginUserID = data?.userID;
//             // console.log('101010',agentLoginUserID);
//             setAgentLoginUserData(agentLoginUserID);
//         } catch (error) {
//             console.error('Error fetching user data:', error);
//         }
//     }

//     const fetchNotifications = async () => {
//         if (!agentloginUserData) {
//             // console.error('Agent login user data is missing');
//             console.log('agentloginUserData:', agentloginUserData);
//             return;
//         }

//         // setLoading(true);
//         try {
//             // const response = await axios.get(`${API_HOST}/fetchUserlistIDS/${agentloginUserData}`);
//             const response = await axiosInstance.get(`/fetchUserlistIDS/${agentloginUserData}`);

//             // Log the full response to verify if CombinedData is populated
//             // console.log('API Response:', response.data);

//             const combinedData = response.data?.clientdata?.CombinedData || [];
//             // console.log('CombinedData:', combinedData);

//             const collectionsList = combinedData.flatMap(user => user.collections || []);
//             // console.log('Collections List:', collectionsList);

//             // Filter unpaid clients
//             const unpaidClientsList = collectionsList.filter(
//                 (item) => item.paid_and_unpaid !== 1
//             );

//             // setNotificationCount(unpaidClientsList.length);
//             // console.log('00000000000', unpaidClientsList.length);

//             const currentUnpaidIds = unpaidClientsList.map((item) => item.client_id);

//             // Find only NEW unpaid client IDs
//             const newUnpaidClients = currentUnpaidIds.filter((id) => !seenUnpaidClientIds.includes(id));

//             setUnpaidClientIds(currentUnpaidIds);
//             setNotificationCount(newUnpaidClients.length);


//         } catch (error) {
//             console.error('Error fetching clients data:', error.message);
//             if (error.response) {
//                 console.error('Response data:', error.response.data);
//                 console.error('Response status:', error.response.status);
//             }
//         }
//     }


//     const fetchSeenUnpaidClientIds = async () => {
//         try {
//             const storedIds = await getFromStorage('seenUnpaidClientIds');
//             if (storedIds) {
//                 setSeenUnpaidClientIds(storedIds);
//             }
//         } catch (error) {
//             console.error('Error fetching seen unpaid client IDs:', error);
//         }
//     }


//     const handleNotificationPress = () => {
//         if (currentRouteName === 'CollectionHome') {
//             navigation.setParams({ refresh: true });
//             console.log('hhhhhhhhhhh', currentRouteName);
//         } else {
//             navigation.navigate('DrawerNavigation', { screen: 'CollectionHome' }, { refresh: true });
//         }
//         setNotificationCount(0);
//         saveToStorage('seenUnpaidClientIds', unpaidClientIds);
//         setSeenUnpaidClientIds(unpaidClientIds);
//     };


//     // Get the current route name using useNavigationState
//     const currentRouteName = useNavigationState((state) => {
//         const drawerRoute = state.routes[state.index];

//         // Check if the nested navigator (like Stack or other screens) has its own state
//         if (drawerRoute.state) {
//             const nestedRoute = drawerRoute.state.routes[drawerRoute.state.index];
//             return nestedRoute.name;
//         }

//         return drawerRoute.name;
//     });


//     useFocusEffect(
//         useCallback(() => {
//             const fetchData = async () => {
//                 await fetchGetAgentLoginUserData();
//                 await fetchSeenUnpaidClientIds();   // Load seen IDs from storage
//                 fetchNotifications();
//             };
//             fetchData();

//             const interval = setInterval(fetchNotifications, 30000); // Refresh every 1 min

//             return () => clearInterval(interval); // Cleanup on unmount

//         }, [agentloginUserData, seenUnpaidClientIds])
//     )


//     return (
//         <Drawer.Navigator
//             screenOptions={({ navigation }) => ({
//                 headerRight: () => (
//                     <TouchableOpacity
//                         // onPress={() => alert('Notifications')}
//                         onPress={handleNotificationPress}
//                         style={{ marginRight: 15 }}>
//                         <View>
//                             <MaterialCommunityIcons
//                                 name="bell-outline"
//                                 size={30}
//                                 color={Colors.DEFAULT_LIGHT_BLUE}
//                             />
//                             {notificationCount > 0 && (
//                                 <Badge
//                                     style={{
//                                         position: 'absolute',
//                                         top: -5,
//                                         right: -5,
//                                         backgroundColor: 'red',
//                                         color: 'white',
//                                         fontSize: 12,
//                                         minWidth: 20,
//                                         height: 20,
//                                         textAlign: 'center',
//                                     }}
//                                 >
//                                     {notificationCount > 99 ? '99+' : notificationCount}
//                                 </Badge>
//                             )}
//                         </View>
//                     </TouchableOpacity>
//                 ),
//                 drawerStyle: {
//                     backgroundColor: Colors.DEFAULT_WHITE,
//                     width: 320,
//                 },
//             })}
//             initialRouteName="CollectionHome"
//             drawerContent={(props) => <CustomDrawerContent {...props} />}
//         >
//             {/* <Drawer.Screen name="Demo" component={Demo} /> */}
//             <Drawer.Screen
//                 options={{ headerTitle: 'Home', }}
//                 name='CollectionHome'
//                 component={CollectionHomeScreen}
//             />
//             <Drawer.Screen
//                 options={{ headerTitle: 'Collection List', }}
//                 name='CollectionClientList'
//                 component={CollectionClientListScreen}
//             />
//             <Drawer.Screen
//                 options={{ headerTitle: 'Today Collection Amount', }}
//                 name='CollectionTodayAmount'
//                 component={CollectionTodayAmountScreen}
//             />
//             <Drawer.Screen
//                 options={{ headerTitle: 'History', }}
//                 name='CollectionHistory'
//                 component={CollectionHistoryScreen}
//             />
//             <Drawer.Screen
//                 options={{ headerTitle: 'Paid Completed List', }}
//                 name='CollectionPaidCompletedList'
//                 component={CollectionPaidCompletedListScreen}
//             />
//         </Drawer.Navigator>
//     )
// };

const CollectionAgentDrawerNavigation = () => {

    const [notificationCount, setNotificationCount] = useState(0);
    const [agentloginUserData, setAgentLoginUserData] = useState(null);
    const [unpaidClientIds, setUnpaidClientIds] = useState([]);
    const [seenUnpaidClientIds, setSeenUnpaidClientIds] = useState([]);

    const navigation = useNavigation();

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000,
    });

    const fetchGetAgentLoginUserData = async () => {
        try {
            const data = await getFromStorage('users');
            const agentLoginUserID = data?.userID;
            setAgentLoginUserData(agentLoginUserID);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    const fetchNotifications = async () => {
        if (!agentloginUserData) {
            return;
        }
        try {
            const response = await axiosInstance.get(`/fetchUserlistID/${agentloginUserData}`);
            const combinedData = response.data?.clientdata?.CombinedData || [];
            const collectionsList = combinedData.flatMap(user => user.collections || []);

            const unpaidClientsList = collectionsList.filter(
                (item) => item.paid_and_unpaid !== 1
            );

            const currentUnpaidIds = unpaidClientsList.map((item) => item.client_id);

            setUnpaidClientIds(currentUnpaidIds);

            setSeenUnpaidClientIds((prevSeenUnpaidClientIds) => {
                const newUnpaidClients = currentUnpaidIds.filter(
                    (id) => !prevSeenUnpaidClientIds.includes(id)
                );
                setNotificationCount(newUnpaidClients.length);
                return prevSeenUnpaidClientIds;
            });

        } catch (error) {
            console.error('Error fetching clients data:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
        }
    }

    const fetchSeenUnpaidClientIds = async () => {
        try {
            const storedIds = await getFromStorage('seenUnpaidClientIds');
            if (storedIds) {
                setSeenUnpaidClientIds(storedIds);
            }
        } catch (error) {
            console.error('Error fetching seen unpaid client IDs:', error);
        }
    }

    const handleNotificationPress = async () => {
        if (currentRouteName === 'CollectionHome') {
            navigation.setParams({ refresh: true });
        } else {
            navigation.navigate('DrawerNavigation', { screen: 'CollectionHome' }, { refresh: true });
        }
        setNotificationCount(0);
        const updatedSeenIds = unpaidClientIds;
        setSeenUnpaidClientIds(updatedSeenIds);
        await saveToStorage('seenUnpaidClientIds', updatedSeenIds);
    };

    const currentRouteName = useNavigationState((state) => {
        const drawerRoute = state.routes[state.index];
        if (drawerRoute.state) {
            const nestedRoute = drawerRoute.state.routes[drawerRoute.state.index];
            return nestedRoute.name;
        }
        return drawerRoute.name;
    });

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                await fetchGetAgentLoginUserData();
                await fetchSeenUnpaidClientIds();
                fetchNotifications();
            };
            fetchData();

            const interval = setInterval(fetchNotifications, 10000);

            return () => clearInterval(interval);

        }, [agentloginUserData, seenUnpaidClientIds])
    )

    return (
        <Drawer.Navigator
            screenOptions={({ navigation }) => ({
                // headerRight: () => (
                //     <TouchableOpacity
                //         onPress={handleNotificationPress}
                //         style={{ marginRight: 15 }}>
                //         <View>
                //             <MaterialCommunityIcons
                //                 name="bell-outline"
                //                 size={30}
                //                 color={Colors.DEFAULT_LIGHT_BLUE}
                //             />
                //             {notificationCount > 0 && (
                //                 <Badge
                //                     style={{
                //                         position: 'absolute',
                //                         top: -5,
                //                         right: -5,
                //                         backgroundColor: 'red',
                //                         color: 'white',
                //                         fontSize: 12,
                //                         minWidth: 20,
                //                         height: 20,
                //                         textAlign: 'center',
                //                     }}
                //                 >
                //                     {notificationCount > 99 ? '99+' : notificationCount}
                //                 </Badge>
                //             )}
                //         </View>
                //     </TouchableOpacity>
                // ),
                drawerStyle: {
                    backgroundColor: Colors.DEFAULT_WHITE,
                    width: 320,
                },
            })}
            initialRouteName="CollectionHome"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen
                options={{ headerTitle: 'Home', }}
                name='CollectionHome'
                component={CollectionHomeScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Collection List', }}
                name='CollectionClientList'
                component={CollectionClientListScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Today Collection Amount', }}
                name='CollectionTodayAmount'
                component={CollectionTodayAmountScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'History', }}
                name='CollectionHistory'
                component={CollectionHistoryScreen}
            />
            <Drawer.Screen
                options={{ headerTitle: 'Paid Completed List', }}
                name='CollectionPaidCompletedList'
                component={CollectionPaidCompletedListScreen}
            />
        </Drawer.Navigator>
    )
};



const CustomDrawerContent = (props) => {

    const { routeNames, index } = props.state;
    const focused = routeNames[index];
    const { role } = props; // Access the role from props



    const [loginUserData, setLoginUserData] = useState(null);
    const dispatch = useDispatch();
    const navigattion = useNavigation()


    const fetchGetLoginUserData = async () => {
        const data = await getFromStorage('users');
        console.log('3333333', data);
        setLoginUserData(data);
    }

    useFocusEffect(
        useCallback(() => {
            fetchGetLoginUserData();
        }, [])
    )
    // console.log('rol----------------------s', loginUserData);


    const handleLogout = async () => {
        try {
            // Clear the user data from storage
            removeFromStorage('users');
            removeFromStorage('token');

            // Dispatch the logout action to reset Redux state
            dispatch(logout());

            // Reset navigation stack to Login screen
            navigattion.navigate('Login');  // Ensure this is correctly targeting the Login screen
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // console.log('Navigation props:', props.navigation);


    return (
        <>
            <DrawerContentScrollView {...props}>
                <View style={styles.loginContainer}>
                    <Image source={Images.MAN} resizeMode="contain" style={styles.image} />
                    <View style={styles.loginTextContainer}>
                        <Text numberOfLines={1} style={styles.loginTextName}>{loginUserData?.name || 'Guest Name'}</Text>
                        <Text style={styles.loginTextRole}>{loginUserData?.role || 'Guest Role'}</Text>
                        {/* <Text numberOfLines={1} style={styles.loginTextName}>{user?.username || 'Guest'}</Text>
                        <Text style={styles.loginTextRole}>{role}</Text> */}
                    </View>
                </View>

                {(loginUserData?.role == 'Collection Manager' || loginUserData?.role == 'Admin') && (
                    <>
                        {/* {console.log("ggggggggggggggggggggggg")} */}
                        <DrawerItem
                            label={'Dashboard'}
                            onPress={() => {
                                props.navigation.navigate('ManagerDashboard')
                            }}
                            icon={() =>
                                <MaterialIcons
                                    name="space-dashboard"
                                    size={22}
                                    color={focused === 'ManagerDashboard' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'ManagerDashboard'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Client Home'}
                            onPress={() => {
                                props.navigation.navigate('Home')
                            }}
                            icon={() =>
                                <Ionicons
                                    name="home"
                                    size={22}
                                    color={focused === 'Home' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'Home'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Distributor Home'}
                            onPress={() => {
                                props.navigation.navigate('DistributorClientHome')
                            }}
                            icon={() =>
                                <MaterialCommunityIcons
                                    name="nature-people"
                                    size={22}
                                    color={focused === 'DistributorClientHome' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'DistributorClientHome'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Collection List'}
                            onPress={() => {
                                props.navigation.navigate('CollectionList')
                            }}
                            icon={() =>
                                <MaterialIcons
                                    name="collections-bookmark"
                                    size={22}
                                    color={focused === 'CollectionList' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'CollectionList'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Today Collection Amount'}
                            onPress={() => {
                                props.navigation.navigate('TodayCollectionAmount')
                            }}
                            icon={() =>
                                <Fontisto
                                    name="money-symbol"
                                    size={22}
                                    color={focused === 'TodayCollectionAmount' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'TodayCollectionAmount'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Paid Completed List'}
                            onPress={() => {
                                props.navigation.navigate('PaidCompletedList')
                            }}
                            icon={() =>
                                <MaterialIcons
                                    name="paid"
                                    size={22}
                                    color={focused === 'PaidCompletedList' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'PaidCompletedList'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Employees List'}
                            onPress={() => {
                                props.navigation.navigate('ManagerList')
                            }}
                            icon={() =>
                                <Foundation
                                    name="torsos-all"
                                    size={22}
                                    color={focused === 'ManagerList' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'ManagerList'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Distributor & Agent Clients'}
                            onPress={() => {
                                props.navigation.navigate('EmployeeList')
                            }}
                            icon={() =>
                                <MaterialIcons
                                    name="people-alt"
                                    size={22}
                                    color={focused === 'EmployeeList' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'EmployeeList'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'History'}
                            onPress={() => {
                                props.navigation.navigate('History')
                            }}
                            icon={() =>
                                <FontAwesome
                                    name="history"
                                    size={22}
                                    color={focused === 'History' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'History'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                    </>
                )}

                {loginUserData?.role === 'Collection Agent' && (
                    <>
                        <DrawerItem
                            label={'Home'}
                            onPress={() => {
                                props.navigation.navigate('CollectionHome')
                            }}
                            icon={() =>
                                <Ionicons
                                    name="home"
                                    size={20}
                                    color={focused === 'CollectionHome' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'CollectionHome'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Collection List'}
                            onPress={() => {
                                props.navigation.navigate('CollectionClientList')
                            }}
                            icon={() =>
                                <MaterialIcons
                                    name="collections-bookmark"
                                    size={20}
                                    color={focused === 'CollectionClientList' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'CollectionClientList'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        <DrawerItem
                            label={'Today Collection Amount'}
                            onPress={() => {
                                props.navigation.navigate('CollectionTodayAmount')
                            }}
                            icon={() =>
                                <Fontisto
                                    name="money-symbol"
                                    size={20}
                                    color={focused === 'CollectionTodayAmount' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'CollectionTodayAmount'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                        {/* <DrawerItem
                            label={'Paid Completed List'}
                            onPress={() => {
                                props.navigation.navigate('CollectionPaidCompletedList')
                            }}
                            icon={() =>
                                <MaterialIcons
                                    name="paid"
                                    size={20}
                                    color={focused === 'CollectionPaidCompletedList' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'CollectionPaidCompletedList'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem> */}
                        <DrawerItem
                            label={'History'}
                            onPress={() => {
                                props.navigation.navigate('CollectionHistory')
                            }}
                            icon={() =>
                                <FontAwesome
                                    name="history"
                                    size={20}
                                    color={focused === 'CollectionHistory' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                                />
                            }
                            focused={focused === 'CollectionHistory'}
                            activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                            // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                            activeTintColor={Colors.DEFAULT_WHITE}
                            inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                            labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                        >
                        </DrawerItem>
                    </>
                )}

                <DrawerItem
                    label={'Logout'}
                    onPress={handleLogout}
                    icon={() =>
                        <MaterialCommunityIcons
                            name="logout"
                            size={20}
                            color={focused === 'logout' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
                        />
                    }
                    focused={focused === 'logout'}
                    activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
                    // inactiveBackgroundColor={Colors.DEFAULT_LIGHT_GRAY}
                    activeTintColor={Colors.DEFAULT_WHITE}
                    inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
                    labelStyle={{ fontSize: 15, marginLeft: 10, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}
                >
                </DrawerItem>
                {/* Access specific keys */}
                {/* {loginUserData && (
                    <View style={{ padding: 10 }}>
                        <Text>User Data:</Text>
                        <Text>{JSON.stringify(loginUserData.userID, null, 2)}</Text>
                        <Text>{JSON.stringify(loginUserData.name, null, 2)}</Text>
                        <Text>{JSON.stringify(loginUserData.email, null, 2)}</Text>
                        <Text>{JSON.stringify(loginUserData.role, null, 2)}</Text>
                    </View>
                )} */}
            </DrawerContentScrollView>
        </>
    );
};

export default Navigators

const styles = StyleSheet.create({
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: Display.setWidth(75),
        marginVertical: 10,
        paddingVertical: 10,
        // borderWidth: 1,
    },
    loginTextContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        // borderWidth:1
    },
    loginTextName: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        // textAlign: 'center',
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_LIGHT_BLUE,
        textTransform: 'capitalize'
        // marginBottom: 10
    },
    loginTextRole: {
        fontSize: 14,
        lineHeight: 14 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_RED,
    },
    image: {
        width: Display.setWidth(20),
        height: Display.setHeight(7),
    }
})


// ================//
// 🔹 Handle bell icon click: navigate to Home & reset badge
// const handleNotificationPress = () => {
//     setNotificationCount(0); // Clear badge
//     navigation.navigate('DrawerNavigation', { screen: 'Home' }); // Always navigate to Home
// };





// =======================================//
// const [unpaidClientIds, setUnpaidClientIds] = useState([]);
// const [seenUnpaidClientIds, setSeenUnpaidClientIds] = useState([]);
// const navigation = useNavigation();
// console.log('---------', unpaidClientIds);
// console.log('++++++++++', seenUnpaidClientIds);



// const axiosInstance = axios.create({
//     baseURL: API_HOST,
//     timeout: 5000, // Set timeout to 5 seconds
// });


// const fetchNotifications = async () => {
//     try {
//         // Retrieve the token from storage
//         const storedToken = await getFromStorage('token');
//         // console.log('Retrieved token:', storedToken);

//         if (!storedToken) {
//             console.error('No token found in storage.');
//             return;
//         }

//         const authorization = storedToken; // Use the token as-is or modify if required
//         // console.log('Authorization header:', authorization);

//         // setLoading(true);


//         // Axios GET request
//         // const response = await axios.get(`${API_HOST}/acc_list`, {
//         const response = await axiosInstance.get('/acc_list', {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': authorization, // Include the token in the Authorization header
//             },
//         });

//         // Filter unpaid clients
//         const unpaidClientsList = response.data.filter(
//             (item) => item.paid_and_unpaid !== 1 /*|| item.sent === 0*/
//         );


//         // const count = unpaidClientsList.length;
//         // setNotificationCount(unpaidClientsList.length)
//         // console.log('========:', unpaidClientsList.length);


//         const currentUnpaidIds = unpaidClientsList.map((item) => item.client_id);

//         // Find only NEW unpaid client IDs
//         const newUnpaidClients = currentUnpaidIds.filter((id) => !seenUnpaidClientIds.includes(id));

//         setUnpaidClientIds(currentUnpaidIds);
//         setNotificationCount(newUnpaidClients.length);

//         // navigation.navigate('DrawerNavigation', { screen: 'Home' });

//     } catch (error) {
//         // Handle errors
//         if (error.response) {
//             console.error("Error fetching notifications:", error);
//             if (error.response.status === 401) {
//                 console.error('Token might be invalid or expired. Redirecting to login...');
//                 // Redirect to login or request a new token
//             }
//         } else {
//             console.error('Fetch error:', error.message);
//         }
//     } finally {
//         // setLoading(false); // Set loading to false once the request is complete
//     }
// };


// // Get the current route name using useNavigationState
// const currentRouteName = useNavigationState((state) => {
//     const drawerRoute = state.routes[state.index];

//     // Check if the nested navigator (like Stack or other screens) has its own state
//     if (drawerRoute.state) {
//         const nestedRoute = drawerRoute.state.routes[drawerRoute.state.index];
//         return nestedRoute.name;
//     }

//     return drawerRoute.name;
// });

// // console.log('------', seenUnpaidClientIds);

// const handleNotificationPress = () => {
//     if (currentRouteName === 'Home') {
//         navigation.setParams({ refresh: true });
//     } else {
//         navigation.navigate('DrawerNavigation', { screen: 'Home' }, { refresh: true });
//     }
//     setSeenUnpaidClientIds(unpaidClientIds);
//     setNotificationCount(0);
// };


// // 🔹 Auto-refresh badge count every 1 minute
// useEffect(() => {
//     fetchNotifications(); // Initial fetch
//     const interval = setInterval(fetchNotifications, 30000); // Refresh every 1 min

//     return () => clearInterval(interval); // Cleanup on unmount
// }, [seenUnpaidClientIds]);
