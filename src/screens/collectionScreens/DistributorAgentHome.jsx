import { ActivityIndicator, Alert, BackHandler, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Colors, Fonts } from '../../constants';
import { Display } from '../../utils';
import { Separator } from '../../components';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import SearchInput from "react-native-search-filter";
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { getFromStorage, saveToStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import moment from 'moment';


const DistributorAgentHome = () => {

    const [singleAgentclientsData, setSingleAgentClientsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState([]);
    const [distributorList, setDistributorList] = useState([]);
    const [agentloginUserData, setAgentLoginUserData] = useState(null);
    const [distributorNameShow, setDistributorNameShow] = useState([]);


    const currentDate = moment().format('DD-MM-YYYY');

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


    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    const distributorNameListShowing = async () => {
        try {
            const storedToken = await getFromStorage('token');

            if (!storedToken) {
                console.error('No token found in storage.');
                return;
            }

            const authorization = storedToken;
            setLoading(true);

            const response = await axiosInstance.get('/collection/getamount', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization,
                },
            });

            const allDistributorCollections = response.data;
            // console.log('data', response.data);

            // Filter matches with collectionList
            const matchedCollections = singleAgentclientsData.map(client => {
                return allDistributorCollections.find(entry =>
                    String(entry.Distributor_id) === String(client.Distributor_id) &&
                    // String(entry.colldate) === String(client.date) &&    
                    String(entry.today_rate) === String(client.today_rate)
                );
            }).filter(Boolean); // remove undefined entries

            setDistributorNameShow(matchedCollections);
            console.log('Matched collections:', matchedCollections);

        } catch (error) {
            if (error.response) {
                console.error('API response error:', error.response.data);
                if (error.response.status === 401) {
                    console.error('Token might be invalid or expired. Redirecting to login...');
                }
            } else {
                console.error('Fetch error:', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    // Fetch employees data
    const fetchEmployeesData = async () => {
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
            // const response = await axios.get(`${API_HOST}/list`, {
            const response = await axiosInstance.get('/list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            //Distributor Data 
            const distributors = response.data.filter((item) =>
                item.role === "Distributor"
            );

            setDistributorList(distributors);
            // console.log(response.data);
            // console.log('8888888', distributorList);

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


    const fetchGetAgentLoginUserData = async () => {
        try {
            const data = await getFromStorage('users');
            // console.log('010101', data);
            const agentLoginUserID = data?.userID;
            // console.log('101010',agentLoginUserID);
            setAgentLoginUserData(agentLoginUserID);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    const fetchClientsData = async () => {
        if (!agentloginUserData) {
            // console.error('Agent login user data is missing');
            console.log('agentloginUserData:', agentloginUserData);
            return;
        }

        setLoading(true);
        try {
            // const response = await axios.get(`${API_HOST}/fetchUserlistIDS/${agentloginUserData}`);
            const response = await axiosInstance.get(`/fetchUserlistID/${agentloginUserData}`);

            // Log the full response to verify if CombinedData is populated
            // console.log('API Response:', response.data);

            const combinedData = response.data?.clientdata?.CombinedData || [];
            // console.log('CombinedData:', combinedData);

            const collectionsList = combinedData.flatMap(user => user.collections || []);
            // console.log('Collections List:', collectionsList);

            const currentDate = moment().format('DD-MM-YYYY');

            // Filter unpaid clients
            const unpaidClientsList = collectionsList.filter(
                (item) => /*item.paid_and_unpaid !== 1 &&*/ item.assigned_date === currentDate
            );

            // setSingleAgentClientsData(unpaidClientsList);
            setSingleAgentClientsData(unpaidClientsList);
            // console.log('00000000000', unpaidClientsList);

        } catch (error) {
            console.error('Error fetching clients data:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
        } finally {
            setLoading(false);
        }
    }


    const getUniqueDistributors = () => {
        const distributorMap = new Map();

        distributorNameShow.forEach((item) => {
            const id = item.Distributor_id;
            const collAmountStr = item.collamount?.[0] || "0";
            const collAmount = parseFloat(collAmountStr);

            if (distributorMap.has(id)) {
                const existing = distributorMap.get(id);

                // Only add if the amount is different
                if (!existing.collSet.has(collAmountStr)) {
                    existing.totalAmount += collAmount;
                    existing.collSet.add(collAmountStr);
                }
            } else {
                // Create new entry with a Set to track seen amounts
                distributorMap.set(id, {
                    ...item,
                    totalAmount: collAmount,
                    collSet: new Set([collAmountStr])
                });
            }
        });

        // Finalize output: convert to array and format
        return Array.from(distributorMap.values()).map(distributor => ({
            ...distributor,
            collamount: [distributor.totalAmount.toFixed(3)],
        }));
    };

    const uniqueDistributors = getUniqueDistributors();
    // console.log('uniqueDistributors', uniqueDistributors);

    const searchUniqueDistributors = uniqueDistributors.filter((item) => {
        const distributorName = distributorList.find(
            (dis) => dis.user_id === item.Distributor_id
        )?.username?.toLowerCase() || '';

        return distributorName.includes(searchText.toLowerCase());
    });

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                await fetchGetAgentLoginUserData();
                fetchClientsData();
                fetchEmployeesData();
                distributorNameListShowing();
            };
            fetchData();

            // Reset the search text whenever the screen gains focus
            setSearchText('');
        }, [agentloginUserData])
    )

    useEffect(() => {
        if (singleAgentclientsData.length > 0) {
            distributorNameListShowing();
        }
    }, [singleAgentclientsData]);

    const onPressClearTextEntry = () => {
        // console.log('Remove');
        setSearchText('');
    }


    const renderItem = ({ item, index }) => {

        const distributorName = distributorList.find((dis) => dis.user_id === item.Distributor_id)?.username || 'Not Found';

        return (
            <View style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
                <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{distributorName}</Text>
                <Text style={[styles.cell, { flex: 3 }]}>₹ {item.collamount?.[0]}</Text>
                <View style={[styles.buttonContainer, { flex: 2 }]}>
                    <TouchableOpacity
                        style={styles.updateButton}
                        // onPress={() => handlePressPaidAmount(item)}
                        activeOpacity={0.8}
                    >
                        <Feather
                            name="edit"
                            size={15}
                            color={Colors.DEFAULT_LIGHT_WHITE}
                        />
                        <Text style={[
                            styles.cell,
                            {
                                fontSize: 12,
                                lineHeight: 12 * 1.4,
                                textTransform: 'uppercase',
                                color: Colors.DEFAULT_LIGHT_WHITE,
                            }
                        ]}>Paid</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <Text style={styles.titleText}>Today CollectionList : {currentDate}</Text>

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
                        placeholder="Search"
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

            <View style={styles.header}>
                <Text style={[styles.heading, { flex: 1 }]}>No</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Name</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Total</Text>
                <Text style={[styles.heading, { flex: 2 }]}>Paid</Text>
            </View>

            {loading ? (
                <ActivityIndicator
                    size='large'
                    color={Colors.DEFAULT_DARK_BLUE}
                    style={{ marginTop: 20, }}
                />
            ) : searchUniqueDistributors.length > 0 ? (
                <FlatList
                    data={searchUniqueDistributors}
                    keyExtractor={
                        (item, index) =>
                            `${item.Distributor_id}-${item.colldate}-${item.today_rate}-${index}`
                    }
                    renderItem={renderItem}
                />
            ) : (
                <Text style={styles.emptyText}>No matching collection list found page!</Text>
            )}

        </View>
    )
}

export default DistributorAgentHome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    titleText: {
        marginHorizontal: 15,
        marginTop: 10,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        paddingVertical: 10,
        paddingHorizontal: 20,
        color: Colors.DEFAULT_LIGHT_WHITE,
        fontSize: 15,
        lineHeight: 15 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        borderRadius: 8
    },
    inputContainer: {
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        borderRadius: 50,
        borderColor: Colors.DEFAULT_BLACK,
        // elevation: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        justifyContent: 'center',
        marginTop: 10,
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 10,
        borderColor: Colors.DEFAULT_LIGHT_BLUE,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 8
    },
    heading: {
        flex: 1,
        fontFamily: Fonts.POPPINS_MEDIUM,  // Change to the correct font if needed
        fontSize: 18,
        lineHeight: 18 * 1.4,
        textAlign: 'center',
        color: Colors.DEFAULT_WHITE,
    },
    emptyText: {
        fontSize: 16,
        lineHeight: 16 * 1.4,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        marginVertical: 10,
        color: Colors.DEFAULT_DARK_RED
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        marginHorizontal: 10,
        elevation: 1,
        borderRadius: 8,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        padding: 10
    },
    cell: {
        flex: 1,
        fontSize: 14,
        lineHeight: 14 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.DEFAULT_GREEN,
        padding: 10,
        borderRadius: 25
    },
})