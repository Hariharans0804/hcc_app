import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
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


const UpdateClientScreen = ({ route, navigation }) => {
    const { updateSingleClient, distributorName, changeDistributorSingleClient, } = route.params; // Extract passed employee data
    // console.log('111', updateSingleClient);
    // console.log('222', distributorName);
    // console.log('333', changeDistributorSingleClient);


    const [isFocus, setIsFocus] = useState(false);
    const [isFocusDistributor, setIsFocusDistributor] = useState(false);
    // Initialize state with client data
    const [clientData, setClientData] = useState({
        Distributor_id: updateSingleClient.Distributor_id || '',
        client_name: updateSingleClient.client_name || '',
        client_contact: updateSingleClient.client_contact || '',
        client_city: updateSingleClient.client_city || '',
        amount: updateSingleClient.amount?.toString() || '',
        today_rate: updateSingleClient.today_rate || '',
        accno: updateSingleClient.accno || '',
        bank_type: updateSingleClient.bank_type || '',
        narration: updateSingleClient.narration || '',
        bank_name: updateSingleClient.bank_name || '',
        ifsc_code: updateSingleClient.ifsc_code || '',
        name_of_the_beneficiary: updateSingleClient.name_of_the_beneficiary || '',
        address_of_the_beneficiary: updateSingleClient.address_of_the_beneficiary || '',
        accoun_type: updateSingleClient.accoun_type || '',
        sender_information: updateSingleClient.sender_information || '',
        sent: updateSingleClient.sent
    });
    // console.log('1111111', clientData);

    const [loading, setLoading] = useState(false);
    const [updatedClientData, setUpdatedClientData] = useState([]);
    // const [distributorNameChange, setDistributorNameChange] = useState([]);
    // console.log('66666',clientData);



    const distributorData = changeDistributorSingleClient
        .filter((item) => item.role === "Distributor")
        .map((distributor) => ({
            label: distributor.username,
            value: distributor.user_id.toString(),
        }));
    // console.log(distributorData);




    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });

    const data = [
        { label: 'Bank 1', value: 'bank1' },
        { label: 'Bank 2', value: 'bank2' }
    ];

    // Handle input changes
    const handleInputChange = (field, value) => {
        setClientData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    // Update API function
    const handleUpdateSubmit = async () => {
        setLoading(true);

        try {
            // const response = await axios.put(`${API_HOST}/acc_clientupdated/${updateSingleClient.client_id}`, clientData);
            const response = await axiosInstance.put(`/acc_clientupdated/${updateSingleClient.client_id}`, clientData);
            setUpdatedClientData(response.data);
            // console.log('66666', response.data);


            Toast.show({
                type: 'success',
                text1: 'Updated Client Successfully!',
                // text2: 'This is some something 👋'
            });

            navigation.navigate('DrawerNavigation', { screen: 'Home' });

        } catch (error) {
            console.error('Error updating client:', error);
            // Alert(error.response?.data?.message || 'Failed to update client');
        }
        setLoading(false);
    }

    const isUpdateButtonDisabled =
        !clientData.client_name.trim() ||
        !clientData.client_contact.trim() ||
        !clientData.client_city.trim() ||
        !clientData.amount.trim();

    return (
        <View styl={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.updateClientContainer}>

                    {/* DROPDOWN BELOW TEXT INPUT */}
                    <View style={[styles.dropdownWrapper, isFocusDistributor && { zIndex: 1000 }]}>
                        <Text style={styles.updateClientDetailHeading}>Distributor Name :</Text>
                        <Dropdown
                            style={[styles.dropdown, isFocusDistributor && { borderColor: Colors.DEFAULT_LIGHT_BLUE }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            containerStyle={{ marginTop: 25, borderRadius: 8 }}
                            autoScroll={false}
                            data={distributorData}
                            search
                            searchPlaceholder="Search..."
                            labelField="label"
                            valueField="value"
                            placeholder={"Distributor Name"}
                            maxHeight={250}
                            value={clientData.Distributor_id?.toString()}
                            onFocus={() => setIsFocusDistributor(true)}
                            onBlur={() => setIsFocusDistributor(false)}
                            onChange={item => {
                                console.log('Selected:', item.label);
                                console.log('Value:', item.value);
                                handleInputChange('Distributor_id', item.value.toString());
                                setIsFocusDistributor(false);
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

                    <View style={styles.UpdateClientIdContainer}>
                        <Text style={styles.updateClientIdHeading}>Client ID :</Text>
                        <Text style={styles.UpdateclientIdText}>{updateSingleClient.client_id}</Text>
                    </View>

                    <View style={styles.UpdateTextInputContainer}>
                        <Text style={styles.updateClientDetailHeading}>Client Name :</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Client Name'
                                placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={clientData.client_name}
                                onChangeText={(text) => handleInputChange('client_name', text)}
                            />
                            {clientData.client_name && (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('client_name', '')}>
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <View style={styles.UpdateTextInputContainer}>
                        <Text style={styles.updateClientDetailHeading}>Client Number :</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Client Number'
                                placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={clientData.client_contact}
                                onChangeText={(text) => handleInputChange('client_contact', text)}
                            />
                            {clientData.client_contact && (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('client_contact', '')}>
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <View style={styles.UpdateTextInputContainer}>
                        <Text style={styles.updateClientDetailHeading}>Client City :</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Client City'
                                placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={clientData.client_city}
                                onChangeText={(text) => handleInputChange('client_city', text)}
                            />
                            {clientData.client_city && (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('client_city', '')}>
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.UpdateTextInputContainer}>
                        <Text style={styles.updateClientDetailHeading}>Total Amount :</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Total Amount'
                                placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={clientData.amount?.toString()}  // Ensure it's a string
                                onChangeText={(text) => handleInputChange('amount', text)}
                            />
                            {clientData.amount && (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('amount', '')}>
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <View style={styles.UpdateTextInputContainer}>
                        <Text style={styles.updateClientDetailHeading}>Today Rate :</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Today Rate'
                                placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={clientData.today_rate.toString()}
                                onChangeText={(text) => handleInputChange('today_rate', text)}
                            />
                            {clientData.today_rate && (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('today_rate', '')}>
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <View style={styles.UpdateTextInputContainer}>
                        <Text style={styles.updateClientDetailHeading}>Account Number :</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Account Number'
                                placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={clientData.accno}
                                onChangeText={(text) => handleInputChange('accno', text)}
                            />
                            {clientData.accno && (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('accno', '')}>
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* DROPDOWN BELOW TEXT INPUT */}
                    {/* <View style={[styles.dropdownWrapper, isFocus && { zIndex: 1000 }]}>
                        <Text style={styles.updateClientDetailHeading}>Client Bank Type:</Text>
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
                            placeholder={"Client Bank Type"}
                            maxHeight={250}
                            value={clientData.bank_type}
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={item => {
                                // console.log('Selected:', item.label);
                                handleInputChange('bank_type', item.value);
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


                    {/* {clientData.bank_type === 'bank2' && ( */}
                    <>
                        <View style={styles.UpdateTextInputContainer}>
                            <Text style={styles.updateClientDetailHeading}>Bank Name :</Text>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Bank Name'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={clientData.bank_name}
                                    onChangeText={(text) => handleInputChange('bank_name', text)}
                                />
                                {clientData.bank_name && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('bank_name', '')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.UpdateTextInputContainer}>
                            <Text style={styles.updateClientDetailHeading}>IFSC Code :</Text>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='IFSC Code'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={clientData.ifsc_code}
                                    onChangeText={(text) => handleInputChange('ifsc_code', text)}
                                />
                                {clientData.ifsc_code && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('ifsc_code', '')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.UpdateTextInputContainer}>
                            <Text style={styles.updateClientDetailHeading}>Name of the Beneficiary :</Text>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Name of the Beneficiary'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={styles.textInput}
                                    value={clientData.name_of_the_beneficiary}
                                    onChangeText={(text) => handleInputChange('name_of_the_beneficiary', text)}
                                />
                                {clientData.name_of_the_beneficiary && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('name_of_the_beneficiary', '')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.UpdateTextInputContainer}>
                            <Text style={styles.updateClientDetailHeading}>Address of the Beneficiary :</Text>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Address of the Beneficiary'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={clientData.address_of_the_beneficiary}
                                    onChangeText={(text) => handleInputChange('address_of_the_beneficiary', text)}
                                />
                                {clientData.address_of_the_beneficiary && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('address_of_the_beneficiary', '')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.UpdateTextInputContainer}>
                            <Text style={styles.updateClientDetailHeading}>Account Type :</Text>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Account Type'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={clientData.accoun_type}
                                    onChangeText={(text) => handleInputChange('accoun_type', text)}
                                />
                                {clientData.accoun_type && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('accoun_type', '')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.UpdateTextInputContainer}>
                            <Text style={styles.updateClientDetailHeading}>Sender Information :</Text>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Sender Information'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'uppercase' }]}
                                    value={clientData.sender_information}
                                    onChangeText={(text) => handleInputChange('sender_information', text)}
                                />
                                {clientData.sender_information && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('sender_information', '')}>
                                        <AntDesign
                                            name="closecircleo"
                                            size={20}
                                            color={Colors.DEFAULT_DARK_GRAY}
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </>
                    {/* )} */}

                    {/* {clientData.bank_type === 'bank1' && ( */}
                    <View style={styles.UpdateTextInputContainer}>
                        <Text style={styles.updateClientDetailHeading}>Narration :</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Narration'
                                placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={[styles.textInput, { textTransform: 'uppercase' }]}
                                value={clientData.narration}
                                onChangeText={(text) => handleInputChange('narration', text)}
                            />
                            {clientData.narration && (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('narration', '')}>
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {/* )} */}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.updateButton,
                            isUpdateButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                        ]}
                        onPress={handleUpdateSubmit}
                        disabled={isUpdateButtonDisabled}
                    >
                        <Text style={styles.updateButtonText}>Update</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    )
}

export default UpdateClientScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    updateClientContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        // paddingBottom: 60
    },
    UpdateClientIdContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        width: Display.setWidth(90),
        height: Display.setHeight(10),
        // borderWidth: 1,
        // paddingHorizontal:10,
        marginVertical: 5
    },
    updateClientIdHeading: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        padding: 5,
    },
    UpdateclientIdText: {
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_LIGHT_WHITE,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        width: Display.setWidth(90),
        // height: Display.setHeight(6),
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    UpdateTextInputContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        width: Display.setWidth(90),
        height: Display.setHeight(12),
        // borderWidth: 1,
        marginVertical: 5
    },
    updateClientDetailHeading: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        padding: 5,
    },
    textInputContainer: {
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        width: Display.setWidth(90),
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        borderRadius: 8,
        // marginVertical: 10,
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
        // elevation: 2,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        // marginVertical: 10,
        textTransform: 'uppercase'
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
        color: Colors.DEFAULT_BLACK
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
    updateButton: {
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
        marginVertical: 15,
        borderRadius: 30
    },
    buttonEnabled: {
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
    },
    buttonDisabled: {
        backgroundColor: Colors.DEFAULT_DARK_GRAY,
    },
    updateButtonText: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_WHITE,
        textAlign: 'center',
        padding: 10,
    }
})