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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment';
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import { Dropdown } from 'react-native-element-dropdown';

const DistributorTodayPaidAmountScreen = () => {

    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [isFocus, setIsFocus] = useState(false);
    const [todayPaidDistributorAmount, setTodayPaidDistributorAmount] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [distributorList, setDistributorList] = useState([]);
    const [agentList, setAgentList] = useState([]);
    const [singleAgentFilterData, setSingleAgentFilterData] = useState('')


    const currentDate = moment().format('DD-MM-YYYY');

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    const sendWhatsAppMessage = () => {
        if (!singleAgentFilterData) {
            Alert.alert("No Agent Selected", "Please select an agent first");
            return;
        }

        const selectedAgent = employeesData.find(emp => emp.user_id === singleAgentFilterData);

        if (!selectedAgent || !selectedAgent.phone_number) {
            Alert.alert("Phone Number Not Found", "This agent does not have a registered phone number.");
            return;
        }

        const whatsappNumber = selectedAgent.phone_number.replace(/\D/g, '');
        const currentDate = moment().format("DD-MM-YYYY"); // or however you're getting the date

        let distributorDetails = '';
        let count = 1;
        let totalLocal = 0;

        const filteredPaidList = todayPaidDistributorAmount.filter(
            (entry) => entry.agent_id === singleAgentFilterData
        );

        filteredPaidList.forEach((entry) => {
            const distributorName = distributorList.find(dis => dis.user_id === entry.Distributor_id)?.username || 'Not Found';
            const localAmount = parseFloat(entry.paidamount) /*/ (parseFloat(entry.today_rate) || 1)*/;

            distributorDetails += `${count}  | Distributor Name : ${distributorName}, \n` +
                `      Collection Date :  ${currentDate}, \n` +
                `      Collection Local Amount : ${localAmount.toFixed(3)}\n` +
                `------------------------------------------------------------\n\n`;

            totalLocal += localAmount;
            count++;
        });

        if (totalLocal === 0) {
            Alert.alert("No Payments", "This agent has not received any payments today.");
            return;
        }

        const message =
            `🔹 *Agent Report*\n` +
            `Agent Name : ${selectedAgent.username} \n` +
            `Collection Date : ${currentDate} \n\n` +
            distributorDetails.trim() +
            `\n🔹 *TOTAL COLLECTION LOCAL AMOUNT :* ${totalLocal.toFixed(3)}`;

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
    };


    const fetchTodayPaidDistributorList = async () => {
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

            const paidAmountDetails = response.data.filter((item) => item.type === 'paid' && item.colldate === currentDate);
            // console.log('paid', paidAmountDetails);
            setTodayPaidDistributorAmount(paidAmountDetails);

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


    // Combine both fetches with loading states
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setLoading(true);
                await Promise.all([fetchEmployeesData(), fetchTodayPaidDistributorList()]);
                setLoading(false);
            };
            fetchData();

            // fetchClientsData();
            // fetchEmployeesData();

            // Reset the search text whenever the screen gains focus
            setSearchText('');
            setSingleAgentFilterData('');
        }, [])
    )


    const onPressClearTextEntry = () => {
        // console.log('Remove');
        setSearchText('');
        setSingleAgentFilterData('');
    }



    const filteredPaidList = singleAgentFilterData
        ? todayPaidDistributorAmount.filter((item) => String(item.agent_id) === String(singleAgentFilterData))
        : todayPaidDistributorAmount;


    // const searchFilteredPaidList = filteredPaidList.filter((item) => {
    //     const distributorName = distributorList.find(
    //         (dis) => dis.user_id === item.Distributor_id
    //     )?.username?.toLowerCase() || '';

    //     return distributorName.includes(searchText.toLowerCase());
    // });

    const todayInternationalTotalPayments = filteredPaidList.reduce(
        (sum, payment) => sum + (parseFloat(payment.paidamount) || 0), 0
    );
    // console.log('todayInternationalTotalPayments', todayInternationalTotalPayments);

    const todayLocalTotalPayments = filteredPaidList.reduce(
        (sum, payment) => sum + ((parseFloat(payment.paidamount) / payment.today_rate) || 0), 0
    );
    // console.log('todayLocalTotalPayments', todayLocalTotalPayments);


    const today_Local_Total_Payments = filteredPaidList.reduce(
        (sum, payment) => sum + (parseFloat(payment.paidamount) || 0), 0
    );


    const renderItem = ({ item, index }) => {

        const distributorName = distributorList.find((dis) => dis.user_id === item.Distributor_id)?.username || 'Not Found';
        const agentName = agentList.find((age) => age.value === item.agent_id)?.label || 'Not Found';

        const kuwaitLocalAmountValue = parseFloat(item.paidamount) / item.today_rate;

        return (
            <View style={styles.row}>
                <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>

                {/* <View style={{ alignItems: 'center', flex: 3 }}> */}
                <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{distributorName}</Text>
                {/* <Text style={styles.cityText}>{item.client_contact}</Text> */}
                {/* </View> */}

                <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{agentName}</Text>

                <Text style={[styles.cell, { flex: 3 }]}>
                    <Text style={{ textTransform: 'uppercase', color: Colors.DEFAULT_DARK_BLUE, }} numberOfLines={1}>local : {parseFloat(item.paidamount).toFixed(3)}</Text>
                    {/* {"\n"}
                    <Text style={{ textTransform: 'uppercase', color: Colors.DEFAULT_DARK_RED, }} numberOfLines={1}>local : {kuwaitLocalAmountValue.toFixed(3)}</Text> */}
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />

            <View style={{
                // borderWidth: 1,
                width: Display.setWidth(92),
                marginHorizontal: 15,
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputSubContainer}>
                        <Feather
                            name="search"
                            size={20}
                            color={Colors.DEFAULT_BLACK}
                            style={{ center: 10 }}
                        />
                        <SearchInput
                            onChangeText={(text) => setSearchText(text)}
                            value={searchText}
                            placeholder="Name or Number"
                            selectionColor={Colors.DEFAULT_BLACK}
                            style={styles.searchInput}
                        />
                        {searchText && (
                            <TouchableOpacity activeOpacity={0.8} onPress={onPressClearTextEntry}>
                                <AntDesign
                                    name="closecircleo"
                                    size={20}
                                    color={Colors.DEFAULT_BLACK}
                                // style={{ marginLeft: 10 }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={[styles.dropdownWrapper, { position: 'absolute', right: 0, top: 0, zIndex: 9999 }]}>
                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        // containerStyle={{ marginTop: -5 }}
                        containerStyle={{ width: 200, borderRadius: 8, position: 'absolute', left: 180, top: 160, zIndex: 9999 }}
                        maxHeight={250}
                        autoScroll={false}
                        search
                        searchPlaceholder="Search..."
                        data={agentList}
                        labelField="label"
                        valueField="value"
                        placeholder={false}
                        // placeholder={!singleAgentFilterData ? "Search Agent" : ""}
                        value={singleAgentFilterData}
                        onChange={(item) => {
                            setSingleAgentFilterData(item.value);
                            setIsFocus(false); // Close dropdown after selection
                            setSearchText(item.label); // 🔹 Updates the SearchInput box
                        }}
                    />
                </View>
            </View>

            <View style={styles.whatsAppButtonContainer}>
                <Text style={styles.currentDateText}>Today : {currentDate}</Text>
                <TouchableOpacity
                    style={styles.whatsAppButton}
                    activeOpacity={0.8}
                    onPress={sendWhatsAppMessage} // 🔹 Call function here
                >
                    <Text style={styles.whatsApp}>Send to WhatsApp</Text>
                    <MaterialCommunityIcons
                        name="whatsapp"
                        size={20}
                        color={Colors.DEFAULT_WHITE}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
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
            ) : filteredPaidList.length > 0 ? (
                <FlatList
                    data={filteredPaidList}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.flatListContainer}
                />
            ) : (
                <Text style={styles.emptyText}>I haven't collected the amount yet!</Text>
            )}


            <View style={styles.todayCollectionContainer}>
                {/* <Text style={styles.todayCollectionText}>
                    Inter : {todayInternationalTotalPayments.toFixed(3)}
                </Text>
                <Text style={styles.todayCollectionText}>
                    Local : {todayLocalTotalPayments.toFixed(3)}
                </Text> */}
                <Text style={styles.todayCollectionText} numberOfLines={1}>Local Total : {today_Local_Total_Payments.toFixed(3)}</Text>
            </View>

        </View>
    )
}

export default DistributorTodayPaidAmountScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    inputContainer: {
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        paddingHorizontal: 10,
        // marginHorizontal: 15,
        borderRadius: 50,
        borderWidth: 0.5,
        borderColor: Colors.DEFAULT_BLACK,
        elevation: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        justifyContent: 'center',
        // marginTop: 20,
        width: Display.setWidth(80),
        borderWidth: 1,
    },
    inputSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth:1
    },
    searchInput: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        letterSpacing: 1,
        textAlignVertical: 'center',
        paddingVertical: 0,
        height: Display.setHeight(6),
        color: Colors.DEFAULT_BLACK,
        // flex: 1,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        // paddingVertical: 10,
        width: Display.setWidth(62),
        paddingRight: 15,
        marginRight: 10,
        // textAlign:'center',
        // borderWidth:1,
    },
    dropdownWrapper: {
        position: 'relative',
        zIndex: 1, // Prevents dropdown from being hidden
    },
    dropdown: {
        // marginVertical: 20,
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_WHITE,
        borderRadius: 8,
        paddingHorizontal: 12,
        width: Display.setWidth(11),
        // width: Display.setWidth(50),
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
    whatsAppButtonContainer: {
        // borderWidth: 1,
        marginHorizontal: 15,
        marginVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    header: {
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
    emptyText: {
        // flex:1,
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
    todayCollectionContainer: {
        height: Display.setHeight(8),
        // width:Display.setWidth(50),
        marginHorizontal: 10,
        backgroundColor: Colors.DEFAULT_DARK_BLUE,
        marginVertical: 10,
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
        // paddingTop:5,
        paddingVertical: 15,
        textTransform: 'uppercase'
    },
})