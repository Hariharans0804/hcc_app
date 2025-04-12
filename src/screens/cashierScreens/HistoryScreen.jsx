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

const HistoryScreen = () => {

  const [yesterdayPaidClientsData, setYesterdayPaidClientsData] = useState([]);
  // console.log('1111111111', yesterdayPaidClientsData);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [filterClientsData, setFilterClientsData] = useState([])
  const [filteredDateData, setFilteredDateData] = useState([])
  // console.log('2222222222', filteredDateData);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  // Confirmed dates for filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Temporary state for date selection
  const [tempSelectedDates, setTempSelectedDates] = useState({ startDate: '', endDate: '' });
  // const [displayDate, setDisplayDate] = useState(moment().subtract(1, "days").format("DD-MM-YYYY")); // Default to yesterday
  const [displayFromDate, setDisplayFromDate] = useState(moment().subtract(1, "days").format("DD-MM-YYYY"));
  const [displayToDate, setDisplayToDate] = useState(moment().subtract(1, "days").format("DD-MM-YYYY"));


  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });

  const currentDate = moment().format('DD-MM-YYYY');

  const isCalendarOkButtonDisabled = !(tempSelectedDates.startDate && tempSelectedDates.endDate);

  const handleClearDates = () => {
    setTempSelectedDates({ startDate: '', endDate: '' });
    setStartDate(''); // Reset startDate
    setEndDate('');   // Reset endDate
    // setDisplayDate(moment().subtract(1, "days").format("DD-MM-YYYY")); // Reset to yesterday
    setDisplayFromDate(moment().subtract(1, "days").format("DD-MM-YYYY"));
    setDisplayToDate(moment().subtract(1, "days").format("DD-MM-YYYY"));
    setFilteredDateData(yesterdayPaidClientsData);
  }

  const handleCancelCalendar = () => {
    if (!startDate && !endDate) {
      setFilteredDateData(yesterdayPaidClientsData);
    }
    setTempSelectedDates({ startDate: '', endDate: '' });
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

      // ✅ Update displayDate to show the selected range
      // setDisplayDate(`${moment(tempStart).format("DD-MM-YYYY")} - ${moment(tempEnd).format("DD-MM-YYYY")}`);

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
            agentName: employeesData.find(emp => emp.user_id === payment.userID)?.username || "Not Found",
          }))
        )

      setFilteredDateData(filteredPayments);
      // console.log('11111111111', filteredPayments);
    }
    setIsCalendarVisible(false); // Close the calendar modal
  };


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

      setEmployeesData(response.data);
      // console.log(response.data);
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

  // Pre-map employeesData for efficient lookup
  const employeeMap = useMemo(() => {
    const map = {};
    employeesData.forEach(emp => (map[emp.user_id] = emp.username));
    return map;
  }, [employeesData]);
  // console.log(employeeMap);



  const getYesterdayDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);   // Subtract one day
    // console.log('33333333',yesterday);


    // Format as DD-MM-YYYY
    const formattedDate = `${yesterday.getDate().toString().padStart(2, '0')}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getFullYear()}`;
    return formattedDate;
  }


  const fetchYesterdayPaidClientsData = async () => {
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

      // setLoading(true);

      // Axios GET request
      // const response = await axios.get(`${API_HOST}/acc_list`, {
      const response = await axiosInstance.get('/acc_list', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization, // Include the token in the Authorization header
        },
      });

      const yesterdayDate = getYesterdayDate();   // Get yesterday's date in DD-MM-YYYY format

      // Filter data where the date matches yesterday's date
      const yesterdayData = response.data.filter((item) =>
        Array.isArray(item.paid_amount_date) &&
        item.paid_amount_date.some((entry) => entry.date === yesterdayDate)
      );


      const yesterdayPayments = yesterdayData
        .flatMap(client => (client.paid_amount_date || [])
          .map(payment => {
            // const agent = employeesData.find(emp => String(emp.user_id) === String(payment.userID));

            // console.log(`Looking for agent: ${payment.userID} -> Found:`, agent);
            return {
              client_id: client.client_id,
              client_name: client.client_name,
              client_city: client.client_city,
              client_contact: client.client_contact,
              today_rate: client.today_rate,
              amount: payment.amount,  // Amount paid in that transaction
              date: payment.date,      // Payment date
              userID: payment.userID,  // Agent who made the payment
              agentName: employeesData.find(emp => emp.user_id === payment.userID)?.username || "Not Found",
              // agentName: agent ? agent.username : 'Not Found',
              // agentName: employeeMap[String(payment.userID)] || 'Not Found',  // 🔥 Faster lookup
            };
          })
          .filter((item) => (
            item.date === yesterdayDate
          ))
        )

      setYesterdayPaidClientsData(yesterdayPayments);
      // console.log('33333333', yesterdayPayments);

      setFilterClientsData(response.data);


      // Assuming `response.data` is the array of clients
      const historyFilter = response.data.map((client) => {
        if (client.paid_amount_date && Array.isArray(client.paid_amount_date)) {
          const datesAndAmounts = client.paid_amount_date
            .map((entry) => {
              const agent = employeesData.find((agent) => agent.user_id === entry.userID);
              const agentName = agent ? agent.username : 'UNKNOWN';

              // ✅ Properly return the formatted string
              return `${client.client_name} - ${entry.date} - ${entry.amount} - ${agentName}`;
            })
            .join("\n");
          return `Client: ${client.client_name}\n${datesAndAmounts}`;
        } else {
          return `Client: ${client.client_name}\nNo Payment History`;
        }
      }).join("\n\n");

      // setFilterDateData(historyFilter);
      // console.log(historyFilter);

    } catch (error) {
      console.error(error);
    }
  }



  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchEmployeesData(), fetchYesterdayPaidClientsData()]);
        setLoading(false);
      };
      fetchData();
      // Reset the search text whenever the screen gains focus
      setSearchText('');
    }, [])
  )


  const handlePressView = (item) => {
    setSelectedItem(item);
    setViewModalVisible(true);
    // console.log('0000',item);
  }

  // const onPressClearTextEntry = () => {
  //   // console.log('Remove');
  //   setSearchText('');
  // }

  const onPressClearTextEntry = () => setSearchText('');

  const roundAmount = (amount) => {
    const whole = Math.floor(amount); // Get the integer part
    const decimal = amount - whole; // Get the decimal part

    if (decimal <= 0.49) {
      return whole; // Round down
    } else {
      return whole + 1; // Round up
    }
  };


  const yesterdayTotalInterAmount = yesterdayPaidClientsData.reduce((sum, item) => sum + (item.amount || 0), 0);

  const yesterdayTotalLocalAmount = yesterdayPaidClientsData.reduce((sum, item) => sum + ((item.amount / item.today_rate) || 0), 0);

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


  // const filteredTransactions = (startDate && endDate ? filteredDateData : yesterdayPaidClientsData)
  //   .filter((item) => {
  //     const searchTextLower = searchText.toLowerCase();

  //     // ✅ Ensure `employeeMap` exists and contains the userID
  //     const assignedUsername = employeeMap[item.userID]?.toLowerCase() || '';

  //     // ✅ Apply strict matching
  //     const matchesSearch =
  //       item.client_name?.toLowerCase().includes(searchTextLower) ||
  //       item.client_contact?.toString().includes(searchText) ||
  //       assignedUsername.includes(searchTextLower);

  //     return matchesSearch;  // 🔥 Only return items that match
  //   })
  //   .sort((a, b) => {
  //     // Get the last payment time from 'paid_amount_time'
  //     const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
  //     const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;

  //     return bLastPayment - aLastPayment; // 🔥 Sort descending
  //   });


  const searchTextLower = searchText.toLowerCase();

  const filteredTransactions = (startDate && endDate ? filteredDateData : yesterdayPaidClientsData)
    .filter((item) => {
      const assignedUsername = employeeMap[item.userID]?.toLowerCase() || '';

      return (
        item.client_name?.toLowerCase().includes(searchTextLower) ||
        item.client_contact?.toString().includes(searchText) ||
        assignedUsername.includes(searchTextLower)
      );
    })
    .sort((a, b) => {
      const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
      const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;

      return bLastPayment - aLastPayment;
    });

  // ✅ Get total amounts for the agent matching the search
  const agentFilteredTransactions = filteredTransactions.filter(
    (item) => employeeMap[item.userID]?.toLowerCase() === searchTextLower
  );

  const singleAgentTotalInterAmount = agentFilteredTransactions.reduce((sum, item) => sum + (item.amount || 0), 0);
  const singleAgentTotalLocalAmount = agentFilteredTransactions.reduce((sum, item) => sum + ((item.amount / item.today_rate) || 0), 0);

  // console.log('singleAgentTotalInterAmount', singleAgentTotalInterAmount.toFixed(2));
  // console.log('singleAgentTotalLocalAmount', singleAgentTotalLocalAmount.toFixed(3));



  let rowIndex = 0; // Global counter for sequential numbering


  const renderItem = ({ item, index }) => {
    // if (!Array.isArray(item.paid_amount_date) || item.paid_amount_date.length === 0) {
    // rowIndex++; // Increment counter for each row

    const kuwaitLocalAmountValue = item.amount / item.today_rate;

    const agent = employeesData.find(emp => emp.user_id === item.userID);
    const agentName = agent ? agent.username : 'Not Found';

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 1 }]}>
          {/* {rowIndex} */}
          {index + 1}
          {/* {item.client_id} */}
        </Text>
        {/* <Text style={[styles.cell, { flex: 4 }]}>
          {(item.client_name || '').replace(/"/g, '')}
          {"\n"} */}
        {/* <Text style={styles.cityText}>{item.client_city || ''}</Text> */}
        {/* <Text style={styles.cityText}> */}
        {/* {employeesData.find((empid) => empid.user_id === item.user_id)?.username || 'Not Found'} */}
        {/* {item.paid_amount_date.map((payment, index) => {
              const username = employeesData.find((emp) => emp.user_id === payment.userID)?.username || 'Not Found';
              return `${username}${index < item.paid_amount_date.length - 1 ? ', ' : ''}`;
            })} */}
        {/* {item.client_contact}
          </Text>
        </Text> */}
        <View style={{ height: Display.setHeight(5), alignItems: 'center', /*borderWidth: 1,*/ flex: 4 }}>
          <Text style={styles.cell} numberOfLines={1}>{(item.client_name || '').replace(/"/g, '')}</Text>
          <Text style={styles.cityText}>{item.client_contact}</Text>
        </View>

        <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>
          {agentName}
        </Text>
        {/* <View style={[styles.buttonContainer, { flex: 2 }]}>
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
        <Text style={[styles.cell, { flex: 4 }]}>
          <Text style={{ textTransform: 'uppercase', color: Colors.DEFAULT_DARK_BLUE, }} numberOfLines={1}>inter : </Text>{roundAmount(item.amount).toFixed(2)}
          {'\n'}
          <Text style={{ textTransform: 'uppercase', color: Colors.DEFAULT_DARK_RED }} numberOfLines={1}>local : </Text>{kuwaitLocalAmountValue.toFixed(3)}
          {'\n'}
          <Text style={styles.cityText}>
            {item.date}
          </Text>
        </Text>
      </View>
    );
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
            placeholder="Agent or Name or Number"
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
        <Text style={[styles.heading, { flex: 4 }]}>Name</Text>
        <Text style={[styles.heading, { flex: 2 }]}>Agent</Text>
        <Text style={[styles.heading, { flex: 4 }]}>Amount</Text>
      </View>

      {/* Data Loading and Display */}
      {loading ? (
        <ActivityIndicator
          size='large'
          color={Colors.DEFAULT_DARK_BLUE}
          style={{ marginTop: 20, }}
        />
      ) : yesterdayPaidClientsData.length || filteredDateData.length > 0 ? (
        <FlatList
          // data={
          //   (startDate && endDate ? filteredDateData : yesterdayPaidClientsData)
          //     .filter(
          //       (item) => {
          //         // Apply search filtering
          //         const searchTextLower = searchText.toLowerCase();

          //         // Fetch the username using the user_id
          //         const assignedUsername = employeeMap[item.userID]?.toLowerCase() || '';

          //         // Check if the searchText matches either client_name or client_contact or agent_name
          //         const matchesSearch =
          //           item.client_name?.toLowerCase().includes(searchTextLower) ||
          //           item.client_contact?.toString().includes(searchText) ||
          //           assignedUsername.includes(searchTextLower);

          //         return matchesSearch;
          //       })
          //     .sort((a, b) => {
          //       // Get the last payment time from the 'paid_amount' field
          //       const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
          //       const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;

          //       // Sort descending: latest payment first
          //       return bLastPayment - aLastPayment;
          //     })
          // }
          data={filteredTransactions}
          // keyExtractor={(item) => item.client_id?.toString() || Math.random().toString()}
          keyExtractor={(item, index) => `${item.client_id}_${item.paid_amount_time || index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No matching Clients found!</Text>}
        />
      ) : (
        <Text style={styles.emptyText}>No one paid yesterday!</Text>
      )}


      <View style={styles.todayCollectionContainer}>
        {/* <Text style={styles.todayCollectionText}>Today Collections</Text> */}
        {/* <Text style={styles.todayCollectionText}>Inter : {filteredDateData.length > 0 ? filteredTotalInterAmount.toFixed(2) : yesterdayTotalInterAmount.toFixed(2)}</Text>
        <Text style={styles.todayCollectionText}>Local : {filteredDateData.length > 0 ? filteredTotalLocalAmount.toFixed(3) : yesterdayTotalLocalAmount.toFixed(3)}</Text> */}
        <Text style={styles.todayCollectionText}>
          Inter : {searchText
            ? singleAgentTotalInterAmount.toFixed(2)  // Show agent-specific total if searching
            : filteredDateData.length > 0
              ? filteredTotalInterAmount.toFixed(2)
              : yesterdayTotalInterAmount.toFixed(2)}
        </Text>

        <Text style={styles.todayCollectionText}>
          Local : {searchText
            ? singleAgentTotalLocalAmount.toFixed(3)  // Show agent-specific total if searching
            : filteredDateData.length > 0
              ? filteredTotalLocalAmount.toFixed(3)
              : yesterdayTotalLocalAmount.toFixed(3)}
        </Text>

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

export default HistoryScreen

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
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    paddingTop: 5,
    width: Display.setWidth(65),
    paddingRight: 15,
    // borderWidth: 1
  },
  // filterButtonContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-end'
  // },
  // filterButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'flex-start',
  //   backgroundColor: Colors.DEFAULT_GREEN,
  //   paddingHorizontal: 15,
  //   paddingVertical: 10,
  //   borderRadius: 8,
  //   gap: 6,
  //   marginTop: 15,
  //   marginHorizontal: 20,
  //   width: Display.setWidth(25),
  // },
  // filterButtonText: {
  //   fontSize: 16,
  //   color: Colors.DEFAULT_LIGHT_WHITE,
  //   lineHeight: 16 * 1.4,
  //   fontFamily: Fonts.POPPINS_SEMI_BOLD
  // },
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
    height: Display.setHeight(60),
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
    // lineHeight: 20 * 1.4,
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
    marginHorizontal: 10,
    backgroundColor: Colors.DEFAULT_DARK_BLUE,
    marginBottom: 10,
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
    paddingTop: 5,
    textTransform: 'uppercase'
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

// ====================================================================//
// calendar function two dates clicked and ok button clicked data showing
// ======================================================================

// const [filterClientsData, setFilterClientsData] = useState([])
// const [filteredDateData, setFilteredDateData] = useState([])
// const [isCalendarVisible, setIsCalendarVisible] = useState(false);
// // Confirmed dates for filtering
// const [startDate, setStartDate] = useState('');
// const [endDate, setEndDate] = useState('');

// // Temporary state for date selection
// const [tempSelectedDates, setTempSelectedDates] = useState({ startDate: '', endDate: '' });


// const handleClearDates = () => {
//   setTempSelectedDates('');
// }

// const toggleCalendar = () => {
//   setIsCalendarVisible(!isCalendarVisible);
// }

// const handleDayPress = (day) => {
//   const { startDate, endDate } = tempSelectedDates;

//   if (!startDate || (startDate && endDate)) {
//     setTempSelectedDates({ startDate: day.dateString, endDate: '' }); // Set temp start date and clear end date
//   } else {
//     setTempSelectedDates({ ...tempSelectedDates, endDate: day.dateString }); // Set temp end date
//   }
// };

// // Confirm selection and filter data
// const handleConfirmDates = () => {
//   const { startDate: tempStart, endDate: tempEnd } = tempSelectedDates;

//   if (tempStart && tempEnd) {
//     setStartDate(tempStart);
//     setEndDate(tempEnd);

//     const start = new Date(tempStart);
//     const end = new Date(tempEnd);

//     const filteredData = filterClientsData.filter((item) =>
//       Array.isArray(item.paid_amount_date) &&
//       item.paid_amount_date.some((entry) => {
//         const entryDate = new Date(entry.date.split("-").reverse().join("-"));
//         return entryDate >= start && entryDate <= end;
//       })
//     );

//     setFilteredDateData(filteredData);
//   }

//   setIsCalendarVisible(false); // Close the calendar modal
// };

{/* Calendar Modal */ }
{/* <Modal visible={isCalendarVisible} transparent animationType="slide">
<View style={styles.modalOverlay}>
  <View style={styles.calendarContainer}>
    <Calendar
      onDayPress={handleDayPress}
      markedDates={{
        ...(tempSelectedDates.startDate && {
          [tempSelectedDates.startDate]: { selected: true, marked: true, selectedColor: Colors.DEFAULT_LIGHT_BLUE },
        }),
        ...(tempSelectedDates.endDate && {
          [tempSelectedDates.endDate]: { selected: true, marked: true, selectedColor: Colors.DEFAULT_LIGHT_BLUE },
        }),
      }}
    /> */}


// ====================================================================//
// calendar function two dates clicked data showing
// =================================================

// const [filterClientsData, setFilterClientsData] = useState([])
// const [filteredDateData, setFilteredDateData] = useState([])
// const [isCalendarVisible, setIsCalendarVisible] = useState(false);
// // Confirmed dates for filtering
// const [startDate, setStartDate] = useState('');
// const [endDate, setEndDate] = useState('');


// const handleClearDates = () => {
//   setTempSelectedDates('');
//   // setStartDate('');
//   // setEndDate('');
// }

// const toggleCalendar = () => {
//   setIsCalendarVisible(!isCalendarVisible);
// }

// const handleDayPress = (day) => {
//   const { startDate, endDate } = tempSelectedDates;

//   if (!startDate || (startDate && endDate)) {
//     setStartDate(day.dateString); // Set start date
//     setEndDate(''); // Clear end date
//   } else {
//     setEndDate(day.dateString); // Set end date

//     // Close the calendar modal after selecting the end date
//     setIsCalendarVisible(false);
//   }
// };

// // Filter data by the selected date range
// useEffect(() => {
//   if (startDate && endDate) {
//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     const filteredData = filterClientsData.filter((item) =>
//       Array.isArray(item.paid_amount_date) &&
//       item.paid_amount_date.some((entry) => {
//         const entryDate = new Date(entry.date.split("-").reverse().join("-"));
//         return entryDate >= start && entryDate <= end;
//       })
//     );
//     console.log('111111111', filteredData);

//     setFilteredDateData(filteredData);
//   } else {
//     setFilteredDateData([]); // Reset if no date range is selected
//   }
// }, [startDate, endDate, filterClientsData]);


{/* Calendar Modal */ }
{/* <Modal visible={isCalendarVisible} transparent animationType="slide">
<View style={styles.modalOverlay}>
  <View style={styles.calendarContainer}>
    <Calendar
      onDayPress={handleDayPress}
    markedDates={{
      ...(startDate && { [startDate]: { selected: true, marked: true, selectedColor: Colors.DEFAULT_LIGHT_BLUE } }),
      ...(endDate && { [endDate]: { selected: true, marked: true, selectedColor: Colors.DEFAULT_LIGHT_BLUE } }),
    }}
    /> */}

// ====================================================================//

{/* <View style={styles.filterButtonContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Filter</Text>
          <FontAwesome
            name="sliders"
            size={20}
            color={Colors.DEFAULT_WHITE}
          // style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View> */}


{/* <TextInput
            placeholder='Search'
            placeholderTextColor={Colors.DEFAULT_BLACK}
            selectionColor={Colors.DEFAULT_BLACK}
            style={styles.inputText}
          /> */}








// return item.paid_amount_date.map((entry, index) => {
//   rowIndex++; // Keep incrementing across all rows
//   return (
//     <View key={`${item.client_id}-${index}`} style={styles.row}>
//       <Text style={[styles.cell, { flex: 1 }]}>
//         {rowIndex}
//         {/* {index + 1} */}
//         {/* {item.client_id} */}
//       </Text>
//       <Text style={[styles.cell, { flex: 3 }]}>
//         {(item.client_name || '').replace(/"/g, '')}
//         {"\n"}
//         {/* <Text style={styles.cityText}>{item.client_city || ''}</Text> */}
//         <Text style={styles.cityText}>
//           {/* {employeesData.find((empid) => empid.user_id === item.user_id)?.username || 'Not Found'} */}
//           {employeesData.find((empid) => empid.user_id === entry.userID)?.username || 'Not Found'}

//         </Text>
//       </Text>
//       <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
//       {/* <View style={[styles.buttonContainer, { flex: 2 }]}>
//       <TouchableOpacity style={styles.viewButton} onPress={() => handlePressView(item)}>
//         <Ionicons
//           name="eye"
//           size={15}
//           color={Colors.DEFAULT_BLACK}
//         />
//         <Text style={[
//           styles.cell,
//           {
//             fontSize: 12,
//             lineHeight: 12 * 1.4,
//             textTransform: 'uppercase',
//             color: Colors.DEFAULT_BLACK,
//           }
//         ]}>View</Text>
//       </TouchableOpacity>
//     </View> */}
//       <Text style={[styles.cell, { flex: 2 }]}>{entry.amount}</Text>
//     </View >
//   )
// });
// }