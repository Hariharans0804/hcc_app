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

const AddNewEmployeeScreen = ({ navigation }) => {
    const [isFocus, setIsFocus] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [employeeCity, setEmployeeCity] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');
    const [employeePassword, setEmployeePassword] = useState('');
    const [employeeRole, setEmployeeRole] = useState('');
    const [newEmployeeData, setNewEmployeeData] = useState([]);
    // console.log('newEmployeeData', newEmployeeData);



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

    const fetchAddNewEmployee = async () => {
        // if (employeeName && employeeNumber && employeeCity && employeeEmail && employeePassword && employeeRole > 0) {
        if (!employeeName || !employeeNumber || !employeeCity || !employeeEmail || !employeePassword || !employeeRole) {
            return Alert.alert('Error', 'All fields are required.');
        }

        try {
            const addNewEmployeeData = {
                username: employeeName,
                phone_number: employeeNumber,
                city: employeeCity,
                email: employeeEmail,
                password: employeePassword,
                role: employeeRole
            };

            // const response = await axios.post(`${API_HOST}/signup`,
            const response = await axiosInstance.post(`/signup`,
                addNewEmployeeData,
            );
            setNewEmployeeData(response.data);
            console.log('333333333', response.data);

            Toast.show({
                type: 'success',
                text1: 'New Employee Added Successfully!',
                // text2: 'This is some something 👋'
            });

            navigation.navigate('DrawerNavigation', { screen: 'ManagerList' });

            setEmployeeName('');
            setEmployeeNumber('');
            setEmployeeCity('');
            setEmployeeEmail('');
            setEmployeePassword('');
            setEmployeeRole('');

        } catch (error) {
            // console.log('00000000000', error.message);
            console.error('Error adding new employee:', error.response ? error.response.data : error.message);
            Alert.alert('Error', error.response?.data?.message || 'An unexpected error occurred.');
            setLoading(false); // Hide loader on error
        }
    }
    // }

    // const isAddButtonDisabled = !(employeeName && employeeNumber && employeeCity && employeeEmail && employeePassword && employeeRole > 0);
    const isAddButtonDisabled = !employeeName || !employeeNumber || !employeeCity || !employeeEmail || !employeePassword || !employeeRole;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <View style={styles.employeeContainer}>
                <View style={styles.textInputContainer}>
                    <TextInput
                        placeholder='Employee Name'
                        placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                        selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                        style={styles.textInput}
                        value={employeeName}
                        onChangeText={setEmployeeName}
                    />
                    {employeeName && (
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setEmployeeName('')}>
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
                        value={employeeNumber}
                        onChangeText={setEmployeeNumber}
                    />
                    {employeeNumber && (
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setEmployeeNumber('')}>
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
                        value={employeeCity}
                        onChangeText={setEmployeeCity}
                    />
                    {employeeCity && (
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setEmployeeCity('')}>
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
                        placeholder='Email'
                        placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                        selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                        style={[styles.textInput, { textTransform: 'lowercase' }]}
                        value={employeeEmail}
                        onChangeText={setEmployeeEmail}
                    />
                    {employeeEmail && (
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setEmployeeEmail('')}>
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
                        placeholder='Password'
                        placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
                        selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                        style={styles.textInput}
                        value={employeePassword}
                        onChangeText={setEmployeePassword}
                    />
                    {employeePassword && (
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setEmployeePassword('')}>
                            <AntDesign
                                name="closecircleo"
                                size={20}
                                color={Colors.DEFAULT_DARK_GRAY}
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* DROPDOWN BELOW TEXT INPUT */}
                <View style={[styles.dropdownWrapper, isFocus && { zIndex: 1000 }]}>
                    <Dropdown
                        style={[styles.dropdown, isFocus && { borderColor: Colors.DEFAULT_LIGHT_BLUE }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        containerStyle={{ marginTop: 30, borderRadius: 8 }}
                        data={data}
                        // search
                        // searchPlaceholder="Search..."
                        labelField="label"
                        valueField="value"
                        placeholder={!employeeRole ? "Employee Role" : ""}
                        maxHeight={250}
                        value={employeeRole}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={item => {
                            // console.log('Selected:', item.label);
                            setEmployeeRole(item.value);
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
                        styles.addButton,
                        isAddButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                    ]}
                    onPress={fetchAddNewEmployee}
                    disabled={isAddButtonDisabled}
                >
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export default AddNewEmployeeScreen

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
    }
})


// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, StyleSheet } from 'react-native';
// import axios from 'axios';
// import { Dropdown } from 'react-native-element-dropdown';
// import Toast from 'react-native-toast-message';
// import { AntDesign } from '@expo/vector-icons';

// const axiosInstance = axios.create({
//     baseURL: API_HOST,
//     timeout: 5000, // Set timeout to 5 seconds
// });

// const AddNewEmployeeScreen = ({ navigation }) => {
//     const [isFocus, setIsFocus] = useState(false);
//     const [form, setForm] = useState({
//         name: '',
//         number: '',
//         city: '',
//         email: '',
//         password: '',
//         role: ''
//     });

//     const data = [
//         { label: 'Admin', value: 'admin' },
//         { label: 'Manager', value: 'manager' },
//         { label: 'Agent', value: 'agent' }
//     ];

//     const handleInputChange = (key, value) => {
//         setForm(prev => ({ ...prev, [key]: value }));
//     };

//     const fetchAddNewEmployee = async () => {
//         const { name, number, city, email, password, role } = form;

//         if (!name || !number || !city || !email || !password || !role) {
//             Alert.alert('Error', 'All fields are required.');
//             return;
//         }

//         try {
//             const addNewEmployeeData = {
//                 username: name,
//                 phone_number: number,
//                 city,
//                 email,
//                 password,
//                 role
//             };

//             const response = await axiosInstance.post('/signup', addNewEmployeeData);

//             Toast.show({
//                 type: 'success',
//                 text1: 'New Employee Added Successfully!'
//             });

//             navigation.navigate('ManagerList');
//             setForm({ name: '', number: '', city: '', email: '', password: '', role: '' });

//         } catch (error) {
//             console.error('Error adding new employee:', error.response?.data || error.message);
//             Alert.alert('Error', error.response?.data?.message || 'An unexpected error occurred.');
//         }
//     };

//     const isAddButtonDisabled = !Object.values(form).every(value => value);

//     return (
//         <View style={styles.container}>
//             <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" translucent />

//             <View style={styles.clientContainer}>
//                 {['name', 'number', 'city', 'email', 'password'].map((field, index) => (
//                     <View key={index} style={styles.textInputContainer}>
//                         <TextInput
//                             placeholder={`Enter ${field.charAt(0).toUpperCase() + field.slice(1)}`}
//                             placeholderTextColor="#93C5FD"
//                             selectionColor="#93C5FD"
//                             style={styles.textInput}
//                             value={form[field]}
//                             onChangeText={(value) => handleInputChange(field, value)}
//                             keyboardType={field === 'number' ? 'numeric' : 'default'}
//                             secureTextEntry={field === 'password'}
//                         />
//                         {form[field] && (
//                             <TouchableOpacity activeOpacity={0.8} onPress={() => handleInputChange(field, '')}>
//                                 <AntDesign name="closecircleo" size={20} color="#6B7280" style={{ marginLeft: 10 }} />
//                             </TouchableOpacity>
//                         )}
//                     </View>
//                 ))}

//                 <View style={[styles.dropdownWrapper, isFocus && { zIndex: 1000 }]}>
//                     <Dropdown
//                         style={[styles.dropdown, isFocus && { borderColor: '#93C5FD' }]}
//                         placeholderStyle={styles.placeholderStyle}
//                         selectedTextStyle={styles.selectedTextStyle}
//                         inputSearchStyle={styles.inputSearchStyle}
//                         iconStyle={styles.iconStyle}
//                         containerStyle={{ marginTop: 30 }}
//                         data={data}
//                         labelField="label"
//                         valueField="value"
//                         placeholder={!form.role ? "Select Role" : ""}
//                         maxHeight={250}
//                         value={form.role}
//                         onFocus={() => setIsFocus(true)}
//                         onBlur={() => setIsFocus(false)}
//                         onChange={item => {
//                             handleInputChange('role', item.value);
//                             setIsFocus(false);
//                         }}
//                         renderLeftIcon={() => (
//                             <AntDesign name="Safety" size={20} color="#1E3A8A" style={{ marginRight: 5 }} />
//                         )}
//                     />
//                 </View>

//                 <TouchableOpacity
//                     activeOpacity={0.8}
//                     style={[
//                         styles.addButton,
//                         isAddButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
//                     ]}
//                     onPress={fetchAddNewEmployee}
//                     disabled={isAddButtonDisabled}
//                 >
//                     <Text style={styles.addButtonText}>Add</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FFFFFF',
//     },
//     clientContainer: {
//         paddingHorizontal: 20,
//         paddingVertical: 10
//     },
//     textInputContainer: {
//         borderWidth: 1,
//         borderColor: '#E5E7EB',
//         backgroundColor: '#E5E7EB',
//         borderRadius: 8,
//         marginVertical: 10,
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     textInput: {
//         flex: 1,
//         height: 50,
//         paddingHorizontal: 10,
//         fontSize: 16,
//         color: '#000000',
//         textTransform: 'capitalize'
//     },
//     dropdownWrapper: {
//         position: 'relative',
//         zIndex: 1, // Prevents dropdown from being hidden
//     },
//     dropdown: {
//         marginVertical: 10,
//         borderWidth: 1,
//         borderColor: '#E5E7EB',
//         borderRadius: 8,
//         paddingHorizontal: 12,
//         height: 50,
//         backgroundColor: '#E5E7EB',
//     },
//     placeholderStyle: {
//         fontSize: 16,
//         color: '#1E3A8A'
//     },
//     selectedTextStyle: {
//         fontSize: 16,
//         color: '#000000'
//     },
//     addButton: {
//         marginVertical: 15,
//         borderRadius: 30,
//         padding: 10,
//         alignItems: 'center'
//     },
//     buttonEnabled: {
//         backgroundColor: '#1E3A8A',
//     },
//     buttonDisabled: {
//         backgroundColor: '#6B7280',
//     },
//     addButtonText: {
//         fontSize: 20,
//         color: '#FFFFFF',
//     }
// });

// export default AddNewEmployeeScreen;
