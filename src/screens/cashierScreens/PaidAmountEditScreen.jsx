import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors, Fonts } from '../../constants';
import axios from 'axios';
import { API_HOST } from "@env";
import Toast from 'react-native-toast-message';

const PaidAmountEditScreen = ({ route, navigation }) => {
    const { editClient } = route.params; // Extract passed edit client data
    // console.log('editClient', editClient);

    const [paymentData, setPaymentData] = useState(editClient.paid_amount_date || []);
    console.log('paymentData', paymentData);

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    const handleRemovePayment = async (indexToRemove) => {
        // console.log(indexToRemove);

        try {
            const today = new Date();
            const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

            const updatedData = paymentData.filter((_, index) => index !== indexToRemove);
            setPaymentData(updatedData);

            const newPaymentsList = {
                paid_amount_time: today,
                paid_amount_date: updatedData,
                paid_and_unpaid: false,
            }

            const response = await axiosInstance.put(`/acc_updated/${editClient.client_id}`,
                newPaymentsList,
                { headers: { 'Content-Type': 'application/json' } }
            );

            Toast.show({
                type: 'success',
                text1: 'Client Amount Remove Successfully!',
                position: 'top',
            });

        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
        }
    };


    const confirmRemovePayment = (index) => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to remove this payment entry?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Remove",
                    onPress: () => handleRemovePayment(index),
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={{ paddingBottom: 50, paddingTop: 10 }}>
                    <Text style={styles.headingText}>Clinet Name : <Text style={styles.detailsText}>{editClient.client_name}</Text></Text>
                    <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Payments History :</Text>


                    <View style={styles.amountDateHeadingContainer}>
                        <Text style={[styles.amountDateHeading, { flex: 2 }]}>Date</Text>
                        <Text style={[styles.amountDateHeading, { flex: 2 }]}>Amount</Text>
                        <Text style={[styles.amountDateHeading, { flex: 1.5 }]}>Status</Text>
                    </View>

                    {Array.isArray(paymentData) && paymentData.length > 0 ? (
                        paymentData.map((entry, index) => {
                            const localPaidAmount = entry.amount / (parseFloat(editClient.today_rate) || 1);
                            return (
                                <View key={index} style={styles.amountDateDetailsRow}>
                                    <Text style={[styles.amountDateDetails, { flex: 2 }]}>{entry.date}</Text>
                                    <Text style={[styles.amountDateDetails, { flex: 2 }]}>
                                        INTER : {entry.amount.toFixed(2)}
                                        {"\n"}
                                        LOCAL : {localPaidAmount.toFixed(3)}
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.removeButton, { flex: 1.5 }]}
                                        activeOpacity={0.8}
                                        onPress={() => confirmRemovePayment(index)}
                                    >
                                        <Text style={styles.removeButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        })
                    ) : (
                        <View style={styles.amountDateDetailsRow}>
                            <Text style={[styles.amountDateDetails, { flex: 2 }]}>-</Text>
                            <Text style={[styles.amountDateDetails, { flex: 2 }]}>-</Text>
                            <Text style={[styles.amountDateDetails, { flex: 1.5 }]}>No Active</Text>
                        </View>
                    )}

                </View>
            </ScrollView>
        </View>
    )
}

export default PaidAmountEditScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
        // padding: 20,
        // paddingVertical: 10,
        // paddingTop:5,
        paddingBottom: 10
        // alignItems: 'center',
        // borderWidth:1
    },
    headingText: {
        fontSize: 17,
        lineHeight: 17 * 1.4,
        color: Colors.DEFAULT_LIGHT_BLUE,
        marginVertical: 5,
        fontFamily: Fonts.POPPINS_MEDIUM,
        marginHorizontal: 20,
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        // textAlign:'center'
    },
    detailsText: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        fontFamily: Fonts.POPPINS_EXTRA_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        textTransform: 'capitalize'
    },
    amountDateHeadingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        // marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 10,
        borderColor: Colors.DEFAULT_GREEN,
        backgroundColor: Colors.DEFAULT_GREEN,
        borderRadius: 8,
        marginHorizontal: 20,
    },
    amountDateHeading: {
        // flex: 1,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,  // Change to the correct font if needed
        fontSize: 16,
        lineHeight: 16 * 1.4,
        textAlign: 'center',
        color: Colors.DEFAULT_WHITE,
        //   borderWidth: 1,
    },
    amountDateDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        borderRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.DEFAULT_WHITE, // Optional: separator line
        marginHorizontal: 20,
        marginVertical: 5
    },
    amountDateDetails: {
        flex: 1,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,  // Change to the correct font if needed
        fontSize: 14,
        lineHeight: 14 * 1.4,
        textAlign: 'center',
        color: Colors.DEFAULT_DARK_BLUE,
        // borderWidth: 1
    },
    removeButton: {
        backgroundColor: Colors.DEFAULT_DARK_RED,
        borderRadius: 20,
    },
    removeButtonText: {
        fontFamily: Fonts.POPPINS_SEMI_BOLD,  // Change to the correct font if needed
        fontSize: 14,
        lineHeight: 14 * 1.4,
        textAlign: 'center',
        padding: 10,
        color: Colors.DEFAULT_WHITE,
    }
})