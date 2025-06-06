import { ActivityIndicator, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors, Fonts } from '../../constants';
import { Separator } from '../../components';
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Display } from '../../utils';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import SearchInput from "react-native-search-filter";
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import { Dropdown } from 'react-native-element-dropdown';

const DistributorHome = () => {

    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [distributorList, setDistributorList] = useState([]);
    const [currentDateClientsData, setCurrentDateClientsData] = useState([]);
    // console.log('today orders ', distributorList);
    const [longPressSelectedItems, setLongPressSelectedItems] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    console.log('longPressSelectedItems', longPressSelectedItems);
    const [agentList, setAgentList] = useState([]);
    const [isFocus, setIsFocus] = useState(false);
    const [agentAssign, setAgentAssign] = useState('');
    const [selectedClientTotalCount, setSelectedClientTotalCount] = useState(0);
    const [selectedClientIds, setSelectedClientIds] = useState([]);
    console.log('selectedClientIds', selectedClientIds);

    const isAgentAssignButtonDisabled = !agentAssign;

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });

    // // Fetch Client data
    // const fetchClientsData = async () => {
    //     try {
    //         const today = new Date();
    //         const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    //         // Retrieve the token from storage
    //         const storedToken = await getFromStorage('token');
    //         // console.log('Retrieved token:', storedToken);

    //         if (!storedToken) {
    //             console.error('No token found in storage.');
    //             return;
    //         }

    //         const authorization = storedToken; // Use the token as-is or modify if required
    //         // console.log('Authorization header:', authorization);

    //         // Axios GET request
    //         // const response = await axios.get(`${API_HOST}/acc_list`, {
    //         const response = await axiosInstance.get('/acc_list', {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': authorization, // Include the token in the Authorization header
    //             },
    //         });

    //         // Filter unpaid clients
    //         const currentDateClients = response.data.filter(
    //             (item) => item.paid_and_unpaid !== 1 && item.date === formattedDate/*|| item.sent === 0*/
    //         );

    //         setCurrentDateClientsData(currentDateClients); // Set the filtered data to state
    //         // console.log('Fetched clients:', currentDateClients);
    //     } catch (error) {
    //         // Handle errors
    //         if (error.response) {
    //             console.error('API response error:', error.response.data);
    //             if (error.response.status === 401) {
    //                 console.error('Token might be invalid or expired. Redirecting to login...');
    //                 // Redirect to login or request a new token
    //             }
    //         } else {
    //             console.error('Fetch error:', error.message);
    //         }
    //     }
    // };

    // const fetchDistributorList = async () => {
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

    //         setLoading(true);

    //         // Axios GET request
    //         // const response = await axios.get(`${API_HOST}/list`, {
    //         const response = await axiosInstance.get('/list', {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': authorization, // Include the token in the Authorization header
    //             },
    //         });

    //         const distributorList = response.data.filter((item) => item.role === "Distributor");

    //         const filteredDistributors = distributorList.map(distributor => {
    //             const matchingClients = currentDateClientsData.filter(client => client.Distributor_id === distributor.user_id);
    //             return {
    //                 ...distributor,
    //                 clients: matchingClients,
    //             };
    //         }).filter(distributor => distributor.clients.length > 0); // Only keep distributors with matching clients

    //         setDistributorList(filteredDistributors);
    //         // console.log('filteredDistributors', filteredDistributors);

    //     } catch (error) {
    //         // Handle errors
    //         if (error.response) {
    //             console.error('API response error:', error.response.data);
    //             if (error.response.status === 401) {
    //                 console.error('Token might be invalid or expired. Redirecting to login...');
    //                 // Redirect to login or request a new token
    //             }
    //         } else {
    //             console.error('Fetch error:', error.message);
    //         }
    //     } finally {
    //         setLoading(false); // Set loading to false once the request is complete
    //     }
    // }

    // useFocusEffect(
    //     useCallback(() => {
    //         const fetchData = async () => {
    //             await fetchClientsData(); // wait for clients data to be fetched and state updated
    //             await fetchDistributorList(); // now fetch distributor list using updated clients data
    //         };

    //         fetchData();
    //         setSearchText('');
    //     }, [])
    // );


    const fetchClientsData = async () => {
        try {
            const today = new Date();
            const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

            const storedToken = await getFromStorage('token');
            if (!storedToken) {
                console.error('No token found in storage.');
                return [];
            }

            const response = await axiosInstance.get('/acc_list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': storedToken,
                },
            });

            const currentDateClients = response.data.filter(
                (item) => item.paid_and_unpaid !== 1 && item.date === formattedDate
            );

            return currentDateClients;
        } catch (error) {
            console.error('Fetch error:', error.message);
            return [];
        }
    };

    const fetchDistributorList = async (clientsData) => {
        try {
            const storedToken = await getFromStorage('token');
            if (!storedToken) {
                console.error('No token found in storage.');
                return;
            }

            setLoading(true);

            const response = await axiosInstance.get('/list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': storedToken,
                },
            });

            const distributors = response.data.filter(item => item.role === "Distributor");

            const filteredDistributors = distributors.map(distributor => {
                const matchingClients = clientsData.filter(client => client.Distributor_id === distributor.user_id);
                return {
                    ...distributor,
                    clients: matchingClients,
                };
            }).filter(distributor => distributor.clients.length > 0);

            const agents = response.data
                .filter((item) => item.role === "Collection Agent")
                .map((item) => ({
                    label: item.username,
                    value: item.user_id,
                }));

            setAgentList(agents);
            setDistributorList(filteredDistributors);
        } catch (error) {
            console.error('Fetch error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                const clients = await fetchClientsData();
                setCurrentDateClientsData(clients); // optional, if used elsewhere
                await fetchDistributorList(clients);
            };

            fetchData();
            setSearchText('');
            // setAgentAssign('');
        }, [])
    );


    const onPressClearTextEntry = () => {
        // console.log('Remove');
        setSearchText('');
    }

    const toggleLongPressSelection = (distributorID) => {
        setSelectionMode(true);
        setLongPressSelectedItems([distributorID]);
    }

    const toggleCheckboxSelection = (distributorID) => {
        setLongPressSelectedItems((prev) => {
            if (prev.includes(distributorID)) {
                return prev.filter((id) => id !== distributorID);
            } else {
                return [...prev, distributorID];
            }
        })
    }

    const toggleSelectAll = () => {
        if (longPressSelectedItems.length === distributorList.length) {
            setLongPressSelectedItems([]);
        } else {
            const allDistributorsIds = distributorList.map(item => item.user_id);
            setLongPressSelectedItems(allDistributorsIds);
        }
    }

    const cancelSelection = () => {
        setSelectionMode(false);
        setLongPressSelectedItems([]);
    }


    useEffect(() => {
        const clientsWithNoUser = longPressSelectedItems
            .map(id => distributorList.find(d => d.user_id === id))
            .filter(Boolean)
            .flatMap(distributor =>
                distributor.clients?.filter(client => client.user_id === null).map(client => client.client_id) || []
            );

        setSelectedClientIds(clientsWithNoUser);
        setSelectedClientTotalCount(clientsWithNoUser.length);
    }, [longPressSelectedItems, distributorList]);


    const multipleDistributorClientsSingleAgentAssigned = async () => {

        if (longPressSelectedItems.length === 0) {
            Toast.show({
                type: 'error',
                text1: `You have not selected any distributors yet!`
            });
            return; // ✅ Exit early
        }

        // Search all clients from distributorList and check if any selected client has today_rate <= 0
        const allClients = distributorList.flatMap(distributor => distributor.clients);

        const hasRate = selectedClientIds.some(id => {
            const client = allClients.find(c => c.client_id === id);
            return client?.today_rate <= 0;
        });

        if (hasRate) {
            Toast.show({
                type: 'error',
                text1: `If you set a today rate, you can't assign it to any agent!`
            });
            return;
        }

        try {
            const today = new Date();
            const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

            const payload = selectedClientIds.map(clientId => ({
                client_id: clientId,
                user_id: agentAssign,
                sent: true,
                assigned_date: formattedDate
            }));
            console.log('6666666', payload);

            const response = await axiosInstance.post(`/client_IDupdateds`, payload);
            console.log('6666666', response.data);

            Toast.show({
                type: 'success',
                text1: 'Assign Employee Successfully!',
                // text2: 'This is some something 👋'
            });

        } catch (error) {
            console.error('Error updating client:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to assign clients',
                text2: error.response?.data?.message || 'Something went wrong!',
            });
        }
    }

    const searchFilteredData = distributorList.filter(
        (item) =>
            item.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchText.toLowerCase())
    )

    const renderItem = ({ item, index }) => {
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

        const isTodayOrder = item.today_rate_date === formattedDate;
        const rateToShow = isTodayOrder ? item.Distributor_today_rate : '0';

        const isSelected = longPressSelectedItems.includes(item.user_id);

        return (
            <TouchableOpacity
                onLongPress={() => toggleLongPressSelection(item.user_id)}
                onPress={() => selectionMode && toggleCheckboxSelection(item.user_id)}
                activeOpacity={0.8}
            >
                <View style={[styles.row, isSelected && { backgroundColor: '#e6f7ff' }]}>
                    <View style={[styles.cell, { flex: 1, flexDirection: 'row', alignItems: 'center', /*borderWidth: 1*/ }]}>
                        {selectionMode ? (
                            <Ionicons
                                name={isSelected ? 'checkbox-outline' : 'square-outline'}
                                size={18}
                                color="green"
                                style={{ marginRight: 4, marginLeft: 10 }}
                            />
                        ) : (
                            <View style={{ width: 25 }} />
                        )}
                        <Text style={{ fontSize: 14, lineHeight: 14 * 1.4, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{item.username}</Text>
                    <Text style={[styles.cell, { flex: 1.5 }]}>{rateToShow}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{item.clients.length}</Text>
                    {/* <Text style={[styles.cell, { flex: 1 }]}>{item.clients?.length ?? 0}</Text> */}
                    {/* <View style={[styles.buttonContainer, { flex: 1.5 }]}>
                    <TouchableOpacity
                        style={styles.updateButton}
                        // onPress={() => handlePressUpdate(item)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="eye"
                            size={15}
                            color={Colors.DEFAULT_BLACK}
                        />
                        <Text style={[
                            styles.cell,
                            {
                                fontSize: 12,
                                lineHeight: 12 * 1.4,
                                textTransform: 'uppercase',
                                color: Colors.DEFAULT_BLACK,
                            }
                        ]}>View</Text>
                    </TouchableOpacity>
                </View> */}
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

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

            {selectionMode && (
                <>
                    <View style={styles.agentAssignContainer}>
                        <View style={[styles.dropdownWrapper, isFocus && { zIndex: 1000 }]}>
                            {/* <Text style={styles.updateClientDetailHeading}>Assign Employee:</Text> */}
                            <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: Colors.DEFAULT_LIGHT_BLUE }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                // containerStyle={{ marginTop: 0 }}
                                data={agentList}
                                search
                                searchPlaceholder="Search..."
                                labelField="label"
                                valueField="value"
                                placeholder={!agentAssign ? "Assign Employee" : ""}
                                maxHeight={250}
                                value={agentAssign}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={item => {
                                    // console.log('Selected:', item.value);
                                    setAgentAssign(item.value);
                                    setIsFocus(false);
                                }}
                                renderLeftIcon={() => (
                                    <AntDesign
                                        name="Safety"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_BLUE}
                                        style={{ marginRight: 5, }}
                                    />
                                )}
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.assignButton,
                                isAgentAssignButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                            ]}
                            onPress={multipleDistributorClientsSingleAgentAssigned}
                            disabled={isAgentAssignButtonDisabled}
                        >
                            <Text style={styles.assignButtonText}>Assign</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.selectedContainer}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={cancelSelection} activeOpacity={0.8}>
                            <Ionicons
                                name="close"
                                size={30}
                                color={Colors.DEFAULT_BLACK}
                            // style={{ marginRight: 10 }}
                            />
                        </TouchableOpacity>
                        <Text style={styles.selectedCountText}>{selectedClientTotalCount} Selected Client</Text>
                        {/* <Text style={styles.selectedCountText}>
                            {longPressSelectedItems
                                .map(id => distributorList.find(d => d.user_id === id))
                                .filter(Boolean)
                                // .reduce((total, distributor) => total + distributor.clients.length, 0)
                                .reduce((total, distributor) => {
                                    const count = distributor.clients?.filter(client => client.user_id === null).length || 0;
                                    return total + count;
                                }, 0)
                            } Selected Client
                        </Text> */}
                        <TouchableOpacity
                            style={[
                                styles.selectButton,
                                {
                                    backgroundColor:
                                        longPressSelectedItems.length === distributorList.length
                                            ? Colors.DEFAULT_DARK_RED
                                            : Colors.DEFAULT_LIGHT_BLUE
                                },
                            ]}
                            onPress={toggleSelectAll}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.selectButtonText}>{longPressSelectedItems.length === distributorList.length ? 'Deselect All' : 'Select All'}</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <View style={styles.header}>
                <Text style={[styles.heading, { flex: 1 }]}>No</Text>
                <Text style={[styles.heading, { flex: 2 }]}>Distributor</Text>
                <Text style={[styles.heading, { flex: 1.5 }]}>Today Rate</Text>
                <Text style={[styles.heading, { flex: 1 }]}>Order</Text>
                {/* <Text style={[styles.heading, { flex: 1.5 }]}>Details</Text> */}
            </View>

            {/* Data Loading and Display */}
            {loading ? (
                <ActivityIndicator
                    size='large'
                    color={Colors.DEFAULT_DARK_BLUE}
                    style={{ marginTop: 20, }}
                />
            ) : searchFilteredData.length === 0 ? (
                <Text style={styles.emptyText}>No Orders Today!</Text>
            ) : (
                <FlatList
                    data={searchFilteredData}
                    keyExtractor={(item) => item.user_id?.toString()}
                    renderItem={renderItem}
                />
            )}

        </View>
    )
}

export default DistributorHome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    inputContainer: {
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        borderRadius: 50,
        borderWidth: 0.5,
        borderColor: Colors.DEFAULT_BLACK,
        elevation: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        justifyContent: 'center',
        marginTop: 20,
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
    inputText: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        letterSpacing: 1,
        textAlignVertical: 'center',
        paddingVertical: 0,
        height: Display.setHeight(6),
        color: Colors.DEFAULT_BLACK,
        flex: 1,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        paddingTop: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        marginHorizontal: 10,
        marginTop: 20,
        marginBottom: 10,
        borderColor: Colors.DEFAULT_LIGHT_BLUE,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 8
    },
    heading: {
        flex: 1,
        fontFamily: Fonts.POPPINS_MEDIUM,  // Change to the correct font if needed
        fontSize: 17,
        lineHeight: 17 * 1.4,
        textAlign: 'center',
        color: Colors.DEFAULT_WHITE,
    },
    emptyText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
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
        fontSize: 15,
        lineHeight: 15 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEEC37',
        padding: 10,
        borderRadius: 25
    },
    selectedContainer: {
        flexDirection: 'row',
        // justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: 15,
        paddingVertical: 3,
        marginTop: 5,
        // borderWidth: 1
    },
    selectedCountText: {
        flex: 5,
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_REGULAR,
    },
    selectButton: {
        flex: 2.5,
        // backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 8,
    },
    selectButtonText: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE,
        padding: 8,
    },
    agentAssignContainer: {
        // borderWidth:1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 20

    },
    dropdown: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        borderRadius: 8,
        paddingHorizontal: 12,
        width: Display.setWidth(60),
        height: Display.setHeight(6),
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        elevation: 2,
        // padding:10
    },
    placeholderStyle: {
        fontFamily: Fonts.POPPINS_MEDIUM,
        fontSize: 16,
        lineHeight: 16 * 1.4,
        color: Colors.DEFAULT_DARK_BLUE
    },
    selectedTextStyle: {
        fontFamily: Fonts.POPPINS_MEDIUM,
        fontSize: 16,
        lineHeight: 16 * 1.4,
        color: Colors.DEFAULT_BLACK
    },
    inputSearchStyle: {
        fontFamily: Fonts.POPPINS_MEDIUM,
        fontSize: 16,
        lineHeight: 16 * 1.4,
        color: Colors.DEFAULT_DARK_BLUE
    },
    iconStyle: {
        width: Display.setWidth(5),
        height: Display.setHeight(3),
    },
    assignButton: {
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
        marginVertical: 20,
        borderRadius: 30
    },
    buttonEnabled: {
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
    },
    buttonDisabled: {
        backgroundColor: Colors.DEFAULT_DARK_GRAY,
    },
    assignButtonText: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_WHITE,
        textAlign: 'center',
        padding: 10,
    }
})