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

const DistributorAgentHistory = () => {
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [distributorList, setDistributorList] = useState([]);
    const [historyDataList, setHistoryDataList] = useState([]);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [agentloginUserData, setAgentLoginUserData] = useState(null);
    const [agentloginUserName, setAgentLoginUserName] = useState(null);

    const [selectedDate, setSelectedDate] = useState('');
    // console.log('selectedDate', selectedDate);
    const [filteredHistoryDataList, setFilteredHistoryDataList] = useState([]);

    const currentDate = moment().format('DD-MM-YYYY');

    const isCalendarOkButtonDisabled = !selectedDate;

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    const getYesterdayDate = () => moment().subtract(1, 'days').format('DD-MM-YYYY');

    // const filteredData = historyDataList.filter(item => {
    //     const colldate = moment(item.colldate, 'DD-MM-YYYY').format('DD-MM-YYYY');
    //     const targetDate = selectedDate
    //         ? moment(selectedDate, 'YYYY-MM-DD').format('DD-MM-YYYY') // format from calendar format
    //         : getYesterdayDate();
    //     return colldate === targetDate;
    // });
    // console.log('filteredData', filteredData);


    useEffect(() => {
        const getYesterdayDate = () => moment().subtract(1, 'days').format('DD-MM-YYYY');

        const targetDate = selectedDate
            ? moment(selectedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')
            : getYesterdayDate();

        const filtered = historyDataList.filter(item => {
            const colldate = moment(item.colldate, 'DD-MM-YYYY').format('DD-MM-YYYY');
            return colldate === targetDate;
        });

        setFilteredHistoryDataList(filtered);
    }, [selectedDate, historyDataList]);

    const toggleCalendar = () => {
        // setIsCalendarVisible(!isCalendarVisible);
        setIsCalendarVisible(prev => !prev);
    }

    const handleCancelCalendar = () => {
        setIsCalendarVisible(false);
    }

    const handleClearDates = () => {
        // const yesterday = moment().subtract(1, 'days').format('DD-MM-YYYY');
        setSelectedDate('');
    }

    const handleConfirmDateSelection = () => {
        if (!selectedDate) return;
        setIsCalendarVisible(false);
    };


    const fetchGetAgentLoginUserData = async () => {
        try {
            const data = await getFromStorage('users');
            // console.log('010101', data?.name);
            const agentLoginUserID = data?.userID;
            const agentLoginUserName = data?.name;
            // console.log('101010', agentLoginUserID, agentLoginUserName);
            setAgentLoginUserData(agentLoginUserID);
            setAgentLoginUserName(agentLoginUserName);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
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

            // Axios GET request
            // const response = await axios.get(`${API_HOST}/list`, {
            const response = await axiosInstance.get('/list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization, // Include the token in the Authorization header
                },
            });

            //  Agent Lidt
            // const collectionAgentList = response.data
            //     .filter((item) => item.role === "Collection Agent")
            //     .map((item) => ({
            //         label: item.username,
            //         value: item.user_id,
            //     }));

            // Distributor List
            const collectionDistributorList = response.data.filter((item) => item.role === 'Distributor');

            // setEmployeesData(response.data);
            // setAgentList(collectionAgentList);
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

            const paidAmountDetails = response.data.filter(
                (item) =>
                    item.type === 'paid' && item.agent_id === agentloginUserData
            );
            // console.log('paid', paidAmountDetails);

            setHistoryDataList(paidAmountDetails);
            // console.log('full data', response.data);

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
                await Promise.all([fetchEmployeesData(), fetchHistoryDataList(), fetchGetAgentLoginUserData()]);
                setLoading(false);
            };
            fetchData();
            setSearchText('');
        }, [agentloginUserData])
    )

    const onPressClearTextEntry = () => setSearchText('');


    // const yesterdayData = historyDataList.filter(
    //     (item) =>
    //         moment(item.colldate, 'DD-MM-YYYY').format('DD-MM-YYYY') === yesterdayDate
    // );
    // // console.log('yesterdayData', yesterdayData);


    const searchUniqueDistributors = filteredHistoryDataList.filter((item) => {
        const distributorName = distributorList.find(
            (dis) => dis.user_id === item.Distributor_id
        )?.username?.toLowerCase() || '';

        return distributorName.includes(searchText.toLowerCase());
    });


    const renderItem = ({ item, index }) => {

        const distributorName = distributorList.find((dis) => dis.user_id === item.Distributor_id)?.username || 'Not Found';

        return (
            <View style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
                <View style={{ flex: 3, alignItems: 'center' }}>
                    <Text style={[styles.cell, /*{ flex: 3 }*/]} numberOfLines={1}>{distributorName}</Text>
                    <Text style={styles.cityText} numberOfLines={1}>{item.type}</Text>
                </View>
                <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{agentloginUserName}</Text>
                <Text style={[styles.cell, { flex: 3 }]}>
                    <Text style={{ textTransform: 'uppercase', color: Colors.DEFAULT_DARK_BLUE, }} numberOfLines={1}>local : {parseFloat(item.paidamount).toFixed(3)}</Text>{"\n"}
                    <Text style={styles.cityText} numberOfLines={1}>{item.colldate}</Text>
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <View style={styles.inputContainer}>
                <View style={styles.inputSubContainer}>
                    <Feather
                        name="search"
                        size={20}
                        color={Colors.DEFAULT_BLACK}
                        style={{ marginRight: 10 }}
                    />
                    <SearchInput
                        onChangeText={(text) => setSearchText(text)}
                        value={searchText}
                        placeholder="Search"
                        selectionColor={Colors.DEFAULT_BLACK}
                        style={styles.searchInput}
                    />
                    {searchText ? (
                        <TouchableOpacity activeOpacity={0.8} onPress={onPressClearTextEntry}>
                            <AntDesign
                                name="closecircleo"
                                size={20}
                                color={Colors.DEFAULT_BLACK}
                            // style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 20 }} />
                    )}
                    <TouchableOpacity activeOpacity={0.8} onPress={toggleCalendar}>
                        <FontAwesome
                            name="sliders"
                            size={20}
                            color={Colors.DEFAULT_BLACK}
                            style={{ marginLeft: 10 }}
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
                                // setTempSelectedDate(day.dateString);
                                //  setSelectedDate(moment(day.dateString).format('DD-MM-YYYY'));
                            }}
                            markedDates={{
                                [selectedDate]: { selected: true, marked: true, disableTouchEvent: true, selectedColor: Colors.DEFAULT_LIGHT_BLUE, }
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


            <View style={styles.paidHeader}>
                <Text style={[styles.heading, { flex: 1 }]}>No</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Distributor</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Agent</Text>
                <Text style={[styles.heading, { flex: 3 }]}>Amount</Text>
            </View>

            {loading ? (
                <ActivityIndicator
                    size='large'
                    color={Colors.DEFAULT_DARK_BLUE}
                    style={{ marginTop: 20, }}
                />
            ) : searchUniqueDistributors.length > 0 ? (
                <FlatList
                    data={searchUniqueDistributors}
                    keyExtractor={(item) => item.id?.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.flatListContainer}
                />
            ) : (
                <Text style={styles.emptyText}>{selectedDate ? `No data found for ${moment(selectedDate, 'YYYY-MM-DD').format('DD-MM-YYYY')}` : 'No one paid yesterday!'}</Text>
            )}


        </View>
    )
}

export default DistributorAgentHistory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    inputContainer: {
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        borderRadius: 50,
        borderWidth: 0.5,
        borderColor: Colors.DEFAULT_BLACK,
        elevation: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        justifyContent: 'center',
        marginTop: 10,
        width: Display.setWidth(92),
        borderWidth: 1
    },
    inputSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        letterSpacing: 1,
        textAlignVertical: 'center',
        paddingVertical: 0,
        height: Display.setHeight(6),
        color: Colors.DEFAULT_BLACK,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        paddingTop: 5,
        width: Display.setWidth(65),
        paddingRight: 15,
        // borderWidth: 1
    },
    paidHeader: {
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
        fontSize: 14,
        lineHeight: 14 * 1.4,
        textAlign: 'center',
        color: Colors.DEFAULT_WHITE,
    },
    flatListContainer: {
        paddingBottom: 50,
        // borderWidth:1
    },
    emptyText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        marginVertical: 10,
        color: Colors.DEFAULT_DARK_RED
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