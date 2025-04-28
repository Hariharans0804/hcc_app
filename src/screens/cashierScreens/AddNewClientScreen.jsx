import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Colors, Fonts } from '../../constants';
import { Display } from '../../utils';
import { Separator } from '../../components';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import SearchInput from "react-native-search-filter";
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import { Dropdown } from 'react-native-element-dropdown';
import { Screen } from 'react-native-screens';


const AddNewClientScreen = ({ navigation }) => {

    const [isFocus, setIsFocus] = useState(false);
    const [isFocusDistributor, setIsFocusDistributor] = useState(false);
    const [loading, setLoading] = useState(true);
    const [clientName, setClientName] = useState('');
    const [clientNumber, setClientNumber] = useState('');
    const [clientCity, setClientCity] = useState('');
    const [clientAmount, setClientAmount] = useState('');
    const [accountTypeValue, setAccountTypeValue] = useState('');
    const [todayRate, setTodayRate] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [nameBeneficiary, setNameBeneficiary] = useState('');
    const [addressBeneficiary, setAddressBeneficiary] = useState('');
    const [accountType, setAccountType] = useState('');
    const [senderInformation, setSenderInformation] = useState('');
    const [narration, setNarration] = useState('');
    const [newClientData, setNewClientData] = useState([]);
    const [distributorList, setDistributorList] = useState([]);
    const [assignDistributor, setAssignDistributor] = useState('');
    // console.log('22222222222',newClientData);
    const [showBankInputs, setShowBankInputs] = useState(false);
    const [showDistriputorInputs, setShowDistriputorInputs] = useState(false);
    const [distributorName, setDistributorName] = useState('');
    const [distributorNumber, setDistributorNumber] = useState('');
    const [distributorTodayRate, setDistributorTodayRate] = useState('');
    const [loginUserData, setLoginUserData] = useState(null);
    const [employeesData, setEmployeesData] = useState([]);


    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });

    const data = [
        { label: 'Bank 1', value: 'bank1' },
        { label: 'Bank 2', value: 'bank2' }
    ];


    const fetchGetLoginUserData = async () => {
        try {
            const data = await getFromStorage('users');
            // console.log('22222', data);
            setLoginUserData(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }


    // Fetch Employee data
    const fetchEmpoyeesData = async () => {
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

            setLoading(true);
            // Axios GET request
            // const response = await axios.get(`${API_HOST}/list`, {
            const response = await axiosInstance.get('/list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            const distributorList = response.data
                .filter((item) => item.role === "Distributor")
                .map((item) => ({
                    label: item.username,
                    value: item.user_id,
                }));

            setDistributorList(distributorList);
            setEmployeesData(response.data);
            // console.log('employees', response.data);
            // console.log('distributorList', distributorList);

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
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchEmpoyeesData();
            fetchGetLoginUserData();
            // const today = new Date();
            // const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
            // console.log(currentDate);
        }, [])
    )


    const fetchAddNewDistributor = async () => {
        if (distributorName && distributorNumber && distributorTodayRate > 0) {
            try {
                const today = new Date();
                // console.log(today);
                const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

                const addNewDistributor = {
                    username: distributorName,
                    phone_number: distributorNumber,
                    role: "Distributor",
                    today_rate_date: formattedDate,
                    Distributor_today_rate: distributorTodayRate,
                };

                const response = await axiosInstance.post(`/distrbutorCreated`,
                    addNewDistributor,
                );
                // console.log(response.data);

                Toast.show({
                    type: 'success',
                    text1: 'New Distributor and TodayRate Added Successfully!',
                    // text2: 'This is some something 👋'
                });

                setDistributorName('');
                setDistributorNumber('');
                setDistributorTodayRate('');
                setShowDistriputorInputs(!showDistriputorInputs);

                fetchEmpoyeesData();

            } catch (error) {
                console.error('Error adding new employee:', error.response ? error.response.data : error.message);
            }
        }
    }

    const fetchAddNewClient = async () => {
        if (clientName && clientNumber && clientCity && clientAmount > 0) {
            try {
                const today = new Date();
                // console.log(today);
                const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

                const addNewClientData = {
                    date: formattedDate,
                    Distributor_id: assignDistributor || 0,
                    client_name: (clientName || 'UNKNOWN').toUpperCase(),
                    client_contact: clientNumber || 'UNKNOWN',
                    client_city: (clientCity || 'UNKNOWN').toUpperCase(),
                    amount: clientAmount || 0,
                    sent: false,
                    paid_and_unpaid: false,
                    success_and_unsuccess: false,
                    bank_type: (accountTypeValue || '').toUpperCase(),
                    today_rate: todayRate || 0,
                    bank_name: (bankName || '').toUpperCase(),
                    accno: (accountNumber || '').toUpperCase(),
                    ifsc_code: (ifscCode || '').toUpperCase(),
                    accoun_type: (accountType || '10').toUpperCase(),
                    name_of_the_beneficiary: (nameBeneficiary || '').toUpperCase(),
                    address_of_the_beneficiary: (addressBeneficiary || 'CHENNAI').toUpperCase(),
                    sender_information: (senderInformation || 'STOCK').toUpperCase(),
                    narration: (narration || 'STOCK').toUpperCase(),
                };

                // const response = await axios.post(`${API_HOST}/acc_insertarrays`,
                const response = await axiosInstance.post(`/acc_insertarrays`,
                    addNewClientData,
                    // { headers: { 'Content-Type': 'application/json' }, }// Setting the header for JSON
                    // body: JSON.stringify(addNewClientData),
                );
                setNewClientData(response.data);
                // console.log('2222222222', response.data);

                Toast.show({
                    type: 'success',
                    text1: 'New Client Added Successfully!',
                    // text2: 'This is some something 👋'
                });

                // navigation.navigate('DrawerNavigation', { screen: 'Home' });

                setClientName('');
                setClientNumber('');
                setClientCity('');
                setClientAmount('');
                setAccountTypeValue('');
                // setTodayRate('');
                setAccountNumber('');
                setBankName();
                setIfscCode();
                setNameBeneficiary('');
                setAddressBeneficiary('');
                setAccountType('');
                setSenderInformation('');
                setNarration('');

            } catch (error) {
                // console.log('00000000000', error.message);
                console.error('Error adding new client:', error.response ? error.response.data : error.message);
                Alert.alert('Error', error.response?.data?.message || 'An unexpected error occurred.');
                setLoading(false); // Hide loader on error
            }

        }
    }

    const isAddButtonDisabled = !(clientName && clientNumber && clientCity && clientAmount > 0);
    const isAddDistributorButtonDisabled = !(distributorName && distributorNumber && distributorTodayRate > 0);

    // const isAddButtonDisabled = !(
    //     clientName &&
    //     clientNumber &&
    //     clientCity &&
    //     clientAmount &&
    //     todayRate &&
    //     accountNumber &&
    //     accountTypeValue &&
    //     (
    //         (accountTypeValue === "bank1" && narration) ||
    //         (accountTypeValue === "bank2" &&
    //             bankName &&
    //             ifscCode &&
    //             nameBeneficiary &&
    //             addressBeneficiary &&
    //             accountType &&
    //             senderInformation
    //         )
    //     )
    // );


    const employeesMap = useMemo(() => {
        return new Map(employeesData.map(emp => [emp.user_id, emp]));
    }, [employeesData]);

    const handleDistributorChange = (item) => {
        setAssignDistributor(item.value);
        setIsFocusDistributor(false);

        const selectedDistributor = employeesMap.get(item.value);

        const today = new Date();
        const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
            .toString().padStart(2, '0')}-${today.getFullYear()}`;

        if (selectedDistributor) {
            const distributorDate = selectedDistributor.today_rate_date
                ? selectedDistributor.today_rate_date.split('T')[0]
                : null;

            setTodayRate(distributorDate === currentDate ? parseFloat(selectedDistributor.Distributor_today_rate).toString() : "0");
        } else {
            setTodayRate("0");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.clientContainer}>

                    {/* DROPDOWN BELOW TEXT INPUT */}
                    {/* <View style={[styles.dropdownWrapper, isFocusDistributor && { zIndex: 1000 }]}>
                        <Dropdown
                            style={[styles.dropdown, isFocusDistributor && { borderColor: Colors.DEFAULT_LIGHT_BLUE }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            containerStyle={{ marginTop: 25, borderRadius: 8 }}
                            data={distributorOptions}
                            autoScroll={false}
                            search
                            searchPlaceholder="Search..."
                            labelField="label"
                            valueField="value"
                            placeholder={!assignDistributor ? "Assign Distributor" : ""}
                            maxHeight={250}
                            value={assignDistributor}
                            onFocus={() => setIsFocusDistributor(true)}
                            onBlur={() => setIsFocusDistributor(false)}
                            onChange={item => {
                                setAssignDistributor(item.value);
                                setIsFocusDistributor(false);

                                // Find the matching distributor from employeesData
                                const selectedDistributor = employeesData.find(emp => emp.user_id === item.value);

                                // Get today's date in YYYY-MM-DD format
                                const today = new Date();
                                // const currentDate = today.toISOString().split('T')[0]; // "2025-03-10"
                                const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
                                    .toString().padStart(2, '0')}-${today.getFullYear()}`; // "19-03-2025"

                                if (selectedDistributor) {
                                    const distributorDate = selectedDistributor.today_rate_date
                                        ? selectedDistributor.today_rate_date.split('T')[0] // Extract date part
                                        : null;

                                    setTodayRate(distributorDate === currentDate ? parseFloat(selectedDistributor.Distributor_today_rate).toString() : "0");
                                } else {
                                    setTodayRate("0");
                                }
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
                    </View> */}

                    <View style={[styles.dropdownWrapper, isFocusDistributor && { zIndex: 1000 }]}>
                        <Dropdown
                            style={[styles.dropdown, isFocusDistributor && { borderColor: Colors.DEFAULT_LIGHT_BLUE }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            containerStyle={{ marginTop: 25, borderRadius: 8 }}
                            data={distributorList}
                            autoScroll={false}
                            search
                            searchPlaceholder="Search..."
                            labelField="label"
                            valueField="value"
                            placeholder={!assignDistributor ? "Assign Distributor" : ""}
                            maxHeight={250}
                            value={assignDistributor}
                            onFocus={() => setIsFocusDistributor(true)}
                            onBlur={() => setIsFocusDistributor(false)}
                            onChange={handleDistributorChange}
                            flatListProps={{
                                initialNumToRender: 10,
                                maxToRenderPerBatch: 10,
                                windowSize: 5,
                            }}
                            renderLeftIcon={() => (
                                <AntDesign
                                    name="Safety"
                                    size={20}
                                    color={Colors.DEFAULT_DARK_BLUE}
                                    style={{ marginRight: 5 }}
                                />
                            )}
                        />
                    </View>

                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Today Rate'
                            keyboardType='numeric'
                            placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                            selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                            style={styles.textInput}
                            value={todayRate}
                            onChangeText={setTodayRate}
                        />
                        {todayRate && (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setTodayRate('')}>
                                <AntDesign
                                    name="closecircleo"
                                    size={20}
                                    color={Colors.DEFAULT_DARK_GRAY}
                                    style={{ marginLeft: 10 }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Client Name'
                            placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                            selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                            style={styles.textInput}
                            value={clientName}
                            onChangeText={setClientName}
                        />
                        {clientName && (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setClientName('')}>
                                <AntDesign
                                    name="closecircleo"
                                    size={20}
                                    color={Colors.DEFAULT_DARK_GRAY}
                                    style={{ marginLeft: 10 }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Contact Number'
                            keyboardType='numeric'
                            placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                            selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                            style={styles.textInput}
                            value={clientNumber}
                            onChangeText={setClientNumber}
                        />
                        {clientNumber && (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setClientNumber('')}>
                                <AntDesign
                                    name="closecircleo"
                                    size={20}
                                    color={Colors.DEFAULT_DARK_GRAY}
                                    style={{ marginLeft: 10 }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='City'
                            placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                            selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                            style={styles.textInput}
                            value={clientCity}
                            onChangeText={setClientCity}
                        />
                        {clientCity && (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setClientCity('')}>
                                <AntDesign
                                    name="closecircleo"
                                    size={20}
                                    color={Colors.DEFAULT_DARK_GRAY}
                                    style={{ marginLeft: 10 }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Amount'
                            keyboardType='numeric'
                            placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                            selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                            style={styles.textInput}
                            value={clientAmount}
                            onChangeText={setClientAmount}
                        />
                        {clientAmount && (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setClientAmount('')}>
                                <AntDesign
                                    name="closecircleo"
                                    size={20}
                                    color={Colors.DEFAULT_DARK_GRAY}
                                    style={{ marginLeft: 10 }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    {showBankInputs && (
                        <>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Account Number'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={accountNumber}
                                    onChangeText={setAccountNumber}
                                />
                                {accountNumber && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setAccountNumber('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Bank Name'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={bankName}
                                    onChangeText={setBankName}
                                />
                                {bankName && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setBankName('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='IFSC Code'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={ifscCode}
                                    onChangeText={setIfscCode}
                                />
                                {ifscCode && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setIfscCode('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}


                    {/* DROPDOWN BELOW TEXT INPUT */}
                    {/* <View style={[styles.dropdownWrapper, isFocus && { zIndex: 1000 }]}>
                        <Dropdown
                            style={[styles.dropdown, isFocus && { borderColor: Colors.DEFAULT_LIGHT_BLUE }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            containerStyle={{ marginTop: 30 }}
                            data={data}
                            // search
                            // searchPlaceholder="Search..."
                            labelField="label"
                            valueField="value"
                            placeholder={!accountTypeValue ? "Client Bank Type" : ""}
                            maxHeight={250}
                            value={accountTypeValue}
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={item => {
                                // console.log('Selected:', item.label);
                                setAccountTypeValue(item.value);
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
                    </View> */}

                    {/* Conditional TextInputs based on dropdown selection */}
                    {accountTypeValue === "bank1" && (
                        <>
                            {/* Display these fields if 'Local' is selected */}
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Narration'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={narration}
                                    onChangeText={setNarration}
                                />
                                {narration && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setNarration('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}

                    {accountTypeValue === "bank2" && (
                        <>
                            {/* Display these fields if 'International' is selected */}
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Bank Name'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={bankName}
                                    onChangeText={setBankName}
                                />
                                {bankName && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setBankName('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='IFSC Code'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={ifscCode}
                                    onChangeText={setIfscCode}
                                />
                                {ifscCode && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setIfscCode('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Name of the Beneficiary'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={styles.textInput}
                                    value={nameBeneficiary}
                                    onChangeText={setNameBeneficiary}
                                />
                                {nameBeneficiary && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setNameBeneficiary('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Address of the Beneficiary'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={styles.textInput}
                                    value={addressBeneficiary}
                                    onChangeText={setAddressBeneficiary}
                                />
                                {addressBeneficiary && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setAddressBeneficiary('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Account Type'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={styles.textInput}
                                    value={accountType}
                                    onChangeText={setAccountType}
                                />
                                {accountType && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setAccountType('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Sender Information'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={styles.textInput}
                                    value={senderInformation}
                                    onChangeText={setSenderInformation}
                                />
                                {senderInformation && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setSenderInformation('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.addBankButton, { backgroundColor: showBankInputs ? Colors.DEFAULT_DARK_RED : Colors.DEFAULT_GREEN }]}
                            activeOpacity={0.8}
                            onPress={() => {
                                if (showBankInputs) {
                                    setAccountNumber('');
                                    setBankName('');
                                    setIfscCode('');
                                }
                                setShowBankInputs(!showBankInputs)
                            }}
                        >
                            <Text style={styles.addBankButtonText}>{showBankInputs ? 'Cancel' : 'Add Bank'}</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => navigation.navigate('ManagerDashboard')}>
                            <Text>go</Text>
                        </TouchableOpacity> */}
                        {loginUserData?.role === "Admin" && (
                            <TouchableOpacity style={[styles.addBankButton, { backgroundColor: showDistriputorInputs ? Colors.DEFAULT_DARK_RED : Colors.DEFAULT_GREEN }]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (showDistriputorInputs) {
                                        setDistributorName('');
                                        setDistributorNumber('');
                                        setDistributorTodayRate('');
                                    }
                                    setShowDistriputorInputs(!showDistriputorInputs)
                                }}
                            >
                                <Text style={styles.addBankButtonText}>{showDistriputorInputs ? 'Cancel' : 'Add Distributor'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {showDistriputorInputs && (
                        <>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Distributer Name'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={distributorName}
                                    onChangeText={setDistributorName}
                                />
                                {distributorName && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setDistributorName('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Distributor Number'
                                    keyboardType='numeric'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={styles.textInput}
                                    value={distributorNumber}
                                    onChangeText={setDistributorNumber}
                                />
                                {distributorNumber && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setDistributorNumber('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Today Rate'
                                    keyboardType='numeric'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={styles.textInput}
                                    value={distributorTodayRate}
                                    onChangeText={setDistributorTodayRate}
                                />
                                {distributorTodayRate && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setDistributorTodayRate('')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.addNewClientButton,
                                    isAddDistributorButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                                ]}
                                onPress={fetchAddNewDistributor}
                                disabled={isAddDistributorButtonDisabled}
                            >
                                <Text style={styles.addBankButtonText}>Save Distributor</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.addNewClientButton,
                            isAddButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                        ]}
                        onPress={fetchAddNewClient}
                        disabled={isAddButtonDisabled}
                    >
                        <Text style={styles.addNewClientButtonText}>Add New Client</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    )
}

export default AddNewClientScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
        // paddingTop: 15,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    clientContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    textInputContainer: {
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        width: Display.setWidth(90),
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        borderRadius: 8,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    textInput: {
        borderWidth: 1,
        width: Display.setWidth(80),
        height: Display.setHeight(6),
        // backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        // elevation: 3,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        // marginVertical: 10,
        textTransform: 'capitalize'
    },
    dropdownWrapper: {
        position: 'relative',
        zIndex: 1, // Prevents dropdown from being hidden
    },
    dropdown: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        borderRadius: 8,
        paddingHorizontal: 12,
        width: Display.setWidth(90),
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
    addNewClientButton: {
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
        marginVertical: 10,
        borderRadius: 30
    },
    buttonEnabled: {
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
    },
    buttonDisabled: {
        backgroundColor: Colors.DEFAULT_DARK_GRAY,
    },
    addNewClientButtonText: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_WHITE,
        textAlign: 'center',
        padding: 10,
    },
    addBankButton: {
        // backgroundColor: Colors.DEFAULT_GREEN,
        paddingHorizontal: 10,
        marginVertical: 10,
        borderRadius: 25
    },
    addBankButtonText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_WHITE,
        textAlign: 'center',
        padding: 10,
    },
    buttonContainer: {
        // borderWidth:1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})