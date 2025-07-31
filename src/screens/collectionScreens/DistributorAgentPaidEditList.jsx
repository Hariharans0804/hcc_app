import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { getFromStorage } from '../../utils/mmkvStorage';
import axios from 'axios';
import { API_HOST } from "@env";
import { Colors, Fonts } from '../../constants';
import Toast from 'react-native-toast-message';


const DistributorAgentPaidEditList = ({ route, navigation }) => {

    const { editClient } = route.params; // Extract passed edit client data
    // console.log('editClient', editClient);

    const [paidList, setPaidList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [distributorList, setDistributorList] = useState([]);

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    const handleRemovePayment = async (entryId) => {
        console.log(entryId);

        try {
            const response = await axiosInstance.delete(`/collection/paid/delete/${entryId}`);
            console.log('deleted', response.data);

            Toast.show({
                type: 'success',
                text1: 'Client Amount Remove Successfully!',
                position: 'top',
            });

            fetchDistributorTotalAmount();

        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
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


            const paidAmountDetails = response.data.filter((item) => item.type === 'paid' && item?.Distributor_id === editClient?.Distributor_id);
            console.log('paid', paidAmountDetails);
            setPaidList(paidAmountDetails);


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


    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                // await fetchCollectionDataList();
                await fetchDistributorTotalAmount();
                await fetchEmployeesData();
            };
            loadData();
        }, [])
    );


    const distributorName = distributorList.find((dis) => dis.user_id === editClient.Distributor_id)?.username || 'Not Found';

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={{ paddingBottom: 50, paddingTop: 10 }}>
                    <Text style={styles.headingText}>Distributor Name : <Text style={styles.detailsText}>{distributorName}</Text></Text>
                    <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Payments History :</Text>

                    <View style={styles.amountDateHeadingContainer}>
                        <Text style={[styles.amountDateHeading, { flex: 1.5 }]}>Date</Text>
                        <Text style={[styles.amountDateHeading, { flex: 2 }]}>Amount</Text>
                        <Text style={[styles.amountDateHeading, { flex: 1.2 }]}>Status</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator
                            size='large'
                            color={Colors.DEFAULT_DARK_BLUE}
                            style={{ marginTop: 20, }}
                        />
                    ) : paidList.length > 0 ? (
                        paidList.map((entry, index) => {
                            const localPaidAmount = entry.paidamount / (parseFloat(entry.today_rate) || 1);
                            return (
                                <View key={index} style={styles.amountDateDetailsRow}>
                                    <Text style={[styles.amountDateDetails, { flex: 1.5 }]}>{entry.colldate}</Text>
                                    <Text style={[styles.amountDateDetails, { flex: 2 }]}>
                                        LOCAL : {parseFloat(entry.paidamount).toFixed(3)}
                                        {/* {"\n"}
                                    INRER : {localPaidAmount.toFixed(3)} */}
                                    </Text>

                                    <TouchableOpacity
                                        style={[styles.removeButton, { flex: 1.2 }]}
                                        activeOpacity={0.8}
                                        onPress={() => handleRemovePayment(entry.id)}
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

export default DistributorAgentPaidEditList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
        paddingBottom: 10
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
        fontSize: 13,
        lineHeight: 13 * 1.4,
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
        fontSize: 12,
        lineHeight: 12 * 1.4,
        textAlign: 'center',
        padding: 10,
        color: Colors.DEFAULT_WHITE,
    }
})