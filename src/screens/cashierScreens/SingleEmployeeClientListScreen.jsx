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

const SingleEmployeeClientListScreen = ({ route }) => {
  const { employee } = route.params; // Extract passed employee data
  // console.log(employee);

  const [searchText, setSearchText] = useState("");
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);


  const [filterDateData, setFilterDateData] = useState([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [displayDate, setDisplayDate] = useState(moment().format('DD-MM-YYYY')); // Displayed Date
  // console.log('filterDateData', filterDateData);
  const [tempSelectedDate, setTempSelectedDate] = useState(""); // Temporary selection before confirmation


  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });


  // const sendWhatsAppMessage = () => {
  //   if (!selectedDate) {
  //     Alert.alert("No Date Selected", "Please select an date first.");
  //     return;
  //   }

  //   if (!employee.phone_number) {
  //     Alert.alert("Phone Number Not Found", "This agent does not have a registered phone number.");
  //     return;
  //   }

  //   let count = 1;
  //   const whatsappNumber = employee.phone_number.replace(/\D/g, '');

  //   const message =
  //     `🔹 *Distributor Report*\n\n` +
  //     `👤 *Distributor Name* : ${employee.username} \n` +
  //     `📅 *Date* : ${currentDate} \n` +
  //     `💰 *Today Rate* : ${filterDateData.today_rate} \n\n` +
  //     `--------------------------\n\n` +
  //     `🔹TOTAL INR: \n` +
  //     `🔹TOTAL KD: \n` +
  //     `🔹*OLD KD: \n` +
  //     `🔹*KD: `;

  //   const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
  //   const webFallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  //   Linking.canOpenURL(whatsappUrl)
  //     .then(supported => {
  //       if (supported) {
  //         Linking.openURL(whatsappUrl);
  //       } else {
  //         Linking.openURL(webFallbackUrl);
  //         Alert.alert("WhatsApp Not Installed", "Please install WhatsApp to send messages.");
  //       }
  //     })
  //     .catch(err => console.error("Error opening WhatsApp:", err));

  // }

  const sendWhatsAppMessage = () => {
    if (!selectedDate) {
      Alert.alert("No Date Selected", "Please select a date first.");
      return;
    }

    if (!employee.phone_number) {
      Alert.alert("Phone Number Not Found", "This agent does not have a registered phone number.");
      return;
    }

    // ✅ Check if the employee is either Distributor or Collection Agent
    if (employee.role !== 'Distributor' && employee.role !== 'Collection Agent') {
      Alert.alert("Access Denied", "Only Distributors and Collection Agents can receive this report.");
      return;
    }

    const whatsappNumber = employee.phone_number.replace(/\D/g, '');
    const formattedDate = moment(selectedDate, "YYYY-MM-DD").format("DD-MM-YYYY");

    // ✅ Build Distributor based on role
    let totalINR = 0;
    let oldKD = 0;
    let todayRate;

    // Get today_rate
    for (const item of filterDateData) {
      if (item.today_rate) {
        todayRate = parseFloat(item.today_rate);
        break;
      }
    }

    if (!todayRate || isNaN(todayRate)) {
      Alert.alert("Rate Not Found", "Today rate not available for this date.");
      return;
    }

    // Build INR breakdown
    let inrDetails = '';

    filterDateData.forEach((item, index) => {
      const amount = parseFloat(item.amount) || 0;
      totalINR += amount;

      inrDetails += `${index + 1}. ${item.client_name || 'Unknown'} : ₹ ${amount.toFixed(2)}\n`;

      //   if (Array.isArray(item.paid_amount_date)) {
      //     item.paid_amount_date.forEach(paid => {
      //       oldKD += parseFloat(paid.amount) || 0;
      //     });
      //   }
      // });

      if (Array.isArray(item.paid_amount_date)) {
        const rate = parseFloat(item.today_rate) || 1; // fallback to 1 to avoid division by zero
        item.paid_amount_date.forEach(paid => {
          const paidAmount = parseFloat(paid.amount) || 0;
          oldKD += paidAmount / rate;
        });
      }
    });

    const totalKD = totalINR / todayRate;
    const localKD = totalKD;
    const kdCombined = localKD - oldKD;
    const finalKD = totalKD - kdCombined;

    // ✅ Build Agent based on role
    let totalLocal = 0;
    let clientDetails = "";
    let count = 1;

    filterDateData.forEach(client => {
      const paymentsToday = client.paid_amount_date
        ? client.paid_amount_date.filter(payment => /*payment.date === currentDate &&*/ payment.userID === employee.user_id)
        : [];

      if (paymentsToday.length > 0) {
        let clientTotalInternational = 0;
        let clientTotalLocal = 0;

        paymentsToday.forEach(payment => {
          const intlAmount = parseFloat(payment.amount) || 0;
          const localAmount = intlAmount / (client.today_rate > 0 ? client.today_rate : 1);

          clientTotalInternational += intlAmount;
          clientTotalLocal += localAmount;
        });

        totalLocal += clientTotalLocal;

        clientDetails += `${count}  | Client Name : ${client.client_name}, \n` +
          `      Collection Date :  ${formattedDate}, \n` +
          `      Collection Local Amount : ${(clientTotalLocal).toFixed(3)}\n` +
          `------------------------------------------------------------\n\n`;
        count++;
      }
    });

    // if (totalLocal === 0) {
    //   Alert.alert("No Payments", "This agent has not received any payments today.");
    //   return;
    // }


    // ✅ Build message based on role
    let message = '';

    if (employee.role === 'Distributor') {
      message =
        `🔹 *Distributor Report*\n\n` +
        `👤 *Distributor Name* : ${employee.username} \n` +
        `📅 *Date* : ${formattedDate} \n` +
        `💰 *Today Rate* : ${todayRate.toFixed(2)} \n\n` +
        `📦 *INR Collection*\n` +
        `${inrDetails}\n` +
        `--------------------------\n\n` +
        `🔹TOTAL INR : ${totalINR.toFixed(2)}\n` +
        `🔹TOTAL KD : ${totalKD.toFixed(3)}\n` +
        `🔹OLD KD : ${oldKD.toFixed(3)}\n` +
        `🔹KD : ${kdCombined.toFixed(3)}`;
    } else if (employee.role === 'Collection Agent') {
      message =
        `🔹 *Agent Report*\n` +
        `Agent Name : ${employee.username} \n` +
        `Collection Date : ${formattedDate} \n\n` +
        clientDetails.trim() +
        `\n🔹 *TOTAL COLLECTION LOCAL  AMOUNT:* ${(totalLocal).toFixed(3)}`;
    }

    // const message =
    //   `🔹 *Distributor Report*\n\n` +
    //   `👤 *Distributor Name* : ${employee.username} \n` +
    //   `📅 *Date* : ${formattedDate} \n` +
    //   `💰 *Today Rate* : ${todayRate.toFixed(2)} \n\n` +
    //   `📦 *INR Collection*\n` +
    //   `${inrDetails}\n` +
    //   `--------------------------\n\n` +
    //   `🔹TOTAL INR : ${totalINR.toFixed(2)}\n` +
    //   `🔹TOTAL KD : ${totalKD.toFixed(3)}\n` +
    //   `🔹OLD KD : ${oldKD.toFixed(3)}\n` +
    //   `🔹KD : ${kdCombined.toFixed(3)} `;    //(Remaining: KD ${finalKD.toFixed(3)})



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





  const currentDate = moment().format('DD-MM-YYYY');

  const isCalendarOkButtonDisabled = !selectedDate;

  const handleClearDates = () => {
    setSelectedDate('');
    setFilterDateData(clientsData);
    setDisplayDate(moment().format('DD-MM-YYYY')); // Reset to today
  }

  const handleCancelCalendar = () => {
    setIsCalendarVisible(false);
  }

  const toggleCalendar = () => {
    setIsCalendarVisible(!isCalendarVisible);
  }

  const handleConfirmDateSelection = () => {
    if (!selectedDate) return;

    const formattedSelectedDate = moment(selectedDate, "YYYY-MM-DD").format("DD-MM-YYYY");
    setDisplayDate(formattedSelectedDate); // Update displayed date
    // console.log('formattedSelectedDate', formattedSelectedDate);

    // const distributorFilteredData = clientsData.filter((item) => (
    //   item.date === formattedSelectedDate
    // ))

    let filteredData = [];

    if (employee.role === "Distributor") {
      filteredData = clientsData.filter((item) => item.date === formattedSelectedDate);
    } else if (employee.role === "Collection Agent") {
      filteredData = clientsData.map((item) => ({
        ...item,
        paid_amount_date: item.paid_amount_date?.filter(
          (payment) => payment.date === formattedSelectedDate
        ) || [],
      }))
        .filter((item) => item.paid_amount_date.length > 0);
    }

    setFilterDateData(filteredData); // Apply the correct filtered data
    setIsCalendarVisible(false); // Close the modal
    // console.log('filteredData', filteredData);

    setIsCalendarVisible(false); // Close the modal
  };


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

      // const expandedClientsData = response.data.flatMap(client => {
      //   if (Array.isArray(client.paid_amount_date) && client.paid_amount_date.length > 0) {
      //     return client.paid_amount_date.map(payment => ({
      //       ...client,
      //       paid_amount: payment.amount, // Use the specific paid amount
      //       paid_date: payment.date, // Store the date separately for clarity
      //       userID: payment.userID, // Ensure correct association
      //     }));
      //   }
      //   return client; // Keep the original entry if no payments are recorded
      // });

      setClientsData([...singleDistributorClientists, ...singleAgentClientLists]);
      setFilterDateData([...singleDistributorClientists, ...singleAgentClientLists]);
      // console.log('---------', singleDistributorClientists);
      // console.log('Filtered Employee Clients Data:', singleAgentClientLists);

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
      setSelectedDate('');
    }, [])
  )

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


  //Distributor over all International total amount
  const overAllTotalInterAmountDistributor = clientsData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  //Distributor over all Local total amount
  const overAllTotalLocalAmountDistribitor = clientsData.reduce(
    (sum, item) => sum + ((item.amount / item.today_rate) || 0),
    0
  );

  // Agent over all International total amount
  const overAllTotalInterAmountAgent = clientsData.reduce((sum, item) => {
    if (Array.isArray(item.paid_amount_date)) {
      return sum + item.paid_amount_date.reduce((subSum, entry) => subSum + (entry.amount || 0), 0);
    }
    return sum;
  }, 0);
  // console.log('overAllTotalInterAmountAgent', overAllTotalInterAmountAgent.toFixed(2));

  // Agent over all Local total amount
  const overAllTotalLocalAmountAgent = clientsData.reduce((sum, item) => {
    if (Array.isArray(item.paid_amount_date)) {
      return sum + item.paid_amount_date.reduce((subSum, entry) => subSum + ((entry.amount / item.today_rate) || 0), 0);
    }
    return sum;
  }, 0);


  const filteredTotalInterAmountDistributor = filterDateData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  // console.log('filteredTotalInterAmountDistributor', filteredTotalInterAmountDistributor.toFixed(2));

  const filteredTotalLocalAmountDistributor = filterDateData.reduce((sum, item) => sum + ((item.amount / item.today_rate) || 0), 0);
  // console.log('filteredTotalLocalAmountDistributor', filteredTotalLocalAmountDistributor.toFixed(3));

  const filteredTotalInterAmountAgent = filterDateData.reduce((sum, item) => {
    if (Array.isArray(item.paid_amount_date)) {
      return sum + item.paid_amount_date.reduce((subSum, entry) => subSum + (entry.amount || 0), 0);
    }
    return sum;
  }, 0);
  // console.log('filteredTotalInterAmountAgent', filteredTotalInterAmountAgent.toFixed(2));

  const filteredTotalLocalAmountAgent = filterDateData.reduce((sum, item) => {
    if (Array.isArray(item.paid_amount_date)) {
      return sum + item.paid_amount_date.reduce((subSum, entry) => subSum + ((entry.amount / item.today_rate) || 0), 0);
    }
    return sum;
  }, 0);
  // console.log('filteredTotalLocalAmountAgent', filteredTotalLocalAmountAgent.toFixed(2));

  const renderItem = ({ item, index }) => {

    const kuwaitLocalAmountValue = item.amount / item.today_rate;

    // Calculate total paid amount
    const interTotalPaidAmount = Array.isArray(item.paid_amount_date)
      ? item.paid_amount_date.reduce((sum, entry) => sum + (entry.amount || 0), 0)
      : 0;

    const localTotalPaidAmount = interTotalPaidAmount / item.today_rate;

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
        <View style={[styles.itemContainer, { flex: 4, }]}>
          <Text style={styles.cell} numberOfLines={1}>{(item.client_name || '').replace(/"/g, '')}</Text>
          <Text style={styles.cityText}>{item.client_contact || ''}</Text>
        </View>
        {/* <View style={[styles.itemContainer, { flex: 4, }]}>
          <Text style={[styles.cell, { textTransform: 'uppercase', color: Colors.DEFAULT_DARK_BLUE, }]}>inter : {Number(item.amount || 0.00).toFixed(2)}</Text>
          <Text style={[styles.cell, { textTransform: 'uppercase', color: Colors.DEFAULT_DARK_RED }]}>local : {Number(item.amount || 0.00).toFixed(2)}</Text>
        </View> */}
        <Text style={[styles.cell, { flex: 4, }]}>
          <Text style={
            {
              textTransform: 'uppercase',
              color: Colors.DEFAULT_DARK_BLUE,
            }
          } numberOfLines={1}>inter : </Text>{employee.role === "Distributor" ? roundAmount(item.amount || 0.00).toFixed(2) : (interTotalPaidAmount || 0.00).toFixed(2)}
          {"\n"}
          <Text style={
            {
              textTransform: 'uppercase',
              color: Colors.DEFAULT_DARK_RED,
            }
          } numberOfLines={1}>local : </Text>{employee.role === "Distributor" ? (kuwaitLocalAmountValue || 0.000).toFixed(3) : (localTotalPaidAmount || 0.000).toFixed(3)}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
      {/* <Separator height={StatusBar.currentHeight} /> */}

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


      <View style={styles.header}>
        <Text style={[styles.heading, { flex: 1 }]}>ID</Text>
        <Text style={[styles.heading, { flex: 4 }]}>Name</Text>
        <Text style={[styles.heading, { flex: 4 }]}>{employee.role === "Distributor" ? "Total Amount" : "Paid Amount"}</Text>
      </View>

      {/* Data Loading and Display */}
      {/* {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
      ) : clientsData.length > 0 ? (
        <FlatList
          data={clientsData
            .sort((a, b) => b.client_id - a.client_id)
            .filter((item) => {
              const searchTextLower = searchText.toLowerCase();
              return (
                item.client_name?.toLowerCase().includes(searchTextLower) ||
                item.client_contact?.toString().includes(searchText)
              );
            })}
          keyExtractor={(item) => item.client_id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
        />
      ) : (
        <Text style={styles.emptyText}>Today No Clients!</Text>
      )} */}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.DEFAULT_DARK_BLUE} style={{ marginTop: 20 }} />
      ) : (selectedDate ? filterDateData.length > 0 : clientsData.length > 0) ? (
        <FlatList
          data={(selectedDate ? filterDateData : clientsData) // Use filterDateData if a date is selected, else clientsData
            .sort((a, b) => b.client_id - a.client_id)
            .filter((item) => {
              const searchTextLower = searchText.toLowerCase();
              return (
                item.client_name?.toLowerCase().includes(searchTextLower) ||
                item.client_contact?.toString().includes(searchText)
              );
            })}
          keyExtractor={(item) => item.client_id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
        />
      ) : (
        <Text style={styles.emptyText}>Selected Date No Clients!</Text>
      )}


      <View style={styles.todayCollectionContainer}>
        {/* <Text style={styles.todayCollectionText}>Today Collections</Text> */}
        {/* <Text style={styles.todayCollectionText}>Inter : {employee.role === "Distributor" ? overAllTotalInterAmountDistributor.toFixed(2) || 0.00 : overAllTotalInterAmountAgent.toFixed(2) || 0.00}</Text> */}
        {/* <Text style={styles.todayCollectionText}>Local : {employee.role === "Distributor" ? overAllTotalLocalAmountDistribitor.toFixed(3) || 0.000 : overAllTotalLocalAmountAgent.toFixed(3) || 0.000}</Text> */}
        <Text style={styles.todayCollectionText}>
          Inter : {employee.role === "Distributor"
            ? (filterDateData.length > 0 ? filteredTotalInterAmountDistributor.toFixed(2) : overAllTotalInterAmountDistributor.toFixed(2)) || "0.00"
            : (filterDateData.length > 0 ? filteredTotalInterAmountAgent.toFixed(2) : overAllTotalInterAmountAgent.toFixed(2)) || "0.00"
          }
        </Text>
        <Text style={styles.todayCollectionText}>
          Local : {employee.role === "Distributor"
            ? (filterDateData.length > 0 ? filteredTotalLocalAmountDistributor.toFixed(3) : overAllTotalLocalAmountDistribitor.toFixed(3)) || "0.00"
            : (filterDateData.length > 0 ? filteredTotalLocalAmountAgent.toFixed(3) : overAllTotalLocalAmountAgent.toFixed(3)) || "0.00"
          }
        </Text>
      </View>

    </View >
  )
}

export default SingleEmployeeClientListScreen

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
    fontSize: 16,
    lineHeight: 16 * 1.4,
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
    fontSize: 18,
    lineHeight: 18 * 1.4,
    textAlign: 'center',
    color: Colors.DEFAULT_WHITE,
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 16 * 1.4,
    textAlign: 'center',
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    marginVertical: 10,
    color: Colors.DEFAULT_DARK_RED
  },
  flatListContainer: {
    paddingBottom: 50,
    // borderWidth:1
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
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
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
    paddingTop: 5,
    textTransform: 'uppercase'
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
  }
})