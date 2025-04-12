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

const UpdateEmployeeScreen = ({ route, navigation }) => {
    const { updateSingleEmployee } = route.params; // Extract passed employee data
    // console.log('8888', updateSingleEmployee);


    const [isFocus, setIsFocus] = useState(false);
    const [employeeData, setEmployeeData] = useState({
        username: updateSingleEmployee.username || '',
        phone_number: updateSingleEmployee.phone_number || '',
        city: updateSingleEmployee.city || '',
        email: updateSingleEmployee.email || '',
        role: updateSingleEmployee.role || ''
    });

    const [loading, setLoading] = useState(false);
    const [updatedEmployeeData, setUpdatedEmployeeData] = useState([]);
    // console.log(typeof employeeData.role);

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });

    const data = [
        { label: 'Admin', value: 'Admin' },
        { label: 'Collection Manager', value: 'Collection Manager' },
        { label: 'Collection Agent', value: 'Collection Agent' },
        // { label: 'Distributor', value: 'Distributor' },
    ];

    // Handle input changes
    const handleInputChange = (field, value) => {
        setEmployeeData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    // Update API function
    const handleUpdateSubmit = async () => {
        setLoading(true);

        try {
            // const response = await axios.put(`${API_HOST}/updated/${updateSingleEmployee.user_id}`, employeeData);
            const response = await axiosInstance.put(`/updated/${updateSingleEmployee.user_id}`, employeeData);
            setUpdatedEmployeeData(response.data);

            Toast.show({
                type: 'success',
                text1: 'Updated Employee Successfully!',
                // text2: 'This is some something 👋'
            });

            navigation.navigate('DrawerNavigation', { screen: 'ManagerList' });

        } catch (error) {
            console.error('Error updating client:', error);
            // Alert(error.response?.data?.message || 'Failed to update client');
        }
        setLoading(false);
    }

    // const isUpdateButtonDisabled =
    //     !employeeData.username.trim() ||
    //     !employeeData.email.trim() ||
    //     !employeeData.phone_number.trim() ||
    //     !employeeData.role.trim() ||
    //     !employeeData.city.trim();

    const isUpdateButtonDisabled =
        !employeeData.username?.trim() ||
        !employeeData.phone_number?.trim() ||
        (updateSingleEmployee.role !== "Distributor" &&
            (!employeeData.email?.trim() || !employeeData.role?.trim() || !employeeData.city?.trim()));



    return (
        <View style={styles.container}>

            <View style={styles.employeeContainer}>

                <View style={styles.UpdateEmployeeIdContainer}>
                    <Text style={styles.updateEmployeeIdHeading}>{updateSingleEmployee.role} ID:</Text>
                    <Text style={styles.UpdateEmployeeIdText}>{updateSingleEmployee.user_id}</Text>
                </View>

                <View style={styles.UpdateTextInputContainer}>
                    <Text style={styles.updateEmployeeDetailHeading}>{updateSingleEmployee.role} Name:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Employee Name'
                            placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                            selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                            style={styles.textInput}
                            value={employeeData.username}
                            onChangeText={(text) => handleInputChange('username', text)}
                        />
                        {employeeData.username && (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('username', '')}>
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

                {updateSingleEmployee.role !== "Distributor" && (
                    <>
                        <View style={styles.UpdateTextInputContainer}>
                            <Text style={styles.updateEmployeeDetailHeading}>Email:</Text>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    placeholder='Email'
                                    placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                    selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                    style={[styles.textInput, { textTransform: 'lowercase' }]}
                                    value={employeeData.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                />
                                {employeeData.email && (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('email', '')}>
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
                        <View style={[styles.dropdownWrapper, isFocus && { zIndex: 1000 }]}>
                            <Text style={styles.updateEmployeeDetailHeading}>Employee Role:</Text>
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
                                placeholder={"Employee Role"}
                                maxHeight={250}
                                value={employeeData.role}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={item => {
                                    // console.log('Selected:', item.label);
                                    handleInputChange('role', item.value);
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
                    </>
                )}

                <View style={styles.UpdateTextInputContainer}>
                    <Text style={styles.updateEmployeeDetailHeading}>Contact Number:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Contact Number'
                            keyboardType='numeric'
                            placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                            selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                            style={styles.textInput}
                            value={employeeData.phone_number}
                            onChangeText={(text) => handleInputChange('phone_number', text)}
                        />
                        {employeeData.phone_number && (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('phone_number', '')}>
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

                {updateSingleEmployee.role !== "Distributor" && (
                    <View style={styles.UpdateTextInputContainer}>
                        <Text style={styles.updateEmployeeDetailHeading}>City:</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='City'
                                placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={employeeData.city}
                                onChangeText={(text) => handleInputChange('city', text)}
                            />
                            {employeeData.city && (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange('city', '')}>
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
                )}

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.addButton,
                        isUpdateButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                    ]}
                    onPress={handleUpdateSubmit}
                    disabled={isUpdateButtonDisabled}
                >
                    <Text style={styles.addButtonText}>Update</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export default UpdateEmployeeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
        // paddingTop: 15,
    },
    employeeContainer: {
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
    addButton: {
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
    addButtonText: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_WHITE,
        textAlign: 'center',
        padding: 10,
    },
    UpdateEmployeeIdContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        width: Display.setWidth(90),
        height: Display.setHeight(10),
        // borderWidth: 1,
        // paddingHorizontal:10,
        marginVertical: 5
    },
    updateEmployeeIdHeading: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        padding: 5,
    },
    UpdateEmployeeIdText: {
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
    updateEmployeeDetailHeading: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        padding: 5,
    },
})