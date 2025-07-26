import { ActivityIndicator, Alert, FlatList, Linking, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

const SingleEmployeeCollectionPaidListScreen = ({ route }) => {
    const { employee } = route.params; // Extract passed employee data
    // console.log(employee);

    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [displayDate, setDisplayDate] = useState(moment().format('DD-MM-YYYY'));
    const [collectionTotal, setCollectionTotal] = useState([]);
    const [paidTotal, setPaidTotal] = useState([]);
    const [collectionPaidFullData, setCollectionPaidFullData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(employee?.role === 'Distributor' ? 'collection' : 'paid');
    const [filteredList, setFilteredList] = useState([]);
    // console.log('filteredList', filteredList);

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    const currentDate = moment().format('DD-MM-YYYY');
    // const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
    // console.log('formattedDate', formattedDate);

    const isCalendarOkButtonDisabled = !selectedDate;


    const sendWhatsAppMessage = () => {
        if (!selectedDate) {
            Alert.alert("No Date Selected", "Please select a date first.");
            return;
        }

        if (!employee.phone_number) {
            Alert.alert("Phone Number Not Found", "This agent does not have a registered phone number.");
            return;
        }

        const whatsappNumber = employee.phone_number.replace(/\D/g, '');
        const formattedDate = moment(selectedDate).format('DD-MM-YYYY');

        // const inrDetails

        // ✅ Build message based on role
        let message = '';

        if (employee.role === 'Distributor') {
            message =
                `🔹 *Distributor Report*\n\n` +
                ` *Distributor Name* : ${employee.username} \n` +
                ` *Date* : ${formattedDate} \n` +
                ` *Today Rate* : ${todayRate.toFixed(2)} \n\n` +
                // `📦 *INR Collection*\n` +
                `${inrDetails}\n` +
                `--------------------------\n\n` +
                `🔹 *INR : ${totalINR.toFixed(2)}\n` +
                `🔹 *KD : ${totalKD.toFixed(3)}\n` +
                `🔹 *OLD KD : ${oldKD.toFixed(3)}\n` +
                `🔹 *TOTAL KD : ${kdCombined.toFixed(3)}`;
        } else if (employee.role === 'Collection Agent') {
            message =
                `🔹 *Agent Report*\n` +
                `Agent Name : ${employee.username} \n` +
                `Collection Date : ${formattedDate} \n\n` +
                clientDetails.trim() +
                `\n🔹 *TOTAL COLLECTION LOCAL  AMOUNT:* ${(totalLocal).toFixed(3)}`;
        }


        const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
        const webFallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        Linking.canOpenURL(whatsappUrl)
            .then(supported => {
                if (supported) {
                    Linking.openURL(whatsappUrl);
                } else {
                    Linking.openURL(webFallbackUrl);
                    Alert.alert("WhatsApp Not Installed", "Please install WhatsApp to send messages.");
                }
            })
            .catch(err => console.error("Error opening WhatsApp:", err));
    }

    const handleClearDates = () => {
        setSelectedDate('');
        setDisplayDate(moment().format('DD-MM-YYYY')); // Reset to today

        // Show full filtered list for selected category (no date filter)
        const filtered = collectionPaidFullData.filter(
            (item) => item.type === selectedCategory
        );

        setFilteredList(filtered);
    }

    const toggleCalendar = () => {
        setIsCalendarVisible(!isCalendarVisible);
    }

    const handleCancelCalendar = () => {
        setIsCalendarVisible(false);
    }


    const handleConfirmDateSelection = () => {
        const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
        setDisplayDate(formattedDate);

        const filteredByDate = collectionPaidFullData.filter(
            (item) =>
                item.type === selectedCategory &&
                moment(item.colldate, 'DD-MM-YYYY').format('DD-MM-YYYY') === formattedDate
        );

        setFilteredList(filteredByDate);
        setIsCalendarVisible(false);
    };



    const fetchCollectionPaidList = async () => {
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

            const distributorCollectionPiadList = response.data.filter((item) => item.Distributor_id === employee.user_id || item.agent_id === employee.user_id);

            const collectionAmountDetails = response.data.filter((item) => item.type === 'collection');
            const paidAmountDetails = response.data.filter((item) => item.type === 'paid');

            // console.log('data', distributorCollectionPiadList);
            setCollectionTotal(collectionAmountDetails);
            setPaidTotal(paidAmountDetails);
            setCollectionPaidFullData(distributorCollectionPiadList);

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
    }


    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                // await fetchCollectionDataList();
                await fetchCollectionPaidList();
                // await fetchEmployeesData();
            };
            loadData();
        }, [])
    );

    const onPressClearTextEntry = () => setSearchText('');



    useEffect(() => {
        if (collectionPaidFullData && selectedCategory) {
            const filtered = collectionPaidFullData.filter(item => item.type === selectedCategory);
            setFilteredList(filtered);
        }
    }, [collectionPaidFullData, selectedCategory]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setDisplayDate(moment().format('DD-MM-YYYY'));
        setSelectedDate('');
    };


    const totalValues = filteredList.reduce(
        (acc, item) => {
            const rate = parseFloat(item.today_rate || 1);
            let inter = 0;
            if (item.type === 'collection' && Array.isArray(item.collamount)) {
                inter = parseFloat(item.collamount[0] || 0);
            } else if (item.type === 'paid' && Array.isArray(item.paidamount)) {
                inter = parseFloat(item.paidamount[0] || 0);
            }

            acc.inter += inter;
            acc.local += inter / rate;
            return acc;
        },
        { inter: 0, local: 0 }
    );



    const renderItem = ({ item, index }) => {

        let interValue = 0;
        let localValue = 0;

        const rate = parseFloat(item.today_rate || 1); // Avoid divide by zero

        if (item.type === 'collection' && Array.isArray(item.collamount)) {
            interValue = parseFloat(item.collamount[0] || 0);
            localValue = interValue / rate;
        } else if (item.type === 'paid' && Array.isArray(item.paidamount)) {
            interValue = parseFloat(item.paidamount[0] || 0);
            localValue = interValue / rate;
        }

        const agentDistributorPaidList = filteredList.find((dis) => dis.Distributor_id === item.Distributor_id)

        return (
            <View style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
                <View style={{ flex: 2 }}>
                    <Text style={[styles.cell,/*{ flex: 2 }*/]} numberOfLines={1}>{employee.username || 'Not Found'}</Text>
                    {/* <Text style={[styles.cell, ]} numberOfLines={1}>{employee.user_id === item.agent_id ? (employee.username) : employee.user_id === item.Distributor_id || (employee.username)}</Text> */}
                    <Text style={styles.cityText}>{item.colldate}</Text>
                </View>
                <Text style={[styles.cell, { flex: 2 }]}>{item.type}</Text>
                <Text style={[styles.cell, { flex: 4 }]}>
                    {/* <Text style={
                        {
                            textTransform: 'uppercase',
                            color: Colors.DEFAULT_DARK_BLUE,
                        }
                    } numberOfLines={1}
                    >Inter : {interValue.toFixed(2)}</Text>
                    {"\n"} */}
                    <Text style={
                        {
                            textTransform: 'uppercase',
                            color: Colors.DEFAULT_DARK_BLUE,
                        }
                    } numberOfLines={1}
                    >Local : {interValue.toFixed(3)}</Text>
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>{employee?.role === "Distributor" ? employee?.role : "Agent"} Name : </Text>
                <Text style={[styles.titleText, { width: Display.setWidth(50),/*borderWidth:1*/ }]} numberOfLines={1}>{employee?.username}</Text>
            </View>


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
                        placeholder="Name or Number"
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

            <View style={styles.whatsAppButtonContainer}>
                <Text style={[
                    styles.currentDateText,
                    {
                        backgroundColor:
                            displayDate === moment().format('DD-MM-YYYY')
                                ? Colors.DEFAULT_LIGHT_BLUE  // Blue for today
                                : Colors.DEFAULT_DARK_RED,        // Red for selected date
                    },
                ]}>Date : {displayDate}</Text>
                <TouchableOpacity
                    style={styles.whatsAppButton}
                    activeOpacity={0.8}
                // onPress={sendWhatsAppMessage} // 🔹 Call function here
                >
                    <Text style={styles.whatsApp}>Send to WhatsApp</Text>
                    <MaterialCommunityIcons
                        name="whatsapp"
                        size={20}
                        color={Colors.DEFAULT_WHITE}
                    />
                </TouchableOpacity>
            </View>

            <View style={[styles.whatsAppButtonContainer, { justifyContent: 'flex-start', gap: 10 }]}>
                {employee?.role === 'Distributor' && (
                    <>
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
                    </>
                )}
                {employee?.role === 'Collection Agent' && (
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
                )}
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

            <View style={styles.header}>
                <Text style={[styles.heading, { flex: 1 }]}>No</Text>
                <Text style={[styles.heading, { flex: 2 }]}>Name</Text>
                <Text style={[styles.heading, { flex: 2 }]}>Type</Text>
                <Text style={[styles.heading, { flex: 4 }]}>Amount</Text>
                {/* <Text style={[styles.heading, { flex: 4 }]}>{employee.role === "Distributor" ? "Total Amount" : "Paid Amount"}</Text> */}
            </View>

            {loading ? (
                <ActivityIndicator
                    size='large'
                    color={Colors.DEFAULT_DARK_BLUE}
                    style={{ marginTop: 20, }}
                />
            ) : filteredList.length > 0 ? (
                <FlatList
                    data={filteredList}
                    keyExtractor={(item) => item.id?.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.flatListContainer}
                />
            ) : (
                <Text style={styles.emptyText}>Selected Date No datas!</Text>
            )}

            <View style={styles.todayCollectionContainer}>
                {/* <Text style={styles.todayCollectionText}>Inter : {totalValues.inter.toFixed(2)}</Text>
                <Text style={styles.todayCollectionText}>Local : {totalValues.local.toFixed(3)}</Text> */}
                <Text style={styles.todayCollectionText} numberOfLines={1}>Local Total : {totalValues.inter.toFixed(3)}</Text>
            </View>

        </View>
    )
}

export default SingleEmployeeCollectionPaidListScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    titleContainer: {
        // borderWidth:1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
        borderRadius: 8,
        marginHorizontal: 15,
        marginTop: 15,
        padding: 10
    },
    titleText: {
        fontSize: 14,
        lineHeight: 14 * 1.4,
        color: Colors.DEFAULT_LIGHT_WHITE,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        textTransform: 'capitalize',
        // padding:10
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
        marginTop: 15,
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
    whatsAppButtonContainer: {
        // borderWidth: 1,
        marginHorizontal: 15,
        // marginVertical: 10,
        marginTop: 10,
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
        fontSize: 14,
        lineHeight: 14 * 1.4,
        // color: Colors.DEFAULT_WHITE,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    whatsAppButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 5,
        backgroundColor: Colors.DEFAULT_GREEN,
        borderRadius: 20,
        padding: 10,
    },
    whatsApp: {
        fontSize: 14,
        lineHeight: 14 * 1.4,
        color: Colors.DEFAULT_WHITE,
        fontFamily: Fonts.POPPINS_SEMI_BOLD
    },
    currentDateText: {
        fontSize: 14,
        lineHeight: 14 * 1.4,
        color: Colors.DEFAULT_WHITE,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        padding: 10,
        borderRadius: 8,
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
        fontSize: 16,
        lineHeight: 16 * 1.4,
        textAlign: 'center',
        color: Colors.DEFAULT_WHITE,
    },
    flatListContainer: {
        paddingBottom: 50,
        // borderWidth:1
    },
    emptyText: {
        fontSize: 16,
        lineHeight: 16 * 1.4,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        marginVertical: 10,
        color: Colors.DEFAULT_DARK_RED
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
        fontSize: 12.5,
        lineHeight: 12.5 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    todayCollectionContainer: {
        height: Display.setHeight(8),
        // width:Display.setWidth(50),
        marginHorizontal: 10,
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
        marginBottom: 30,
        marginTop: 10,
        borderRadius: 50,
        // borderWidth:1,
        // flex:1
    },
    todayCollectionText: {
        // flex: 0,
        fontSize: 17,
        lineHeight: 17 * 1.4,
        fontWeight: 800,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_LIGHT_WHITE,
        // paddingTop: 5,
        paddingVertical: 15,
        textTransform: 'uppercase'
    },
    cityText: {
        fontFamily: Fonts.POPPINS_MEDIUM,
        fontSize: 11,
        lineHeight: 11 * 1.4,
        color: '#8898A9'
    },
})