import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { replaceLoggerImplementation } from 'react-native-reanimated/lib/typescript/logger';


const SendClientsToAgentsScreen = ({ route, navigation }) => {
    const { assignEmployee } = route.params; // Extract passed employee data
    // console.log('111111', assignEmployee);

    const [loading, setLoading] = useState(true);
    const [isFocus, setIsFocus] = useState(false);
    const [employeesData, setEmployeesData] = useState([]);
    const [employeeAssign, setEmployeeAssign] = useState('');

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    // Employee Assign
    const fetchAssignEmployee = async () => {
        try {
            const today = new Date();
            const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

            const assignedEmployee = {
                client_id: assignEmployee.client_id,
                user_id: employeeAssign,
                sent: true,
                assigned_date: formattedDate
            }

            // const response = await axios.put(`${API_HOST}/client_IDupdated/${assignEmployee.client_id}`, assignEmployee);
            const response = await axiosInstance.put(`/client_IDupdated/${assignEmployee.client_id}`, assignedEmployee);
            console.log('6666666', response.data);

            Toast.show({
                type: 'success',
                text1: 'Assign Employee Successfully!',
                // text2: 'This is some something 👋'
            });

            navigation.navigate('DrawerNavigation', { screen: 'Home' });

        } catch (error) {
            console.error('Error updating client:', error);
            // Alert(error.response?.data?.message || 'Failed to update client');
        }
        setLoading(false);
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

            setLoading(true);

            // Axios GET request
            // const response = await axios.get(`${API_HOST}/list`, {
            const response = await axiosInstance.get('/list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            const collectionAgentList = response.data
                .filter((item) => item.role === "Collection Agent")
                .map((item) => ({
                    label: item.username,
                    value: item.user_id,
                }));

            setEmployeesData(collectionAgentList);
            // console.log(response.data);
            // console.log(collectionAgentList);

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
            fetchEmployeesData();
        }, [])
    )


    const isUpdateButtonDisabled = !employeeAssign;

    return (
        <View styl={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
            <View style={styles.clientAssignContainer}>

                <View style={styles.clientAssignDetailContainer}>
                    <Text style={styles.clientAssignDetailHeading}>Client ID:</Text>
                    <Text style={styles.clientAssignDetailText}>{assignEmployee.client_id}</Text>
                </View>
                <View style={styles.clientAssignDetailContainer}>
                    <Text style={styles.clientAssignDetailHeading}>Client Name:</Text>
                    <Text style={styles.clientAssignDetailText}>{assignEmployee.client_name}</Text>
                </View>
                <View style={styles.clientAssignDetailContainer}>
                    <Text style={styles.clientAssignDetailHeading}>Client Number:</Text>
                    <Text style={styles.clientAssignDetailText}>{assignEmployee.client_contact}</Text>
                </View>
                {/* <View style={styles.clientAssignDetailContainer}>
                    <Text style={styles.clientAssignDetailHeading}>Client City:</Text>
                    <Text style={styles.clientAssignDetailText}>{assignEmployee.client_city}</Text>
                </View>
                <View style={styles.clientAssignDetailContainer}>
                    <Text style={styles.clientAssignDetailHeading}>Total Amount:</Text>
                    <Text style={styles.clientAssignDetailText}>{assignEmployee.amount}</Text>
                </View> */}

                {/* DROPDOWN BELOW TEXT INPUT */}
                <View style={[styles.dropdownWrapper, isFocus && { zIndex: 1000 }]}>
                    <Text style={styles.updateClientDetailHeading}>Assign Employee:</Text>
                    <Dropdown
                        style={[styles.dropdown, isFocus && { borderColor: Colors.DEFAULT_LIGHT_BLUE }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        containerStyle={{ marginTop: 30 }}
                        data={employeesData}
                        // search
                        // searchPlaceholder="Search..."
                        labelField="label"
                        valueField="value"
                        placeholder={!employeeAssign ? "Assign Employee" : ""}
                        maxHeight={250}
                        value={employeeAssign}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={item => {
                            // console.log('Selected:', item.value);
                            setEmployeeAssign(item.value);
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
                        isUpdateButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                    ]}
                    onPress={fetchAssignEmployee}
                    disabled={isUpdateButtonDisabled}
                >
                    <Text style={styles.assignButtonText}>Assign</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export default SendClientsToAgentsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    clientAssignContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        paddingBottom: 40,
    },
    clientAssignDetailContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        width: Display.setWidth(90),
        height: Display.setHeight(12),
        // borderWidth: 1,
        // marginVertical: 5,
        paddingVertical: 10
    },
    clientAssignDetailHeading: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        padding: 5,
    },
    clientAssignDetailText: {
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
    updateClientDetailHeading: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        padding: 5,
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