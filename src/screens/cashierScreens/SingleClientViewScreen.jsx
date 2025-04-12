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

const SingleClientViewScreen = ({ route, navigation }) => {
    const { viewSingleClient, employeesDataList } = route.params; // Extract passed employee data
    // console.log('111111', viewSingleClient);
    // console.log('222222', employeesDataList);

    const distributorName = employeesDataList.find(
        (item) => item.user_id === viewSingleClient.Distributor_id
    );

    const currentCollectionAgentName = employeesDataList.find(
        (item) => item.user_id === viewSingleClient.user_id
    );


    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    const scrollViewRef = useRef();

    useEffect(() => {
        // Reset the scroll position when the screen is loaded
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, []);


    const handleDeleteClient = async () => {
        try {
            // const response = await axios.delete(`${API_HOST}/acc_delete/${viewSingleClient.client_id}`);
            const response = await axiosInstance.delete(`/acc_delete/${viewSingleClient.client_id}`);
            console.log('777777', response.data);

            Toast.show({
                type: 'error',
                text1: 'Deleted Client Successfully!',
                // text2: 'This is some something 👋'
            });

            setDeleteModalVisible(false);
            navigation.navigate('DrawerNavigation', { screen: 'Home' });

        } catch (error) {
            console.error('Error deleting client:', error);
            // Alert(error.response?.data?.message || 'Failed to update client');
        }
    }


    return (
        <View styl={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.clientViewContainer}>

                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Distributor Name :</Text>
                        <Text style={styles.clientViewDetailText}>
                            {distributorName ? distributorName.username : 'UNKNOWN'}
                            {/* {(() => {
                                const distributor = employeesDataList.find(
                                    (item) => item.user_id === viewSingleClient.Distributor_id
                                );
                                return distributor ? distributor.username : 'UNKNOWN';
                            })()} */}
                        </Text>
                    </View>

                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Current Collection Agent Name :</Text>
                        <Text style={styles.clientViewDetailText}>
                            {currentCollectionAgentName ? currentCollectionAgentName.username : 'UNKNOWN'}
                        </Text>
                    </View>

                    <View style={styles.idDateContainer}>
                        <View style={[styles.clientViewDetailContainer, { width: Display.setWidth(40), }]}>
                            <Text style={styles.clientViewDetailHeading}>Client ID :</Text>
                            <Text style={[styles.clientViewDetailText, { width: Display.setWidth(40), }]}>{viewSingleClient.client_id}</Text>
                        </View>
                        <View style={[styles.clientViewDetailContainer, { width: Display.setWidth(40), }]}>
                            <Text style={styles.clientViewDetailHeading}>Date :</Text>
                            <Text style={[styles.clientViewDetailText, { width: Display.setWidth(40), }]}>{viewSingleClient.date}</Text>
                        </View>
                    </View>

                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Client Name :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.client_name}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Client Number :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.client_contact}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Client City :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.client_city}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Status :</Text>
                        <Text style={[styles.clientViewDetailText,
                        {
                            fontFamily: Fonts.POPPINS_SEMI_BOLD,
                            backgroundColor:
                                viewSingleClient.paid_and_unpaid === 0
                                    ? Colors.DEFAULT_DARK_RED
                                    : Colors.DEFAULT_LIGHT_BLUE,

                        }]}>{viewSingleClient.paid_and_unpaid === 0 ? "Unpaid" : "Paid"}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Total Amount :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.amount}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Today Rate :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.today_rate ? viewSingleClient.today_rate : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Account Number :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.accno ? viewSingleClient.accno : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>IFSC Code :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.accno ? viewSingleClient.ifsc_code : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Bank Name :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.accno ? viewSingleClient.bank_name : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Name of Beneficiary :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.accno ? viewSingleClient.name_of_the_beneficiary : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Address of Beneficiary :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.accno ? viewSingleClient.address_of_the_beneficiary : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Account Type :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.accno ? viewSingleClient.accoun_type : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Sender Information :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.accno ? viewSingleClient.sender_information : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Narration :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.accno ? viewSingleClient.narration : 'No Data'}</Text>
                    </View>
                    <View style={styles.clientViewDetailContainer}>
                        <Text style={styles.clientViewDetailHeading}>Bank Type :</Text>
                        <Text style={styles.clientViewDetailText}>{viewSingleClient.bank_type ? viewSingleClient.bank_type : 'No Data'}</Text>
                    </View>

                    {/* {viewSingleClient.bank_type === 'bank1' && (
                        <View style={styles.clientViewDetailContainer}>
                            <Text style={styles.clientViewDetailHeading}>Narration:</Text>
                            <Text style={[styles.clientViewDetailText, { textTransform: 'uppercase' }]}>{viewSingleClient.narration ? viewSingleClient.narration : 'No Data'}</Text>
                        </View>
                    )} */}

                    {/* {viewSingleClient.bank_type === 'bank2' && (
                        <>
                            <View style={styles.clientViewDetailContainer}>
                                <Text style={styles.clientViewDetailHeading}>Bank Name:</Text>
                                <Text style={[styles.clientViewDetailText, { textTransform: 'uppercase' }]}>{viewSingleClient.bank_name ? viewSingleClient.bank_name : 'No Data'}</Text>
                            </View>
                            <View style={styles.clientViewDetailContainer}>
                                <Text style={styles.clientViewDetailHeading}>IFSC Code:</Text>
                                <Text style={styles.clientViewDetailText}>{viewSingleClient.ifsc_code ? viewSingleClient.ifsc_code : 'No Data'}</Text>
                            </View>
                            <View style={styles.clientViewDetailContainer}>
                                <Text style={styles.clientViewDetailHeading}>Name of the Beneficiary:</Text>
                                <Text style={styles.clientViewDetailText}>{viewSingleClient.name_of_the_beneficiary ? viewSingleClient.name_of_the_beneficiary : 'No Data'}</Text>
                            </View>
                            <View style={styles.clientViewDetailContainer}>
                                <Text style={styles.clientViewDetailHeading}>Address of the Beneficiary:</Text>
                                <Text style={styles.clientViewDetailText}>{viewSingleClient.address_of_the_beneficiary ? viewSingleClient.address_of_the_beneficiary : 'No Data'}</Text>
                            </View>
                            <View style={styles.clientViewDetailContainer}>
                                <Text style={styles.clientViewDetailHeading}>Account Type:</Text>
                                <Text style={[styles.clientViewDetailText, { textTransform: 'uppercase' }]}>{viewSingleClient.accoun_type ? viewSingleClient.accoun_type : 'No Data'}</Text>
                            </View>
                            <View style={styles.clientViewDetailContainer}>
                                <Text style={styles.clientViewDetailHeading}>Sender Information:</Text>
                                <Text style={styles.clientViewDetailText}>{viewSingleClient.sender_information ? viewSingleClient.sender_information : 'No Data'}</Text>
                            </View>
                        </>
                    )} */}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.editButton}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('UpdateClient',
                                {
                                    updateSingleClient: viewSingleClient,
                                    distributorName: distributorName,
                                    changeDistributorSingleClient: employeesDataList
                                }
                            )}
                        >
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.paymentListButton}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('SingleClientPaymentList', { clientPaymentList: viewSingleClient })}
                        >
                            <Text style={styles.editButtonText}>Payment List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            activeOpacity={0.8}
                            onPress={() => setDeleteModalVisible(true)}
                        >
                            <Text style={styles.editButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>

            <Modal animationType="slide" transparent={true} visible={deleteModalVisible}>
                <View style={styles.deleteModalConatiner}>
                    <View style={styles.deleteModal}>
                        <Text style={styles.deleteModalHeading}>Confirm Deletion</Text>
                        <Text style={styles.deleteModalText}>Are you sure want to delete the client{' '}
                            <Text style={styles.deleteModalClientName}>
                                " {viewSingleClient.client_name} "
                            </Text>
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setDeleteModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} onPress={handleDeleteClient}>
                                <Text style={styles.deleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default SingleClientViewScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    scrollContainer: {
        flexGrow: 2,
        paddingBottom: 40,
    },
    clientViewContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        paddingBottom: 40,
    },
    idDateContainer: {
        // borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    clientViewDetailContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        width: Display.setWidth(90),
        height: Display.setHeight(12),
        // borderWidth: 1,
        // marginVertical: 5,
        paddingVertical: 10
    },
    clientViewDetailHeading: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        padding: 5,
    },
    clientViewDetailText: {
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
    buttonContainer: {
        // flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
        // width: Display.setWidth(90),
        // borderWidth: 1,
        marginVertical: 15,
    },
    editButton: {
        backgroundColor: Colors.DEFAULT_GREEN,
        borderRadius: 30,
        marginVertical: 10,
    },
    editButtonText: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_WHITE,
        textAlign: 'center',
        paddingVertical: 15,
        paddingHorizontal: 50
    },
    paymentListButton: {
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 30,
        marginVertical: 10,
    },
    deleteButton: {
        backgroundColor: Colors.DEFAULT_DARK_RED,
        borderRadius: 30,
        marginVertical: 10,
    },
    deleteButtonText: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_WHITE,
        textAlign: 'center',
        paddingVertical: 15,
        paddingHorizontal: 50
    },
    deleteModalConatiner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    deleteModal: {
        margin: 20,
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        borderRadius: 20,
        padding: 30,
        // alignItems: 'center',
        width: Display.setWidth(90),
        height: Display.setHeight(30),
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
    deleteModalHeading: {
        marginBottom: 15,
        fontSize: 22,
        lineHeight: 22 * 1.4,
        fontFamily: Fonts.POPPINS_BOLD,
        color: Colors.DEFAULT_DARK_GRAY,
        textDecorationLine: 'underline'
    },
    deleteModalText: {
        marginBottom: 15,
        fontSize: 16,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_BLACK,
    },
    deleteModalClientName: {
        color: Colors.DEFAULT_DARK_RED,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
    },
    modalButtonContainer: {
        // borderWidth:1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 30,
        marginTop: 5
    },
    cancelText: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_REGULAR,
        padding: 10,
        color: Colors.DEFAULT_DARK_GRAY,
    },
    deleteText: {
        fontSize: 20,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        padding: 10,
        color: Colors.DEFAULT_DARK_RED,
    }
})