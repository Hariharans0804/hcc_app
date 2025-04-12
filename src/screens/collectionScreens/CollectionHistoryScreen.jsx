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

const CollectionHistoryScreen = () => {

  const [yesterdayClientsData, setYesterdayClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [agentloginUserDataID, setAgentLoginUserDataID] = useState(null);
  const [agentLoginUserData, setAgentLoginUserData] = useState([]);
  // console.log('agentloginUserDataID', agentloginUserDataID);
  // console.log('agentLoginUserData', agentLoginUserData);

  const [filterClientsData, setFilterClientsData] = useState([])
  const [filteredDateData, setFilteredDateData] = useState([])
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  // Confirmed dates for filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Temporary state for date selection
  const [tempSelectedDates, setTempSelectedDates] = useState({ startDate: '', endDate: '' });
  const [displayFromDate, setDisplayFromDate] = useState(moment().subtract(1, "days").format("DD-MM-YYYY"));
  const [displayToDate, setDisplayToDate] = useState(moment().subtract(1, "days").format("DD-MM-YYYY"));


  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });

  const isCalendarOkButtonDisabled = !(tempSelectedDates.startDate && tempSelectedDates.endDate);

  const handleClearDates = () => {
    setTempSelectedDates({ startDate: '', endDate: '' });
    setStartDate(''); // Reset startDate
    setEndDate('');   // Reset endDate
    setFilteredDateData(yesterdayClientsData);
  }

  const handleCancelCalendar = () => {
    if (!startDate && !endDate) {
      setFilteredDateData(yesterdayClientsData);
    }
    setTempSelectedDates({ startDate: '', endDate: '' });
    setDisplayFromDate(moment().subtract(1, "days").format("DD-MM-YYYY"));
    setDisplayToDate(moment().subtract(1, "days").format("DD-MM-YYYY"));
    setIsCalendarVisible(false);
  }

  const toggleCalendar = () => {
    // Set tempSelectedDates to currently confirmed dates when reopening
    setTempSelectedDates({ startDate, endDate });
    setIsCalendarVisible(!isCalendarVisible);
  }

  const handleDayPress = (day) => {
    const { startDate, endDate } = tempSelectedDates;

    if (!startDate || (startDate && endDate)) {
      setTempSelectedDates({ startDate: day.dateString, endDate: '' }); // Set temp start date and clear end date
    } else {
      setTempSelectedDates({ ...tempSelectedDates, endDate: day.dateString }); // Set temp end date
    }
  };


  // Confirm selection and filter data
  const handleConfirmDates = () => {
    const { startDate: tempStart, endDate: tempEnd } = tempSelectedDates;

    if (tempStart && tempEnd) {
      setStartDate(tempStart);
      setEndDate(tempEnd);

      setDisplayFromDate(`${moment(tempStart).format("DD-MM-YYYY")}`);
      setDisplayToDate(`${moment(tempEnd).format("DD-MM-YYYY")}`);

      const start = new Date(tempStart);
      const end = new Date(tempEnd);

      const filteredData = filterClientsData.filter((item) =>
        Array.isArray(item.paid_amount_date) &&
        item.paid_amount_date.some((entry) => {
          const entryDate = new Date(entry.date.split("-").reverse().join("-"));
          return entryDate >= start && entryDate <= end;
        })
      );

      const filteredPayments = filteredData
        .flatMap(client => (client.paid_amount_date || [])
          .filter(payment => {
            // Convert payment.date to a Date object for comparison
            const paymentDate = new Date(payment.date.split("-").reverse().join("-"));
            return paymentDate >= start && paymentDate <= end;
          })
          .map(payment => ({
            client_id: client.client_id,
            client_name: client.client_name,
            client_city: client.client_city,
            client_contact: client.client_contact,
            today_rate: client.today_rate,
            amount: payment.amount,  // Amount paid in that transaction
            date: payment.date,      // Payment date
            userID: payment.userID,  // Agent who made the payment
            agentName: payment.userID === agentLoginUserData.userID ? agentLoginUserData.name : ' - ',
          }))
        )
        .filter(agent => agent.agentName === agentLoginUserData.name);


      setFilteredDateData(filteredPayments);
      console.log('11111111111', filteredPayments);

    }

    setIsCalendarVisible(false); // Close the calendar modal
  };


  const fetchGetAgentLoginUserData = async () => {
    try {
      const data = await getFromStorage('users');
      // console.log('010101', data);
      const agentLoginUserID = data?.userID;
      // console.log('101010',data);
      setAgentLoginUserDataID(agentLoginUserID);
      setAgentLoginUserData(data);

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  const getYesterdayDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);   // Subtract one day
    // console.log('33333333',yesterday);


    // Format as DD-MM-YYYY
    const formattedDate = `${yesterday.getDate().toString().padStart(2, '0')}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getFullYear()}`;
    return formattedDate;
  }

  const fetchyesterdayClientsData = async () => {
    if (!agentloginUserDataID) {
      // console.error('Agent login user data is missing');
      console.log('agentloginUserDataID:', agentloginUserDataID);
      return;
    }

    setLoading(true);
    try {
      // const response = await axios.get(`${API_HOST}/fetchUserlistIDS/${agentloginUserDataID}`);
      // const response = await axiosInstance.get(`/fetchUserlistID/${agentloginUserDataID}`);


      // const combinedData = response.data?.clientdata?.CombinedData || [];
      // // console.log('CombinedData:', combinedData);

      // const yesterdayCollectionsList = combinedData.flatMap(user => user.collections || []);
      // // console.log('Yesterday Collections List:', yesterdayCollectionsList);


      // // Filter data where the date matches yesterday's date
      // const yesterdayData = yesterdayCollectionsList.filter((item) =>
      //   Array.isArray(item.paid_amount_date) &&
      //   item.paid_amount_date.some((entry) => entry.date === yesterdayDate)
      // );
      // console.log('33333333', yesterdayData);


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
      // const response = await axios.get(`${API_HOST}/acc_list`, {
      const response = await axiosInstance.get('/acc_list', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization, // Include the token in the Authorization header
        },
      });

      const yesterdayDate = getYesterdayDate();   // Get yesterday's date in DD-MM-YYYY format

      // // Filter data where the date matches yesterday's date
      const yesterdayData = response.data.filter((item) =>
        Array.isArray(item.paid_amount_date) &&
        item.paid_amount_date.some((entry) => entry.date === yesterdayDate)
      );


      const yesterdayPayments = yesterdayData
        .flatMap(client =>
          (client.paid_amount_date || [])

            .map(payment => {
              // const agent = agentLoginUserData.find(emp => emp.user_id === payment.userID);

              return {
                client_id: client.client_id,
                client_name: client.client_name,
                client_city: client.client_city,
                client_contact: client.client_contact,
                today_rate: client.today_rate,
                amount: payment.amount,  // Amount paid in that transaction
                date: payment.date,      // Payment date
                userID: payment.userID,  // Agent who made the payment
                agentName: payment.userID === agentLoginUserData.userID ? agentLoginUserData.name : ' - ',
              };
            })
        )
        .filter(agent => agent.agentName === agentLoginUserData.name)
        .filter(item => item.date === yesterdayDate);

      setYesterdayClientsData(yesterdayPayments);
      console.log('yesterdayPayments', yesterdayPayments);

      setFilterClientsData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      const fetchYesterdayData = async () => {
        await fetchGetAgentLoginUserData();
        fetchyesterdayClientsData();
      }
      fetchYesterdayData();

      // Reset the search text whenever the screen gains focus
      setSearchText('');
    }, [agentloginUserDataID])
  )


  const handlePressView = (item) => {
    setSelectedItem(item);
    setViewModalVisible(true);
    // console.log('0000',item);
  }

  const onPressClearTextEntry = () => {
    // console.log('Remove');
    setSearchText('');
  }

  const yesterdayTotalInterAmount = yesterdayClientsData.reduce((sum, item) => sum + (item.amount || 0), 0);

  const yesterdayTotalLocalAmount = yesterdayClientsData.reduce((sum, item) => sum + ((item.amount / item.today_rate) || 0), 0);

  // console.log('yesterdayTotalLocalAmount', yesterdayTotalLocalAmount);

  const filteredTotalInterAmount = filteredDateData.reduce((sum, item) => sum + (item.amount || 0), 0);

  const filteredTotalLocalAmount = filteredDateData.reduce((sum, item) => sum + ((item.amount / item.today_rate) || 0), 0);

  // console.log('filteredTotalLocalAmount', filteredTotalLocalAmount);

  // Calculate the total paid amount
  const modalTotalPaidAmount = Array.isArray(selectedItem.paid_amount_date)
    ? selectedItem.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount), 0)
    : 0;

  //Get the last paid amount
  const modalLastPaidAmount = Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
    ? selectedItem.paid_amount_date[selectedItem.paid_amount_date.length - 1].amount
    : "No Payments"

  // Get the last paid date
  const modalLastPaidDate = Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
    ? selectedItem.paid_amount_date[selectedItem.paid_amount_date.length - 1].date
    : "No Paid Dates";

  // Calculate the remaining amount
  const modalRemainingAmount = selectedItem.amount - modalTotalPaidAmount;

  const renderItem = ({ item, index }) => {

    const kuwaitLocalAmountValue = item.amount / item.today_rate;

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 1 }]}>
          {index + 1}
          {/* {item.client_id} */}
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>
          {(item.client_name || '').replace(/"/g, '')}
          {"\n"}
          <Text style={styles.cityText}>
            {/* {item.client_city || ''} */}
            {/* {"\n"} */}
            {item.agentName}
          </Text>
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
        {/* <View syle={[styles.buttonContainer, { flex: 2 }]}>
          <TouchableOpacity style={styles.viewButton} onPress={() => handlePressView(item)}>
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
        </View> */}
        <Text style={[styles.cell, { flex: 2 }]}>
          {/* {item.amount} */}
          {kuwaitLocalAmountValue.toFixed(3)}
          {'\n'}
          <Text style={styles.cityText}>
            {item.date}
          </Text>
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
      {/* <Separator height={StatusBar.currentHeight} /> */}
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
              onDayPress={handleDayPress}
              markedDates={{
                ...(tempSelectedDates.startDate && {
                  [tempSelectedDates.startDate]: {
                    selected: true, marked: true, selectedColor: Colors.DEFAULT_LIGHT_BLUE
                  },
                }),
                ...(tempSelectedDates.endDate && {
                  [tempSelectedDates.endDate]: {
                    selected: true, marked: true, selectedColor: Colors.DEFAULT_LIGHT_BLUE
                  },
                }),
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
                onPress={handleConfirmDates}
                activeOpacity={0.8}
                disabled={isCalendarOkButtonDisabled}
              >
                <Text style={[styles.calendarText,
                {
                  color: isCalendarOkButtonDisabled
                    ? Colors.DEFAULT_DARK_GRAY : Colors.DEFAULT_DARK_BLUE
                }
                ]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.dateTextContainer}>
        <Text style={[
          styles.dateText,
          {
            backgroundColor:
              displayFromDate === moment().subtract(1, "days").format("DD-MM-YYYY")
                ? Colors.DEFAULT_LIGHT_BLUE
                : Colors.DEFAULT_DARK_RED,
          },
        ]}>Start Date : {displayFromDate}</Text>
        <Text style={[
          styles.dateText,
          {
            backgroundColor:
              displayToDate === moment().subtract(1, "days").format("DD-MM-YYYY")
                ? Colors.DEFAULT_LIGHT_BLUE
                : Colors.DEFAULT_DARK_RED,
          },
        ]}>End Date : {displayToDate}</Text>
      </View>

      <View style={styles.header}>
        <Text style={[styles.heading, { flex: 1 }]}>No</Text>
        <Text style={[styles.heading, { flex: 3 }]}>Name</Text>
        <Text style={[styles.heading, { flex: 3 }]}>Mobile</Text>
        <Text style={[styles.heading, { flex: 2 }]}>Details</Text>
      </View>
      {/* Data Loading and Display */}
      {loading ? (
        <ActivityIndicator
          size='large'
          color={Colors.DEFAULT_DARK_BLUE}
          style={{ marginTop: 20, }}
        />
      ) : yesterdayClientsData.length || filteredDateData.length > 0 ? (
        <FlatList
          data={
            // yesterdayClientsData.filter(
            (startDate && endDate ? filteredDateData : yesterdayClientsData)
              .filter(
                (item) => {
                  const searchTextLower = searchText.toLowerCase();
                  // Check if the searchText matches either client_name or client_contact
                  return (
                    item.client_name?.toLowerCase().includes(searchTextLower) ||
                    item.client_contact?.toString().includes(searchText)
                  );
                })}
          // keyExtractor={(item) => item.client_id?.toString()}
          keyExtractor={(item, index) => `${item.client_id}_${item.paid_amount_time || index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
          // ListEmptyComponent={<Text style={styles.emptyText}>No data for yesterday!</Text>}
          ListEmptyComponent={
            searchText ? (
              <Text style={styles.emptyText}>
                No matching Clients found page!
              </Text>
            ) : (
              <Text style={styles.emptyText}>No one paid yesterday!</Text>
            )
          }
        />
      ) : (
        <Text style={styles.emptyText}>No one paid yesterday!</Text>
      )}

      <View style={styles.todayCollectionContainer}>
        <Text style={styles.todayCollectionText}>Today Collections : {filteredDateData.length > 0 ? filteredTotalLocalAmount.toFixed(3) : yesterdayTotalLocalAmount.toFixed(3)}</Text>
      </View>

      {viewModalVisible && (
        <Modal animationType="slide" transparent={true} visible={viewModalVisible}>
          <View style={styles.viewModalConatiner}>
            <View style={styles.viewModal}>
              <TouchableOpacity style={styles.viewModalCloseButton} onPress={() => setViewModalVisible(false)}>
                <AntDesign
                  name="closecircleo"
                  size={30}
                  color={Colors.DEFAULT_WHITE}
                />
              </TouchableOpacity>
              <Text style={styles.viewModalText}>Details</Text>
              <View style={styles.detailsContainer}>
                {/* <Text style={styles.detailsText}>Client Id : {selectedItem.index !== undefined ? selectedItem.index + 1 : 'N/A'}</Text> */}
                <Text style={styles.detailsText}>Client Id : {selectedItem.client_id}</Text>
                <Text style={styles.detailsText}>Name : {selectedItem.client_name}</Text>
                <Text style={styles.detailsText}>Mobile : {selectedItem.client_contact}</Text>
                <Text style={styles.detailsText}>Total : {selectedItem.amount}</Text>
                <Text style={styles.detailsText}>Date : {selectedItem.date}</Text>
                <Text style={styles.detailsText}>City : {selectedItem.client_city}</Text>
                <Text style={styles.detailsText}>Over All Paid Amount : {modalTotalPaidAmount ? modalTotalPaidAmount : "No Payments"}</Text>
                <Text style={styles.detailsText}>Last Paid Amount : {modalLastPaidAmount}</Text>
                {/* <Text style={styles.detailsText}>Paid Amount & Date : {"\n"}
                      {Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
                        ? selectedItem.paid_amount_date
                        .map(entry => `${entry.date} - ${entry.amount}`)
                        .join("\n")
                        : "No Payments"}
                    </Text> */}
                <Text style={styles.detailsText}>Last Paid Date : {modalLastPaidDate}</Text>
                <Text style={styles.detailsText}>Balance Amount : {modalRemainingAmount}</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View >
  )

}

export default CollectionHistoryScreen

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
    marginTop: 20,
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
    // flex: 1,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    paddingTop: 5,
    width: Display.setWidth(65),
    paddingRight: 15,
    // borderWidth:1
  },
  // ========================================//
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    marginHorizontal: 10,
    marginTop: 20,
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
    // marginBottom: 8,
    // marginRight: 5,
    borderRadius: 25
  },
  viewModalConatiner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  viewModal: {
    margin: 20,
    backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: Display.setWidth(90),
    height: Display.setHeight(65),
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
  viewModalCloseButton: {
    marginLeft: 250,
  },
  viewModalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 22 * 1.4,
    fontFamily: Fonts.POPPINS_MEDIUM,
    color: Colors.DEFAULT_WHITE,
    textDecorationLine: 'underline'
  },
  detailsContainer: {
    width: Display.setWidth(75),
    // borderWidth: 1,
    // borderColor: Colors.DEFAULT_LIGHT_WHITE,
    // borderRadius: 10,
    // marginVertical:10,
    // padding: 40
    paddingVertical: 15,
    // paddingHorizontal: 10
  },
  detailsText: {
    fontSize: 16,
    lineHeight: 20 * 1.4,
    fontFamily: Fonts.POPPINS_MEDIUM,
    color: Colors.DEFAULT_LIGHT_WHITE,
    textTransform: 'capitalize'
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
  flatListContainer: {
    paddingBottom: 50,
    // borderWidth:1
  },
  todayCollectionContainer: {
    height: Display.setHeight(8),
    // width:Display.setWidth(50),
    marginHorizontal: 20,
    backgroundColor: Colors.DEFAULT_DARK_BLUE,
    marginVertical: 10,
    borderRadius: 30,
    // borderWidth:1,
    // flex:1
  },
  todayCollectionText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: 800,
    textAlign: 'center',
    marginRight: 10,
    fontFamily: Fonts.POPPINS_REGULAR,
    color: Colors.DEFAULT_LIGHT_WHITE,
    paddingVertical: 15
    // backgroundColor:Colors
  },
  dateTextContainer: {
    // borderWidth: 1,
    marginHorizontal: 10,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 13,
    lineHeight: 13 * 1.4,
    color: Colors.DEFAULT_WHITE,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
    padding: 10,
    borderRadius: 8,
  },
})