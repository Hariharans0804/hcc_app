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
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import moment from 'moment';

const DistributorHistory = () => {

    const [selectedCategory, setSelectedCategory] = useState('collection');
    const [loading, setLoading] = useState(true);
    const [employeesData, setEmployeesData] = useState([]);
    const [distributorList, setDistributorList] = useState([]);
    const [agentList, setAgentList] = useState([]);
    const [historyDataList, setHistoryDataList] = useState([]);
    const [filteredHistoryDataList, setFilteredHistoryDataList] = useState([]);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [displayDate, setDisplayDate] = useState(moment().subtract(1, "days").format('DD-MM-YYYY'));

    const currentDate = moment().format('DD-MM-YYYY');

    const isCalendarOkButtonDisabled = !selectedDate;

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });

    const toggleCalendar = () => {
        setIsCalendarVisible(!isCalendarVisible);
    }

    const handleCancelCalendar = () => {
        setIsCalendarVisible(false);
    }

    const handleClearDates = () => {
        const yesterday = moment().subtract(1, 'days').format('DD-MM-YYYY');
        setSelectedDate('');
        setDisplayDate(yesterday); // Reset to yesterday's date
        // const filtered = historyDataList.filter(item => item.type === selectedCategory);
        // setFilteredHistoryDataList(filtered);
    }


    const handleConfirmDateSelection = () => {
        if (!selectedDate) return;

        const formattedDate = moment(selectedDate).format('DD-MM-YYYY');

        setDisplayDate(formattedDate);
        setIsCalendarVisible(false);
    };


    useEffect(() => {
        if (historyDataList && selectedCategory && displayDate) {
            const filtered = historyDataList.filter(
                item =>
                    item.type === selectedCategory &&
                    moment(item.colldate, 'DD-MM-YYYY').format('DD-MM-YYYY') === displayDate
            );
            setFilteredHistoryDataList(filtered);
        }
    }, [historyDataList, selectedCategory, displayDate]);


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

            // Axios GET request
            // const response = await axios.get(`${API_HOST}/list`, {
            const response = await axiosInstance.get('/list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            //  Agent Lidt
            const collectionAgentList = response.data
                .filter((item) => item.role === "Collection Agent")
                .map((item) => ({
                    label: item.username,
                    value: item.user_id,
                }));

            // Distributor List
            const collectionDistributorList = response.data.filter((item) => item.role === 'Distributor');

            setEmployeesData(response.data);
            setAgentList(collectionAgentList);
            setDistributorList(collectionDistributorList);
            // console.log(collectionDistributorList);
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
    }


    const fetchHistoryDataList = async () => {
        try {
            const storedToken = await getFromStorage('token');

            if (!storedToken) {
                console.error('No token found in storage.');
                return;
            }

            const authorization = storedToken;
            // setLoading(true);

            const response = await axiosInstance.get('/collection/getamount', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization,
                },
            });


            setHistoryDataList(response.data);
            console.log('full data', response.data);

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
            // setLoading(false);
        }
    }

    // Combine both fetches with loading states
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setLoading(true);
                await Promise.all([fetchEmployeesData(), fetchHistoryDataList()]);
                setLoading(false);
            };
            fetchData();
        }, [])
    )


    // useEffect(() => {
    //     if (historyDataList && selectedCategory) {
    //         const filtered = historyDataList.filter(item => item.type === selectedCategory);
    //         setFilteredHistoryDataList(filtered);
    //     }
    // }, [historyDataList, selectedCategory]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        const yesterday = moment().subtract(1, 'days').format('DD-MM-YYYY');
        setDisplayDate(yesterday);
        setSelectedDate('');
    };

    const renderItem = ({ item, index }) => {

        const distributorName = distributorList.find((dis) => dis.user_id === item.Distributor_id)?.username || 'Not Found';
        const agentName = agentList.find((age) => age.value === item.agent_id)?.label || 'Not Found';

        let interValue = 0;

        if (item.type === 'collection' && Array.isArray(item.collamount)) {
            interValue = parseFloat(item.collamount[0] || 0);
            // localValue = interValue / rate;
        } else if (item.type === 'paid' && Array.isArray(item.paidamount)) {
            interValue = parseFloat(item.paidamount[0] || 0);
            // localValue = interValue / rate;
        }

        return (
            <View style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
                <View style={{ flex: 3, alignItems: 'center' }}>
                    <Text style={[styles.cell, /*{ flex: 3 }*/]} numberOfLines={1}>{distributorName}</Text>
                    <Text style={styles.cityText} numberOfLines={1}>{item.type}</Text>
                </View>
                {selectedCategory === 'paid' && (
                    <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{agentName}</Text>
                )}
                <Text style={[styles.cell, { flex: 3 }]}>
                    <Text style={{ textTransform: 'uppercase', color: Colors.DEFAULT_DARK_BLUE, }} numberOfLines={1}>local : {interValue.toFixed(3)}</Text>{"\n"}
                    <Text style={styles.cityText} numberOfLines={1}>{item.colldate}</Text>
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <View style={styles.collectionPaidContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCategoryClick('collection')}
                        style={[
                            styles.collectionButton,
                            {
                                backgroundColor: selectedCategory === 'collection' ? Colors.DEFAULT_LIGHT_BLUE : Colors.DEFAULT_LIGHT_WHITE,
                                borderWidth: selectedCategory !== 'collection' ? 1 : 0,
                                borderColor: selectedCategory !== 'collection' && Colors.DEFAULT_LIGHT_BLUE,
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.collectionButtonText,
                                { color: selectedCategory === 'collection' ? Colors.DEFAULT_LIGHT_WHITE : Colors.DEFAULT_LIGHT_BLUE }
                            ]}
                        >Collection</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCategoryClick('paid')}
                        style={[
                            styles.collectionButton,
                            {
                                backgroundColor: selectedCategory === 'paid' ? Colors.DEFAULT_LIGHT_BLUE : Colors.DEFAULT_LIGHT_WHITE,
                                borderWidth: selectedCategory !== 'paid' ? 1 : 0,
                                borderColor: selectedCategory !== 'paid' && Colors.DEFAULT_LIGHT_BLUE,
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.collectionButtonText,
                                { color: selectedCategory === 'paid' ? Colors.DEFAULT_LIGHT_WHITE : Colors.DEFAULT_LIGHT_BLUE }
                            ]}
                        >Paid</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={[styles.dateText,
                    {
                        backgroundColor:
                            displayDate === moment().subtract(1, "days").format("DD-MM-YYYY")
                                ? Colors.DEFAULT_LIGHT_BLUE  // Blue for today
                                : Colors.DEFAULT_DARK_RED,        // Red for selected date
                    }]}>{displayDate}</Text>
                    <TouchableOpacity style={styles.filterButton} activeOpacity={0.8} onPress={toggleCalendar}>
                        <FontAwesome
                            name="sliders"
                            size={18}
                            color={Colors.DEFAULT_BLACK}
                            style={{ color: Colors.DEFAULT_LIGHT_WHITE }}
                        />
                    </TouchableOpacity>
                </View>
            </View>


            {/* Calendar Modal */}
            <Modal visible={isCalendarVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.calendarContainer}>
                        <Calendar
                            style={{
                                // borderWidth: 1,
                                borderColor: 'gray',
                                // height: 355
                                height: Display.setHeight(45.5)
                            }}
                            onDayPress={day => {
                                setSelectedDate(day.dateString);
                            }}
                            markedDates={{
                                [selectedDate || displayDate]: { selected: true, marked: true, disableTouchEvent: true, selectedColor: Colors.DEFAULT_LIGHT_BLUE, }
                            }}
                        />

                        <View style={styles.calendarButtonContainer}>
                            <TouchableOpacity style={styles.calendarButton} onPress={handleClearDates} activeOpacity={0.8}>
                                <Text style={[
                                    styles.calendarText,
                                    {
                                        color: Colors.DEFAULT_LIGHT_BLUE,
                                        borderWidth: 2,
                                        borderColor: Colors.DEFAULT_LIGHT_BLUE,
                                        borderRadius: 10
                                    }
                                ]}>Clear Dates</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.calendarButton} onPress={handleCancelCalendar} activeOpacity={0.8}>
                                <Text style={[styles.calendarText, { color: Colors.DEFAULT_DARK_GRAY }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.calendarButton}
                                activeOpacity={0.8}
                                onPress={handleConfirmDateSelection}
                                disabled={isCalendarOkButtonDisabled}
                            >
                                <Text
                                    style={[styles.calendarText,
                                    {
                                        color: isCalendarOkButtonDisabled
                                            ? Colors.DEFAULT_DARK_GRAY : Colors.DEFAULT_DARK_BLUE
                                    }
                                    ]}
                                >OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {selectedCategory === 'collection' && (
                <View style={styles.collectionHeader}>
                    <Text style={[styles.heading, { flex: 1 }]}>No</Text>
                    <Text style={[styles.heading, { flex: 3 }]}>Distributor</Text>
                    <Text style={[styles.heading, { flex: 3 }]}>Amount</Text>
                </View>
            )}
            {selectedCategory === 'paid' && (
                <View style={styles.paidHeader}>
                    <Text style={[styles.heading, { flex: 1 }]}>No</Text>
                    <Text style={[styles.heading, { flex: 3 }]}>Distributor</Text>
                    <Text style={[styles.heading, { flex: 3 }]}>Agent</Text>
                    <Text style={[styles.heading, { flex: 3 }]}>Amount</Text>
                </View>
            )}

            {loading ? (
                <ActivityIndicator
                    size='large'
                    color={Colors.DEFAULT_DARK_BLUE}
                    style={{ marginTop: 20, }}
                />
            ) : filteredHistoryDataList.length > 0 ? (
                <FlatList
                    data={filteredHistoryDataList}
                    keyExtractor={(item) => item.id?.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.flatListContainer}
                />
            ) : (
                <Text style={styles.emptyText}>No one paid yesterday!</Text>
            )}

        </View>
    )
}

export default DistributorHistory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    collectionPaidContainer: {
        // borderWidth: 1,
        marginHorizontal: 15,
        marginVertical: 10,
        // marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    collectionButton: {
        // backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 8,
        // padding: 10,
    },
    collectionButtonText: {
        fontSize: 12,
        lineHeight: 12 * 1.4,
        // color: Colors.DEFAULT_WHITE,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        paddingVertical: 10,
        paddingHorizontal: 15
    },
    filterButton: {
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    dateText: {
        fontSize: 12,
        lineHeight: 12 * 1.4,
        color: Colors.DEFAULT_WHITE,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        // padding: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    collectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        marginHorizontal: 10,
        // marginTop: 20,
        marginBottom: 10,
        borderColor: Colors.DEFAULT_LIGHT_BLUE,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 8
    },
    paidHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        marginHorizontal: 10,
        // marginTop: 20,
        marginBottom: 10,
        borderColor: Colors.DEFAULT_LIGHT_BLUE,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 8
    },
    heading: {
        flex: 1,
        fontFamily: Fonts.POPPINS_MEDIUM,  // Change to the correct font if needed
        fontSize: 14,
        lineHeight: 14 * 1.4,
        textAlign: 'center',
        color: Colors.DEFAULT_WHITE,
    },
    flatListContainer: {
        paddingBottom: 50,
        // borderWidth:1
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
        fontSize: 12.5,
        lineHeight: 12.5 * 1.4,
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
    emptyText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        marginVertical: 10,
        color: Colors.DEFAULT_DARK_RED
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        // backgroundColor:Colors.DEFAULT_DARK_RED,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 10,
        padding: 10,
        // width: '90%',
        width: Display.setWidth(90),
        height: Display.setHeight(55),
    },
    calendar: {
        borderRadius: 10,
    },
    calendarButtonContainer: {
        // borderWidth:1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 30,
        paddingHorizontal: 10,
        // paddingVertical:10
    },
    calendarButton: {
        // borderWidth:1,
    },
    calendarText: {
        padding: 10,
        fontSize: 15,
        lineHeight: 15 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
    },
})