import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, TouchableOpacity, ScrollView, BackHandler, Alert, FlatList, Modal, TextInput, ActivityIndicator } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { Colors, Fonts } from '../../constants';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Fontisto from 'react-native-vector-icons/Fontisto'
import Foundation from 'react-native-vector-icons/Foundation'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'//Ionicons
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { Display } from '../../utils';
import axios from 'axios';
import { getFromStorage, saveToStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import Toast from 'react-native-toast-message';
import SearchInput from 'react-native-search-filter';

const ManagerDashboardScreen = ({ navigation }) => {

    const [clientsData, setClientsData] = useState([]);
    const [paidClientsData, setPaidClientsData] = useState([]);
    const [unpaidClientsData, setUnpaidClientsData] = useState([]);
    const [totals, setTotals] = useState({ overall: 0, paid: 0, unpaid: 0 });
    // const [adminData, setAdminData] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [agentData, setAgentData] = useState([]);
    const [loginUserData, setLoginUserData] = useState(null);
    // console.log('loginUserData', loginUserData);
    const [todayRateModalVisiable, setTodayRateModalVisiable] = useState(false);
    const [selectedItem, setSelectedItem] = useState([]);
    const [assignTodayRate, setAssignTodayRate] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");


    const fetchGetLoginUserData = async () => {
        try {
            const data = await getFromStorage('users');
            // console.log('22222', data);
            setLoginUserData(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }


    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });

    // Fetch employees data
    const fetchEmployeesData = async () => {
        try {
            setLoading(true);

            // Retrieve the token from storage
            const storedToken = await getFromStorage('token');
            // console.log('Retrieved token:', storedToken);

            if (!storedToken) {
                console.error('No token found in storage.');
                return;
            }

            const authorization = storedToken; // Use the token as-is or modify if required
            // console.log('Authorization header:', authorization);

            // setLoading(true);
            // Axios GET request
            // const response = await axios.get(`${API_HOST}/list`, {
            const response = await axiosInstance.get('/list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            //  //Admin Data 
            //  const adminList = response.data.filter((item) =>
            //     item.role === "Admin"
            // );
            // setAdminData(adminList);

            //Manager Data 
            const managerList = response.data.filter((item) =>
                item.role === "Collection Manager"
            );
            setEmployeesData(response.data);

            //Agent Data 
            const agentList = response.data.filter((item) =>
                item.role === "Collection Agent"
            );

            //Agent Data 
            const distributorList = response.data.filter((item) =>
                item.role === "Distributor"
            );

            setAgentData([...agentList, ...distributorList]);
            // console.log(response.data);
            // console.log('8888888', agentData);
        } catch (error) {
            // Handle errors
            if (error.response) {
                console.error('API response error:', error.response.data);
                if (error.response.status === 401) {
                    console.error('Token might be invalid or expired. Redirecting to login...');
                    // Redirect to login or request a new token
                }
            } else {
                console.error('Fetch error:', error.message);
            }
        }
        finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        // Calculate totals
        let overallAmount = 0;
        let totalPaidAmount = 0;

        clientsData.forEach((client) => {
            // Add the client's overall amount (if available)
            const clientAmount = parseFloat(client.amount || 0);
            overallAmount += clientAmount;

            // Add the paid amounts (if available)
            if (Array.isArray(client.paid_amount_date)) {
                client.paid_amount_date.forEach((payment) => {
                    totalPaidAmount += parseFloat(payment.amount || 0);
                });
            }
        });

        const unpaidAmount = overallAmount - totalPaidAmount;

        setTotals({
            overall: overallAmount.toFixed(2),
            paid: totalPaidAmount.toFixed(2),
            unpaid: unpaidAmount.toFixed(2),
        });
    }, [clientsData]);


    const fetchClientsData = async () => {
        try {
            // Retrieve the token from storage
            const storedToken = await getFromStorage('token');
            // console.log('Retrieved token:', storedToken);

            if (!storedToken) {
                console.error('No token found in storage.');
                return;
            }

            const authorization = storedToken; // Use the token as-is or modify if required
            // console.log('Authorization header:', authorization);

            // Axios GET request
            // const response = await axios.get(`${API_HOST}/acc_list`, {
            const response = await axiosInstance.get('/acc_list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            setClientsData(response.data);
            // console.log(response.data);

            //paid clients data
            const paidClientsDataList = response.data.filter((item) =>
                item.paid_and_unpaid === 1
            );
            setPaidClientsData(paidClientsDataList);
            // console.log('555555',paidClientsDataList);

            //unpaid clients data
            const unpaidClientsDataList = response.data.filter((item) =>
                item.paid_and_unpaid === 0
            );
            setUnpaidClientsData(unpaidClientsDataList);
            // console.log('555555',unpaidClientsDataList);

        } catch (error) {
            // Handle errors
            if (error.response) {
                console.error('API response error:', error.response.data);
                if (error.response.status === 401) {
                    console.error('Token might be invalid or expired. Redirecting to login...');
                    // Redirect to login or request a new token
                }
            } else {
                console.error('Fetch error:', error.message);
            }
        }
    }

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                await fetchGetLoginUserData();
                fetchClientsData();
                fetchEmployeesData();
            };
            fetchData();
        }, [agentData]) //agentData
    )

    const screenWidth = Dimensions.get("window").width;

    // Animated values for progress
    const animatedValues = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

    const [progressData, setProgressData] = useState([0, 0, 0]);

    const chartConfig = {
        backgroundGradientFrom: Colors.DEFAULT_LIGHT_BLUE,
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: Colors.DEFAULT_DARK_BLUE,
        backgroundGradientToOpacity: 0.2,
        // color: (opacity = 1) => `rgba(30, 80, 177, ${opacity})`,
        // color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
        // strokeWidth: 2, // optional, default 3
        color: (opacity = 1, index) => {
            if (index === 0) return `rgba(6, 208, 1, ${opacity})`; // DEFAULT_GREEN for 'Paid'
            if (index === 1) return `rgba(251, 101, 102, ${opacity})`; // DEFAULT_DARK_RED for 'Unpaid'
            return `rgba(18, 70, 172, ${opacity})`; // DEFAULT_DARK_BLUE for 'Overall'
        },
        strokeWidth: 16, // Adjust thickness
        barPercentage: 0.5,
        useShadowColorFromDataset: false, // optional
    };

    const data = {
        labels: ['Paid', 'Unpaid', 'Overall'],
        data: progressData,
        colors: [Colors.DEFAULT_GREEN, Colors.DEFAULT_DARK_RED, Colors.DEFAULT_DARK_BLUE],
    };

    useFocusEffect(
        useCallback(() => {
            const overallAmount = parseFloat(totals.overall) || 0;
            const paidAmount = parseFloat(totals.paid) || 0;
            const unpaidAmount = parseFloat(totals.unpaid) || 0;

            const paidProportion = overallAmount > 0 ? paidAmount / overallAmount : 0;
            const unpaidProportion = overallAmount > 0 ? unpaidAmount / overallAmount : 0;
            const overallProportion = 1;

            const targetValues = [paidProportion, unpaidProportion, overallProportion];

            const animations = animatedValues.map((anim, index) =>
                Animated.timing(anim, {
                    toValue: targetValues[index],
                    duration: 2000,
                    useNativeDriver: false,
                })
            );

            Animated.parallel(animations).start();

            animatedValues.forEach((anim, index) => {
                anim.addListener(({ value }) => {
                    setProgressData((prevData) => {
                        const updatedData = [...prevData];
                        updatedData[index] = value;
                        return updatedData;
                    });
                });
            });

            return () => {
                animatedValues.forEach((anim) => anim.removeAllListeners());
            };
        }, [totals])
    );

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


    const localTotalAmount = clientsData.reduce((sum, client) => {
        if (client.amount && client.today_rate) {
            return sum + (client.amount / client.today_rate);
        }
        return sum;
    }, 0);

    // console.log('localTotalAmount', localTotalAmount.toFixed(3));

    const localPaidAmount = clientsData.reduce((sum, client) => {
        if (client.paid_amount_date && client.today_rate) {
            const clientTotal = client.paid_amount_date.reduce((clientSum, payment) => {
                return clientSum + (payment.amount / client.today_rate);
            }, 0);
            return sum + clientTotal;
        }
        return sum;
    }, 0);

    // console.log('Total Converted Amount:', localPaidAmount);


    const localUnPaidAmount = localTotalAmount - localPaidAmount;


    const handleTodayRateAssigned = async () => {

        try {
            if (!selectedItem?.user_id) {
                console.error("Error: user_id is undefined or null");
                return;
            }

            const today = new Date();
            const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

            const todayRateSet = {
                user_id: selectedItem.user_id,
                today_rate_date: currentDate,
                Distributor_today_rate: assignTodayRate,
            }
            // const todayRateSet = [{
            //     user_id: selectedItem.user_id,
            //     today_rate_date: currentDate,
            //     Distributor_today_rate: assignTodayRate,
            // }]; // ✅ Wrap inside an array

            console.log("Sending data:", todayRateSet);

            const response = await axiosInstance.put(`/update-distributor-amount/${selectedItem.user_id}`, todayRateSet);
            // const response = await axiosInstance.post(`/update-distributor-amount`, todayRateSet);
            // { headers: { 'Content-Type': 'application/json' } }

            Toast.show({
                type: 'success',
                text1: 'Today Rate Assign Successfully!',
                position: 'top',
            });

            setTodayRateModalVisiable(false);

            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
        }
    }

    const closeAssignTodayRateModal = () => {
        setAssignTodayRate('');
        setTodayRateModalVisiable(false);
    }


    // const handleClickDistributor = (item) => {
    //     setSelectedItem(item);
    //     setTodayRateModalVisiable(true);
    //     console.log(item);
    // }

    const handleClickDistributor = (item) => {
        const today = new Date();
        // const currentDate = today.toISOString().split('T')[0]; // "2025-03-13"
        const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
            .toString().padStart(2, '0')}-${today.getFullYear()}`; // "19-03-2025"

        // Extract the date part from today's rate date
        // const distributorDate = item.today_rate_date ? item.today_rate_date.split('T')[0] : null;
        const distributorDate = item.today_rate_date ? item.today_rate_date : null;


        // Set initial rate only if date matches
        let initialRate = distributorDate === currentDate && item.Distributor_today_rate !== null
            ? parseFloat(item.Distributor_today_rate).toString()
            : "0";
        // let initialRate = distributorDate === currentDate && item.Distributor_today_rate
        //     ? parseFloat(item.Distributor_today_rate).toFixed(2)
        //     : "0";

        console.log('initial Rate', initialRate);

        setAssignTodayRate(initialRate);
        setSelectedItem(item);
        console.log(item);
        setTodayRateModalVisiable(true);
    };


    const isConfirmButtonDisabled = !assignTodayRate;


    const onPressClearTextEntry = () => {
        // console.log('Remove');
        setSearchText('');
    }

    // const searchAgentData = agentData.filter((item) => {
    //     const searchTextLower = searchText.toLowerCase();
    //     const isMatchingSearch =
    //         item.username?.toLowerCase().includes(searchTextLower) ||
    //         item.phone_number?.toLowerCase().includes(searchText);

    //     return isMatchingSearch;
    // })

    const searchAgentData = useMemo(() => {
        const searchTextLower = searchText.toLowerCase();
        return agentData.filter((item) =>
            item.username?.toLowerCase().includes(searchTextLower) ||
            item.phone_number?.toLowerCase().includes(searchText)
        );
    }, [searchText, agentData]); // Dependencies: only recalculate when these change


    useEffect(() => {
        setSearchText('');
    }, []);


    return (
        <View style={styles.container}>

            <ScrollView style={{ flex: 1 }}>
                <Text style={styles.title}>HCC</Text>
                <ProgressChart
                    data={data}
                    width={screenWidth}
                    height={220}
                    strokeWidth={16}
                    radius={32}
                    chartConfig={chartConfig}
                    hideLegend={false}
                />

                <ScrollView horizontal>
                    <View style={[styles.dashboard, {
                        height: loginUserData?.role === "Admin"
                            ? Display.setHeight(25)
                            : Display.setHeight(50)
                    }]}>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Home')}>
                            <View style={styles.dashboardDetails}>
                                <FontAwesome
                                    name="money"
                                    size={40}
                                    color={Colors.DEFAULT_LIGHT_BLUE}
                                    style={{ marginBottom: 10 }}
                                />
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.kuwait}>inter   : </Text>
                                    <Text style={styles.amount} numberOfLines={1}> {totals.overall}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.kuwait}>local : </Text>
                                    <Text style={styles.amount} numberOfLines={1}> {localTotalAmount.toFixed(3)}</Text>
                                </View>
                                <Text style={styles.heading}>OverAll Total Amount</Text>
                            </View >
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Home')}>
                            <View style={styles.dashboardDetails}>
                                <FontAwesome
                                    name="sort-amount-desc"
                                    size={40}
                                    color={Colors.DEFAULT_GREEN}
                                    style={{ marginBottom: 10 }}
                                />
                                {/* <Text style={styles.amount}>{totals.paid}</Text>
                            <Text style={styles.kuwait}>KWD</Text> */}
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.kuwait}>inter   : </Text>
                                    <Text style={styles.amount} numberOfLines={1}> {totals.paid}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.kuwait}>local : </Text>
                                    <Text style={styles.amount} numberOfLines={1}> {localPaidAmount.toFixed(3)}</Text>
                                </View>
                                <Text style={styles.heading}>Paid Amount</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Home')}>
                            <View style={styles.dashboardDetails}>
                                <FontAwesome
                                    name="sort-amount-asc"
                                    size={40}
                                    color={Colors.DEFAULT_DARK_RED}
                                    style={{ marginBottom: 10 }}
                                />
                                {/* <Text style={styles.amount}>{totals.unpaid}</Text>
                            <Text style={styles.kuwait}>KWD</Text> */}
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.kuwait}>inter   : </Text>
                                    <Text style={styles.amount} numberOfLines={1}> {totals.unpaid}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.kuwait}>local : </Text>
                                    <Text style={styles.amount} numberOfLines={1}> {localUnPaidAmount.toFixed(3)}</Text>
                                </View>
                                <Text style={styles.heading}>UnPaid Amount</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Home')}>
                            <View style={styles.dashboardDetails}>
                                <MaterialCommunityIcons
                                    name="nature-people"
                                    size={40}
                                    color={Colors.DEFAULT_LIGHT_BLUE}
                                    style={{ marginBottom: 10 }}
                                />
                                <Text style={styles.amount}>{clientsData.length === 0 ? 0 : clientsData.length}</Text>
                                <Text style={styles.heading}>Clients</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('PaidCompletedList')}>
                            <View style={styles.dashboardDetails}>
                                <FontAwesome
                                    name="group"
                                    size={40}
                                    color={Colors.DEFAULT_GREEN}
                                    style={{ marginBottom: 10 }}
                                />
                                <Text style={styles.amount}>{paidClientsData.length === 0 ? 0 : paidClientsData.length}</Text>
                                <Text style={styles.heading}>Paid Clients</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('CollectionList')}>
                            <View style={styles.dashboardDetails}>
                                <Fontisto
                                    name="persons"
                                    size={40}
                                    color={Colors.DEFAULT_DARK_RED}
                                    style={{ marginBottom: 10 }}
                                />
                                <Text style={styles.amount}>{unpaidClientsData.length === 0 ? 0 : unpaidClientsData.length}</Text>
                                <Text style={styles.heading}>Unpaid Clients</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ManagerList')}>
                            <View style={styles.dashboardDetails}>
                                <Foundation
                                    name='torsos-all'
                                    size={40}
                                    color={Colors.DEFAULT_DARK_RED}
                                    style={{ marginBottom: 10 }}
                                />
                                <Text style={styles.amount}>{employeesData.length === 0 ? 0 : employeesData.length}</Text>
                                <Text style={styles.heading}>Employees</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('EmployeeList')}>
                            <View style={styles.dashboardDetails}>
                                <MaterialIcons
                                    name="people-alt"
                                    size={40}
                                    color={Colors.DEFAULT_GREEN}
                                    style={{ marginBottom: 10 }}
                                />
                                <Text style={styles.amount}>{agentData.length === 0 ? 0 : agentData.length}</Text>
                                <Text style={styles.heading}>Agent & Distributor</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* <Text>{loginUserData?.role}</Text> */}


                {loginUserData?.role === "Admin" && (
                    <>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputSubContainer}>
                                <Feather
                                    name="search"
                                    size={20}
                                    color={Colors.DEFAULT_BLACK}
                                    style={{ marginRight: 10 }}
                                />
                                <SearchInput
                                    onChangeText={(text) => setSearchText(text)}
                                    value={searchText}
                                    placeholder="Name or Number"
                                    selectionColor={Colors.DEFAULT_BLACK}
                                    style={styles.searchInput}
                                />
                                {searchText && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={onPressClearTextEntry}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_BLACK}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View>
                            <View style={styles.header}>
                                <Text style={[styles.tableHeading, { flex: 1 }]}>No</Text>
                                <Text style={[styles.tableHeading, { flex: 3 }]}>Distributor Name</Text>
                                <Text style={[styles.tableHeading, { flex: 2 }]}>Today Rate</Text>
                            </View>

                            {/* {loading ? (
                            <ActivityIndicator
                                size='large'
                                color={Colors.DEFAULT_DARK_BLUE}
                                style={{ marginTop: 20, }}
                            />
                        ) : ( */}
                            {searchAgentData
                                .filter(item => item.role === "Distributor")
                                .map((item, index) => (
                                    <View key={item.user_id?.toString()} style={styles.row}>
                                        <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
                                        <Text style={[styles.cell, { flex: 3 }]}>
                                            {item.username}
                                            {"\n"}
                                            <Text style={styles.cityText}>{item.phone_number}</Text>
                                        </Text>
                                        <View style={[styles.buttonContainer, { flex: 2 }]}>
                                            <TouchableOpacity
                                                style={styles.rateButton}
                                                activeOpacity={0.8}
                                                // onPress={() => setTodayRateModalVisiable(true)}
                                                onPress={() => handleClickDistributor(item)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.cell,
                                                        {
                                                            fontSize: 13,
                                                            lineHeight: 13 * 1.4,
                                                            textTransform: "uppercase",
                                                            color: Colors.DEFAULT_LIGHT_WHITE,
                                                        },
                                                    ]}
                                                >
                                                    Today Rate
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                        </View>
                    </>
                )}
            </ScrollView>


            <Modal animationType="slide" transparent={true} visible={todayRateModalVisiable}>
                <View style={styles.passwordModalConatiner}>
                    <View style={styles.passwordModal}>
                        <Text style={styles.deleteModalHeading}>Assign Today Rate</Text>
                        <Text style={styles.modalEmailText}>{selectedItem?.username}</Text>

                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Enter Amount'
                                placeholderTextColor={Colors.DEFAULT_DARK_GRAY}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={assignTodayRate || 0} // Ensure it's a string and default to "0"
                                // onChangeText={setAssignTodayRate}
                                onChangeText={(text) => setAssignTodayRate(text === "" ? "0" : text)} // Reset to 0 when cleared
                            />
                            {assignTodayRate && (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setAssignTodayRate('')}
                                >
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={closeAssignTodayRateModal}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleTodayRateAssigned}
                                disabled={isConfirmButtonDisabled}
                            >
                                <Text style={[styles.passwordText,
                                {
                                    color: isConfirmButtonDisabled
                                        ? Colors.DEFAULT_DARK_GRAY : Colors.DEFAULT_DARK_BLUE
                                }
                                ]}>
                                    Assign
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


export default ManagerDashboardScreen;



const styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        // padding: 10,
    },
    title: {
        fontSize: 24,
        lineHeight: 24 * 1.4,
        fontFamily: Fonts.POPPINS_EXTRA_BOLD,
        marginVertical: 10,
        textAlign: 'center',
        color: Colors.DEFAULT_LIGHT_BLUE
    },
    dashboard: {
        // borderWidth: 1,
        marginVertical: 10,
        marginHorizontal: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        // width:Display.setWidth(40),
        // height: Display.setHeight(50),
        // height: loginUserData?.role === "Admin"
        //     ? Display.setHeight(25)
        //     : Display.setHeight(50), // Default height
    },
    dashboardDetails: {
        padding: 20,
        borderWidth: 3,
        borderColor: Colors.DEFAULT_LIGHT_BLUE,
        width: Display.setWidth(65),
        height: Display.setHeight(22),
        marginVertical: 10,
        // marginHorizontal: 10,
        marginRight: 12,
        borderRadius: 20
    },
    amount: {
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_LIGHT_BLUE,
        marginBottom: 2,
        // textTransform: 'uppercase',
    },
    kuwait: {
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_RED,
        marginBottom: 2,
        textTransform: 'uppercase',
        // borderWidth:1,
        // marginRight:5,
        width: Display.setWidth(16)

    },
    heading: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_BLUE,
        // fontStyle:'normal'
        marginTop: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        marginHorizontal: 10,
        // marginTop: 20,
        marginBottom: 10,
        borderColor: Colors.DEFAULT_LIGHT_BLUE,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 8
    },
    tableHeading: {
        flex: 1,
        fontFamily: Fonts.POPPINS_MEDIUM,  // Change to the correct font if needed
        fontSize: 17,
        lineHeight: 17 * 1.4,
        textAlign: 'center',
        color: Colors.DEFAULT_WHITE,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        marginHorizontal: 10,
        elevation: 1,
        borderRadius: 8,
        borderColor: Colors.DEFAULT_LIGHT_GRAY,
        backgroundColor: Colors.DEFAULT_WHITE,
        padding: 10,
        borderWidth: 1
    },
    cell: {
        flex: 1,
        fontSize: 15,
        lineHeight: 15 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    cityText: {
        fontFamily: Fonts.POPPINS_MEDIUM,
        fontSize: 13,
        lineHeight: 13 * 1.4,
        color: '#8898A9'
    },
    rateButton: {
        // flexDirection: 'row',
        // alignItems: 'center',
        backgroundColor: Colors.DEFAULT_GREEN,
        padding: 10,
        // marginBottom: 8,
        // marginRight: 5,
        borderRadius: 25
    },
    passwordModalConatiner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    passwordModal: {
        margin: 20,
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 20,
        padding: 30,
        // alignItems: 'center',
        width: Display.setWidth(90),
        height: Display.setHeight(35),
        // height: '65%',
        // width: '90%', // Increase the width to 90% of the screen width
        maxWidth: 400, // Set a maxWidth for larger screens
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        // borderWidth: 1,
    },
    textInputContainer: {
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_GRAY,
        flexDirection: 'row',
        alignItems: 'center',
        width: Display.setWidth(75),
        height: Display.setHeight(6),
        marginVertical: 10,
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 8,
    },
    deleteModalHeading: {
        marginBottom: 15,
        fontSize: 22,
        lineHeight: 22 * 1.4,
        fontFamily: Fonts.POPPINS_BOLD,
        color: Colors.DEFAULT_DARK_GRAY,
        textDecorationLine: 'underline'
    },
    modalEmailText: {
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        backgroundColor: Colors.DEFAULT_WHITE,
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_GRAY,
    },
    textInput: {
        // borderWidth: 1,
        width: Display.setWidth(65),
        height: Display.setHeight(6),
        // backgroundColor: Colors.DEFAULT_WHITE,
        // borderColor: Colors.DEFAULT_LIGHT_GRAY,
        // elevation: 3,
        // borderRadius: 8,
        padding: 10,
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_BLUE,
        textTransform: 'none'
    },
    modalButtonContainer: {
        // borderWidth:1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 20,
        marginTop: 5
    },
    cancelText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_REGULAR,
        padding: 10,
        color: Colors.DEFAULT_DARK_GRAY,
    },
    passwordText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        padding: 10,
        color: Colors.DEFAULT_DARK_BLUE,
    },
    inputContainer: {
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        borderRadius: 50,
        borderWidth: 0.5,
        borderColor: Colors.DEFAULT_BLACK,
        elevation: 1,
        borderColor: Colors.DEFAULT_DARK_GRAY,
        justifyContent: 'center',
        marginBottom: 20,
        width: Display.setWidth(92),
        borderWidth: 1
    },
    inputSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        letterSpacing: 1,
        textAlignVertical: 'center',
        paddingVertical: 0,
        height: Display.setHeight(6),
        color: Colors.DEFAULT_BLACK,
        // flex: 1,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        paddingTop: 5,
        width: Display.setWidth(70),
        paddingRight: 15,
        // borderWidth: 1
    },
});



// import { StyleSheet, Text, View, Dimensions } from 'react-native';
// import React from 'react';
// import { ProgressChart } from 'react-native-chart-kit';
// import { Colors } from '../../constants';


// const ManagerDashboardScreen = () => {
//     // Data for the ProgressChart
//     // each value represents a goal ring in Progress chart
//     const data = {
//         labels: ["Swim", "Bike", "Run"], // optional
//         data: [0.4, 0.6, 0.8]
//     };

//     const screenWidth = Dimensions.get("window").width;

//     const chartConfig = {
//         backgroundGradientFrom: "#1E2923",
//         backgroundGradientFromOpacity: 0,
//         backgroundGradientTo: "#08130D",
//         backgroundGradientToOpacity: 0.2,
//         color: (opacity = 1) => `rgba(30, 80, 177, ${opacity})`,
//         strokeWidth: 2, // optional, default 3
//         barPercentage: 0.5,
//         useShadowColorFromDataset: false, // optional
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Progress Chart Example</Text>
//             <ProgressChart
//                 data={data}
//                 width={screenWidth}
//                 height={220}
//                 strokeWidth={16}
//                 radius={32}
//                 chartConfig={chartConfig}
//                 hideLegend={false}
//                 animate // Enables animation
//                 animationConfig={{
//                     duration: 2000, // Animation duration in milliseconds
//                     easing: 'ease-in-out', // Easing type
//                 }}
//             />
//         </View>
//     );
// }

// export default ManagerDashboardScreen

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         // justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: Colors.DEFAULT_WHITE,
//         padding: 10,
//     },
//     title: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginBottom: 20,
//     },
// })



// useFocusEffect(
//     useCallback(() => {
//         // Target progress values
//         const targetValues = [0.4, 0.6, 0.8];

//         // Animate each progress value
//         const animations = animatedValues.map((anim, index) =>
//             Animated.timing(anim, {
//                 toValue: targetValues[index],
//                 duration: 2000, // Animation duration
//                 useNativeDriver: false, // Needed for numerical values
//             })
//         );

//         // Start all animations
//         Animated.parallel(animations).start();

//         // Update progress data dynamically
//         const animatedListener = animatedValues.map((anim, index) =>
//             anim.addListener(({ value }) => {
//                 setProgressData((prevData) => {
//                     const updatedData = [...prevData];
//                     updatedData[index] = value; // Update each data value
//                     return updatedData;
//                 });
//             })
//         );

//         return () => {
//             // Clean up listeners
//             animatedListener.forEach((listener, index) => animatedValues[index].removeListener(listener));
//         };
//     }, [])
// )




// ==================================================================================
{/* <FlatList
                    // data={agentData}
                    data={agentData.filter(item => item.role === "Distributor")}
                    keyExtractor={(item) => item.user_id?.toString()}
                    renderItem={renderItem}
                    nestedScrollEnabled={true} // ✅ Enables smooth scrolling inside ScrollView
                /> */}


// const renderItem = ({ item, index }) => {
//     return (
//         <View style={styles.row}>
//             <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
//             <Text style={[styles.cell, { flex: 3 }]}>
//                 {item.username}
//                 {"\n"}
//                 <Text style={styles.cityText}>{item.phone_number}</Text>
//             </Text>
//             <View style={[styles.buttonContainer, { flex: 2 }]}>
//                 <TouchableOpacity style={styles.rateButton} activeOpacity={0.8}>
//                     <Text style={[
//                         styles.cell,
//                         {
//                             fontSize: 13,
//                             lineHeight: 13 * 1.4,
//                             textTransform: 'uppercase',
//                             color: Colors.DEFAULT_LIGHT_WHITE,
//                         }
//                     ]}>Today Rate</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     )
// }
