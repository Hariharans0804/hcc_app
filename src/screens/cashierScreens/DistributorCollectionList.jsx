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
import { RFValue } from "react-native-responsive-fontsize";
import moment from 'moment';

const DistributorCollectionList = ({ navigation }) => {

    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [collectionList, setCollectionList] = useState([]);
    const [distributorTotalAmount, setDistributorTotalAmount] = useState([]);
    const [distributorColection, setDistributorColection] = useState([]);
    const [distributorList, setDistributorList] = useState([]);
    // console.log('distributorList', distributorList);
    const [selectedItem, setSelectedItem] = useState([]);
    // console.log('selectedItem', selectedItem);
    const [paidModalVisible, setPaidModalVisible] = useState(false);
    const [todayPaidAmountValue, setTodayPaidAmountValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [paidAmountList, setPaidAmountList] = useState([]);
    // console.log('paidAmountList', paidAmountList);



    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });

    const currentDate = moment().format('DD-MM-YYYY');
    //   console.log('currentDate', currentDate);
    const formattedCurrentDate = moment(currentDate, "DD-MM-YYYY").format("YYYY-MM-DD");

    const hasDataForDate = collectionList.some((item) => {
        const formattedItemDate = moment(item.assigned_date, "DD-MM-YYYY").format("YYYY-MM-DD");
        return formattedItemDate === formattedCurrentDate;
    });


    const isUpdateButtonDisabled = !(todayPaidAmountValue);


    const handlePressEnterPaidAmount = async () => {

        // const localRemainingAmount = kuwaitLocalTotalAmount - kuwaitLocalTotalPaidAmount;
        const localRemainingAmount = selectedItem.collamount - local_Total_Paid_Amount;

        const enteredAmount = parseFloat(todayPaidAmountValue);
        const remainingAmount = parseFloat(localRemainingAmount);

        if (todayPaidAmountValue > 0) {

            if (enteredAmount > remainingAmount) {
                setErrorMessage('Entered amount exceeds balance amount!');
                return;
            }

            try {
                const today = new Date();
                const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

                const enterLocalAmountValue = parseFloat((selectedItem.today_rate * todayPaidAmountValue).toFixed(2)) || 0;

                // ✅ Find matching item from collectionList by Distributor_id
                const matchedCollector = collectionList.find(
                    (item) => item.Distributor_id === selectedItem.Distributor_id && item.assigned_date === currentDate
                );

                // console.log('matchedCollector', matchedCollector);

                const agent_id = matchedCollector?.user_id || null;

                const paidAmountEntry = {
                    Distributor_id: parseInt(selectedItem.Distributor_id || 0),
                    paidamount: [parseFloat(todayPaidAmountValue)],
                    colldate: [formattedDate],
                    type: 'paid',
                    today_rate: selectedItem.today_rate,
                    agent_id: agent_id,
                    collection_id: selectedItem.id,
                    collamount: "",
                    distname: "",
                };

                const response = await axiosInstance.post(`/collection/addamount`, paidAmountEntry);
                // console.log('paidAmountEntry', response.data);

                // Reset state and show success message
                setPaidModalVisible(false);
                setTodayPaidAmountValue('');
                Toast.show({
                    type: 'success',
                    text1: 'Distributor Amount Added Successfully!',
                    position: 'top',
                });

                fetchDistributorTotalAmount();
                setErrorMessage('');

            } catch (error) {
                console.error('Error:', error.response?.data || error.message);
                setErrorMessage('Failed to update amount. Please try again.');

                // Show error message
                Toast.show({
                    type: 'error',
                    text1: 'Failed to update amount',
                    text2: error.response?.data?.error || 'Please try again later.',
                    position: 'top',
                });
            }
        } else {
            console.error('Invalid amount value');
            Toast.show({
                type: 'error',
                text1: 'Please enter a valid amount',
                position: 'top',
            });
            setErrorMessage('Invalid amount value!');
        }

    }



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
        finally {
            setLoading(false);
        }
    }


    const fetchDistributorTotalAmount = async () => {
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


            const paidAmountDetails = response.data.filter((item) => item.type === 'paid');
            // console.log('paid data', paidAmountDetails);
            setPaidAmountList(paidAmountDetails);

            const allDistributorCollections = response.data;
            // console.log('data', response.data);
            setDistributorColection(allDistributorCollections);

            // Filter matches with collectionList
            const matchedCollections = collectionList.map(client => {
                return allDistributorCollections.find(entry =>
                    String(entry.Distributor_id) === String(client.Distributor_id) &&
                    // String(entry.colldate) === String(client.date) &&
                    String(entry.today_rate) === String(client.today_rate)
                );
            }).filter(Boolean); // remove undefined entries

            setDistributorTotalAmount(matchedCollections);
            // console.log('Matched collections:', matchedCollections);

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
    };


    const fetchCollectionDataList = async () => {
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

            // setLoading(true);

            const today = new Date();
            const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

            // Axios GET request
            // const response = await axios.get(`${API_HOST}/acc_list`, {
            const response = await axiosInstance.get('/acc_list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            const todayCollectionPaidList = response.data.filter((item) =>
                item.sent === 1 /*&& item.assigned_date === currentDate*/
            );
            setCollectionList(todayCollectionPaidList);
            // console.log('Fetched collection clients:', todayCollectionPaidList);
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
        } finally {
            // setLoading(false);
        }
    }


    // Add this above renderItem
    // const getUniqueDistributors = () => {
    //     const uniqueMap = new Map();

    //     distributorTotalAmount.forEach((item) => {
    //         if (!uniqueMap.has(item.Distributor_id)) {
    //             uniqueMap.set(item.Distributor_id, item);
    //         }
    //     });

    //     return Array.from(uniqueMap.values());
    // };

    // // Use this instead of distributorTotalAmount


    const getUniqueDistributors = () => {
        const distributorMap = new Map();

        distributorTotalAmount.forEach((item) => {
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
            const loadData = async () => {
                setSearchText('');
                await fetchCollectionDataList();
                await fetchDistributorTotalAmount();
                await fetchEmployeesData();
            };
            loadData();
        }, [])
    );


    useEffect(() => {
        if (collectionList.length > 0) {
            fetchDistributorTotalAmount();
        }
    }, [collectionList]);



    const onPressClearTextEntry = () => {
        // console.log('Remove');
        setSearchText('');
    }

    const handleModalClose = () => {
        setPaidModalVisible(false);
        setTodayPaidAmountValue('');
        setErrorMessage('');
    }

    const handlePressPaidAmount = (item) => {
        // console.log('item', item);
        setSelectedItem(item);
        setPaidModalVisible(true);
        setErrorMessage('');
        // // ✅ Find matching item from collectionList by Distributor_id
        // const matchedCollector = collectionList.find(
        //     (i) => i.Distributor_id === item.Distributor_id && i.assigned_date === currentDate
        // );

        // console.log('matchedCollector', matchedCollector);

        // const agent_id = matchedCollector?.user_id || null;
    }

    //  =====================================================================================================\\
    //  =====================================================================================================\\
    //balance remaining amount getting
    const selectedDistributor = distributorList.find(
        (dist) => dist.user_id === selectedItem?.Distributor_id
    );


    // Kuwait Local Total Amount
    const kuwaitLocalTotalAmount = parseFloat((selectedItem.collamount / selectedItem.today_rate).toFixed(3)) || 0;
    // console.log('kuwaitLocalTotalAmount', kuwaitLocalTotalAmount.toFixed(3));


    // const gettingBalanceInterAmount=paidAmountList.find((item)=>item.collection_id===selectedItem.id);

    // Step 1: Find all matching paid records by collection_id
    const matchingPaidRecords = paidAmountList.filter(
        // (entry) => entry.collection_id === selectedItem?.id
        (entry) => entry.Distributor_id === selectedItem?.Distributor_id
    );
    // console.log('matchingPaidRecords', matchingPaidRecords);


    // Step 2: Calculate total paid amount from all matching records
    // International Total Paid Amount
    const interTotalPaidAmount = matchingPaidRecords.reduce((sum, record) => {
        const paid = record.paidamount || [];
        return sum + paid.reduce((a, b) => a + parseFloat(b || 0), 0);
    }, 0);
    // console.log('interTotalPaidAmount', interTotalPaidAmount);

    // Kuwait Local Total Paid Amount
    const kuwaitLocalTotalPaidAmount = parseFloat((interTotalPaidAmount / selectedItem.today_rate).toFixed(3)) || 0;


    // Step 3: Get original collection amount from selectedItem (assumed array or number)
    let collectionAmount = 0;
    if (Array.isArray(selectedItem?.collamount)) {
        collectionAmount = parseFloat(selectedItem.collamount[0] || 0);
    } else {
        collectionAmount = parseFloat(selectedItem?.collamount || 0);
    }

    // Step 4: Final balance calculation
    // International remaining amount
    const balanceInterAmount = (collectionAmount - interTotalPaidAmount).toFixed(2);

    // Kuwait Local remaining amount
    const balanceLocalAmount = selectedItem.today_rate
        ? (balanceInterAmount / selectedItem.today_rate).toFixed(3)
        : "0.000"; // Ensuring a string with 3 decimal places


    //  =====================================================================================================\\
    //  =====================================================================================================\\


    const roundAmount = (amount) => {
        const whole = Math.floor(amount); // Get the integer part
        const decimal = amount - whole; // Get the decimal part

        if (decimal <= 0.49) {
            return whole; // Round down
        } else {
            return whole + 1; // Round up
        }
    };

    const internationalTotalAmount = parseFloat((selectedItem.collamount * selectedItem.today_rate).toFixed(2)) || 0;
    // console.log('internationalTotalAmount',internationalTotalAmount);

    const localTotalPaidAmount = matchingPaidRecords.reduce((sum, record) => {
        const paid = record.paidamount || [];
        return sum + paid.reduce((a, b) => a + parseFloat(b || 0), 0);
    }, 0);
    // console.log('localTotalPaidAmount', localTotalPaidAmount);

    const internationalTotalPaidAmount = parseFloat((localTotalPaidAmount * selectedItem.today_rate).toFixed(2)) || 0;
    // console.log('internationalTotalPaidAmount', internationalTotalPaidAmount);

    const localBalanceAmount = (collectionAmount - localTotalPaidAmount).toFixed(3);
    // console.log('localBalanceAmount', localBalanceAmount);

    const internationalBalanceAmount = selectedItem.today_rate
        ? (localBalanceAmount * selectedItem.today_rate).toFixed(3)
        : "0.000"; // Ensuring a string with 3 decimal places
    // console.log('internationalBalanceAmount', internationalBalanceAmount);

    //  =====================================================================================================\\
    //  =====================================================================================================\\


    const local_Total_Paid_Amount = matchingPaidRecords.reduce((sum, record) => {
        const paid = record.paidamount || [];
        return sum + paid.reduce((a, b) => a + parseFloat(b || 0), 0);
    }, 0);
    // console.log('local_Total_Paid_Amount', local_Total_Paid_Amount);

    const local_Total_Balance_Amount = (collectionAmount - local_Total_Paid_Amount).toFixed(3);
    // console.log('local_Total_Balance_Amount', local_Total_Balance_Amount);


    const renderItem = ({ item, index }) => {

        const distributorName = distributorList.find((dis) => dis.user_id === item.Distributor_id)?.username || 'Not Found';

        // Step 1: Find all matching paid records by collection_id
        const matchingPaidRecords = paidAmountList.filter(
            // (entry) => entry.collection_id === item?.id
            (entry) => entry.Distributor_id === item?.Distributor_id
        );

        // Step 2: Calculate total paid amount from all matching records
        const interTotalPaidAmount = matchingPaidRecords.reduce((sum, record) => {
            const paid = record.paidamount || [];
            return sum + paid.reduce((a, b) => a + parseFloat(b || 0), 0);
        }, 0);

        // Step 3: Get original collection amount from selectedItem (assumed array or number)
        let collectionAmount = 0;
        if (Array.isArray(item?.collamount)) {
            collectionAmount = parseFloat(item.collamount[0] || 0);
        } else {
            collectionAmount = parseFloat(item?.collamount || 0);
        }

        // Step 4: Final balance calculation
        const balanceInterAmount = (collectionAmount - interTotalPaidAmount).toFixed(2);

        const balanceLocalAmount = item.today_rate
            ? (balanceInterAmount / item.today_rate).toFixed(3)
            : "0.000"; // Ensuring a string with 3 decimal places

        const local_Total_Paid_Amount = matchingPaidRecords.reduce((sum, record) => {
            const paid = record.paidamount || [];
            return sum + paid.reduce((a, b) => a + parseFloat(b || 0), 0);
        }, 0);
        // console.log('local_Total_Paid_Amount', local_Total_Paid_Amount);

        const local_Total_Balance_Amount = (collectionAmount - local_Total_Paid_Amount).toFixed(3);
        // console.log('local_Total_Balance_Amount', local_Total_Balance_Amount);

        return (
            <View style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
                <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{distributorName}</Text>
                {/* <Text style={[styles.cell, { flex: 3 }]}>₹ {item.collamount?.[0]}</Text> */}
                {/* <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{Number(item.collamount).toFixed(3)}</Text> */}
                <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{local_Total_Balance_Amount}</Text>
                <View style={[styles.buttonContainer, { flex: 2 }]}>
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={() => handlePressPaidAmount(item)}
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

    };

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

            <View style={styles.header}>
                <Text style={[styles.heading, { flex: 1 }]}>No</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Name</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Total</Text>
                <Text style={[styles.heading, { flex: 2 }]}>Paid</Text>
            </View>


            {collectionList.find((item) => item?.assigned_date === currentDate) ? (
                loading ? (
                    <ActivityIndicator
                        size='large'
                        color={Colors.DEFAULT_DARK_BLUE}
                        style={{ marginTop: 20, }}
                    />
                ) : searchUniqueDistributors.length === 0 ? (
                    <Text style={styles.emptyText}>No matching collection list found page!</Text>
                ) : (
                    <FlatList
                        data={searchUniqueDistributors}
                        keyExtractor={(item, index) =>
                            `${item.Distributor_id}-${item.colldate}-${item.today_rate}-${index}`
                        }
                        renderItem={renderItem}
                    />
                )
            ) : (
                <Text style={styles.emptyText}>No matching collection list found page!</Text>
            )}

            {paidModalVisible && (
                <Modal animationType="slide" transparent={true} visible={paidModalVisible} style={{ zIndex: 1 }}>
                    <View style={styles.updateModalConatiner}>
                        <View style={styles.updateModal}>
                            <TouchableOpacity style={styles.updateModalCloseButton} onPress={handleModalClose}>
                                <AntDesign
                                    name="closecircleo"
                                    size={30}
                                    color={Colors.DEFAULT_WHITE}
                                />
                            </TouchableOpacity>
                            <Text style={styles.updateModalText}>Details</Text>

                            <View style={styles.detailsContainer}>
                                {/* <Text>Distrubutor Id : {selectedItem.Distributor_id}</Text> */}
                                <Text style={styles.detailsText}>Distrubutor Name : {selectedDistributor?.username || 'Not Found'}</Text>
                                <Text style={styles.detailsText}>Mobile : {selectedDistributor?.phone_number || 'Not Found'}</Text>
                                <Text style={styles.detailsText}>Date : {selectedItem.colldate}</Text>
                                {/* <Text style={styles.detailsText}>Total & Inter : {roundAmount(internationalTotalAmount).toFixed(2)}</Text> */}
                                <Text style={styles.detailsText}>Total & Local : {Number(selectedItem.collamount).toFixed(3)}</Text>
                                {/* <Text style={styles.detailsText}>Inter Total Paid Amount : {interTotalPaidAmount.toFixed(2)}</Text>
                                <Text style={styles.detailsText}>Local Total Paid Amount : {kuwaitLocalTotalPaidAmount.toFixed(3)}</Text>
                                <Text style={styles.detailsText}>Inter Balance Amount : {balanceInterAmount}</Text>
                                <Text style={styles.detailsText}>Local Balance Amount : {balanceLocalAmount}</Text> */}
                                {/* <Text style={styles.detailsText}>Inter Total Paid Amount : {interTotalPaidAmount.toFixed(2)}</Text>
                                <Text style={styles.detailsText}>Local Total Paid Amount : {kuwaitLocalTotalPaidAmount.toFixed(3)}</Text>
                                <Text style={styles.detailsText}>Inter Balance Amount : {balanceInterAmount}</Text>
                                <Text style={styles.detailsText}>Local Balance Amount : {balanceLocalAmount}</Text> */}
                                <Text style={styles.detailsText}>Local Total Paid Amount : {local_Total_Paid_Amount.toFixed(3)}</Text>
                                <Text style={styles.detailsText}>Local Balance Amount : {local_Total_Balance_Amount}</Text>
                                <View style={styles.amountInputContainer}>
                                    <Text style={styles.detailsText}>Today Amount : </Text>
                                    <TextInput
                                        placeholder='0'
                                        placeholderTextColor={Colors.DEFAULT_DARK_BLUE}
                                        selectionColor={Colors.DEFAULT_DARK_BLUE}
                                        style={[styles.amountTextInput, errorMessage ? styles.errorInput : null]}
                                        keyboardType='numeric'
                                        value={todayPaidAmountValue}
                                        onChangeText={(text) => {
                                            // Allow only valid numeric input with up to 3 decimal places
                                            const validInput = text.match(/^\d*\.?\d{0,3}$/);
                                            if (validInput) {
                                                setTodayPaidAmountValue(text);
                                            }
                                        }}
                                    />
                                </View>

                                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                                <View style={styles.saveButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setPaidModalVisible(false);
                                            navigation.navigate('DistributorPaidAmountEditList', { editClient: selectedItem });
                                        }}

                                    // onPress={() => {
                                    //     const selectedItemWithoutSet = {
                                    //         ...selectedItem,
                                    //         collSet: Array.from(selectedItem.collSet || []),
                                    //     };

                                    //     navigation.navigate('DistributorPaidAmountEditList', {
                                    //         editClient: selectedItemWithoutSet,
                                    //     });

                                    // }}
                                    >
                                        <Text style={styles.editButtonText}>Edit</Text>
                                        <Feather name="edit" size={20} color={Colors.DEFAULT_LIGHT_BLUE} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.saveButton,
                                            isUpdateButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                                        ]}
                                        activeOpacity={0.8}
                                        disabled={isUpdateButtonDisabled}
                                        onPress={handlePressEnterPaidAmount}
                                    >
                                        <Text style={styles.saveButtonText}>Paid</Text>
                                        <FontAwesome name="send" size={20} color={Colors.DEFAULT_LIGHT_BLUE} />

                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

        </View>
    )
}

export default DistributorCollectionList

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
        fontSize: 18,
        lineHeight: 18 * 1.4,
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
    emptyText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        marginVertical: 10,
        color: Colors.DEFAULT_DARK_RED
    },
    updateModalConatiner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    updateModal: {
        margin: 20,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: Display.setWidth(90),
        height: Display.setHeight(58),
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
    updateModalCloseButton: {
        marginLeft: 200,
    },
    updateModalText: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 22,
        lineHeight: 22 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE,
        textDecorationLine: 'underline'
    },
    detailsContainer: {
        width: Display.setWidth(70),
        // borderWidth: 1,
        // borderColor: Colors.DEFAULT_LIGHT_WHITE,
        // borderRadius: 10,
        // marginVertical:10,
        // padding: 40
        paddingVertical: 10,
        // paddingHorizontal: 10
    },
    detailsText: {
        fontSize: 14,
        // lineHeight: 18.5 * 1.4,
        // fontSize: RFValue(12.5),
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_WHITE,
        textTransform: 'capitalize'
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
        // borderWidth: 1.2,
    },
    amountTextInput: {
        borderWidth: 1.2,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        borderRadius: 8,
        // flex: 1,
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        fontSize: 18,
        lineHeight: 18 * 1.4,
        paddingVertical: 0,
        width: Display.setWidth(25),
        height: Display.setHeight(5),
        paddingHorizontal: 15,
        color: Colors.DEFAULT_DARK_BLUE
    },
    errorInput: {
        borderColor: Colors.DEFAULT_DARK_RED, // Red border for errors
        borderWidth: 2
    },
    errorText: {
        color: Colors.DEFAULT_DARK_RED,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        fontSize: 12,
        lineHeight: 12 * 1.4,
        marginTop: 5,
    },
    saveButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // borderWidth: 1,
        marginVertical: 10
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 8,
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        width: Display.setWidth(28),
        borderRadius: 25,
    },
    editButtonText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE
    },
    saveButton: {
        borderWidth: 2,
        borderRadius: 25,
        // borderColor: Colors.DEFAULT_LIGHT_WHITE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: Display.setWidth(28),
        marginVertical: 5,
        padding: 8,
        // backgroundColor: Colors.DEFAULT_LIGHT_WHITE
    },
    buttonEnabled: {
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
    },
    buttonDisabled: {
        backgroundColor: Colors.DEFAULT_DARK_RED,
        borderColor: Colors.DEFAULT_DARK_RED,
    },
    saveButtonText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
    },
})