import { ActivityIndicator, Alert, Animated, FlatList, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Colors, Fonts } from '../constants';
import { getFromStorage } from '../utils/mmkvStorage';
import { API_HOST } from "@env";

const SingleEmployeeDetailsComponent = ({ employee, navigation }) => {
    // const { employee } = props; // Extract passed employee data
    // console.log('222222', employee.role);


    const [agentClientsData, setAgentClientsData] = useState([]);
    const [workersData, setWorkersData] = useState([])
    const [loading, setLoading] = useState(true);

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    const fetchSingleEmployeeClientsData = async () => {
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
            // const response = await axios.get(`${API_HOST}/acc_list`, {
            const response = await axiosInstance.get('/acc_list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            const singleEmployeeClientsData = response.data.filter((item) =>
                item.user_id === employee.user_id
            );

            // const singleAgentCollectionLists = response.data.map((item) => ({
            //     ...item,
            //     paid_amount_date: item.paid_amount_date.filter((payment) => payment.userID === employee.user_id)
            // }));

            const singleDistributorClientists = response.data
                .filter(
                    (item) => item.Distributor_id === employee.user_id
                );

            const singleAgentClientLists = response.data
                .map((item) => ({
                    ...item,
                    paid_amount_date: item.paid_amount_date?.filter(
                        (payment) => payment.userID === employee.user_id
                    ) || [],
                }))
                .filter((item) => item.paid_amount_date.length > 0); // Only keep items where the filtered array is not empty

            setWorkersData([...singleAgentClientLists, ...singleDistributorClientists]);
            // console.log('---------', singleDistributorClientists);
            // console.log('Filtered Employee Clients Data:', singleAgentCollectionLists);

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
            fetchSingleEmployeeClientsData();
        }, [])
    )

    const renderItem = ({ item, index }) => {
        return (
            <View style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{item.client_id}</Text>
                <Text style={[styles.cell, { flex: 3 }]}>
                    {(item.client_name || '').replace(/"/g, '')}
                    {"\n"}
                    <Text style={styles.cityText}>{item.client_city || ''}</Text>
                </Text>
                <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
                <View style={[styles.buttonContainer, { flex: 2 }]}>
                    <TouchableOpacity
                        style={styles.viewButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('SingleClientDetails', { client: item, employeeName: employee.username, employeeRole: employee.role })} // Pass client details
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
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.heading, { flex: 1 }]}>No</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Name</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Mobile</Text>
                <Text style={[styles.heading, { flex: 2 }]}>Details</Text>
            </View>

            {/* Data Loading and Display */}
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="blue"
                    style={{ marginTop: 20, }}
                />
            ) : workersData.length === 0 ? (
                <Text style={styles.emptyText}>We haven't separated the customers for you yet!</Text>
            ) : (
                <FlatList
                    data={workersData}
                    keyExtractor={(item) => item.client_id?.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.flatListContainer}
                />
            )}
        </View>
    )
}

export default SingleEmployeeDetailsComponent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
        // padding: 20
        paddingTop: 5,
        paddingBottom: 10,
        // alignItems: 'center',
        // borderWidth:1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        marginHorizontal: 10,
        marginTop: 10,
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
    flatListContainer: {
        paddingBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
        marginHorizontal: 10,
        elevation: 1,
        borderRadius: 8,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        padding: 10,
        borderWidth: 1
    },
    cell: {
        flex: 1,
        fontSize: 14,
        lineHeight: 14 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    cityText: {
        fontFamily: Fonts.POPPINS_MEDIUM,
        fontSize: 12,
        lineHeight: 12 * 1.4,
        color: '#8898A9'
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEEC37',
        padding: 10,
        borderRadius: 25
    },
    emptyText: {
        fontSize: 16,
        lineHeight: 16 * 1.4,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        marginVertical: 10,
        color: Colors.DEFAULT_DARK_RED
    }
})