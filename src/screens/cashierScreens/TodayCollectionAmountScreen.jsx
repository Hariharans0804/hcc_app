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

const TodayCollectionAmountScreen = () => {

  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [employeesData, setEmployeesData] = useState([]);
  const [agentList, setAgentList] = useState([]);
  const [singleAgentFilterData, setSingleAgentFilterData] = useState('')


  const currentDate = moment().format('DD-MM-YYYY');

  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });


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

      const collectionAgentList = response.data
        .filter((item) => item.role === "Collection Agent")
        .map((item) => ({
          label: item.username,
          value: item.user_id,
        }));

      setAgentList(collectionAgentList);
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


  // Fetch clients data
  const fetchClientsData = async () => {
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
      // const response = await axios.get(`${API_HOST}/acc_list`, {
      const response = await axiosInstance.get('/acc_list', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization, // Include the token in the Authorization header
        },
      });

      setClientsData(response.data);
      // console.log('today collection amount', response.data);
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
        await Promise.all([fetchEmployeesData(), fetchClientsData()]);
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


  // Filter, search, and sort clients
  // const todayClientsCollectionAmountList = useMemo(() => {
  //   const currentDate = moment().format('DD-MM-YYYY');

  //   return clientsData
  //     .filter((item) => {
  //       // Filter clients with payments today
  //       const hasPaymentsToday =
  //         Array.isArray(item.paid_amount_date) &&
  //         item.paid_amount_date.some((entry) => entry.date === currentDate);

  //       // Apply search filtering
  //       const searchTextLower = searchText.toLowerCase();
  //       const assignedUsername = employeeMap[item.user_id]?.toLowerCase() || '';

  //       const matchesSearch =
  //         item.client_name?.toLowerCase().includes(searchTextLower) ||
  //         item.client_contact?.toString().includes(searchText) ||
  //         assignedUsername.includes(searchTextLower);

  //       return hasPaymentsToday && matchesSearch;
  //     })
  //     .sort((a, b) => {
  //       // Sort by the latest payment time
  //       const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
  //       const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;
  //       return bLastPayment - aLastPayment;
  //     });
  // }, [clientsData, searchText, employeeMap]);


  // // Calculate the total collection amount for today
  // const totalCollectionToday = useMemo(() => {
  //   const currentDate = moment().format('DD-MM-YYYY');

  //   return clientsData.reduce((total, client) => {
  //     const paymentsToday = Array.isArray(client.paid_amount_date)
  //       ? client.paid_amount_date.filter((entry) => entry.date === currentDate)
  //       : [];
  //     const totalPaidToday = paymentsToday.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
  //     return total + totalPaidToday;
  //   }, 0);
  // }, [clientsData]);


  const agentMap = useMemo(() => {
    return employeesData.reduce((acc, emp) => {
      acc[emp.user_id] = emp.username.toLowerCase();
      return acc;
    }, {});
  }, [employeesData]);


  const todayClientsCollectionAmountList = useMemo(() => {
    const currentDate = moment().format('DD-MM-YYYY');

    return clientsData
      .flatMap((client) => {
        if (!Array.isArray(client.paid_amount_date)) return [];

        // Payments made today
        const paymentsToday = client.paid_amount_date.filter(
          (entry) => entry.date === currentDate
        );

        // Convert each payment into a separate row with client and agent info
        return paymentsToday.map((payment) => ({
          client_id: client.client_id,
          client_name: client.client_name,
          client_contact: client.client_contact,
          today_rate: client.today_rate,
          amount: payment.amount,
          agent_id: payment.userID,
          payment_date: payment.date,
          paid_time: client.paid_amount_time, // Assuming it's payment.time
        }));
      })
      .filter((item) => {
        // Search functionality
        const searchTextLower = searchText.toLowerCase();
        const agentName = agentMap[item.agent_id] || "-";
        // const agentName =
        //   employeesData.find((emp) => emp.user_id === item.agent_id)?.username.toLowerCase() ||
        //   '-';

        // ✅ Filter by selected agent
        const isAgentMatch = singleAgentFilterData
          ? item.agent_id === singleAgentFilterData
          : true;

        return (
          isAgentMatch && (
            item.client_name.toLowerCase().includes(searchTextLower) ||
            item.client_contact.includes(searchText) ||
            agentName.includes(searchTextLower)
          )
        );
      })
      .sort((a, b) => {
        const aTime = a.paid_time ? new Date(a.paid_time).getTime() : 0;
        const bTime = b.paid_time ? new Date(b.paid_time).getTime() : 0;
        return bTime - aTime;
      });
  }, [clientsData, searchText, employeesData, singleAgentFilterData,]);
  // console.log('22222222',todayClientsCollectionAmountList);



  const totalCollectionToday = useMemo(() => {
    const currentDate = moment().format('DD-MM-YYYY');

    return clientsData.reduce((total, client) => {

      // const paymentsToday = client.paid_amount_date?.filter(
      //   (entry) => entry.date === currentDate
      // );

      // const totalClientPaymentTodayInternational = paymentsToday?.reduce(
      //   (sum, payment) => sum + parseFloat(payment.amount || 0),
      //   0
      // );

      // const totalClientPaymentTodayLocal = paymentsToday?.reduce(
      //   (sum, payment) => {
      //     const convertedAmount = payment.amount / (client.today_rate || 1); // Avoid division by zero
      //     return sum + convertedAmount;
      //   },
      //   0
      // );

      //   const internationalTotalAmount = total + (totalClientPaymentTodayInternational || 0);
      //   const localTotalAmount = total + (totalClientPaymentTodayLocal || 0);

      //   return localTotalAmount;

      // }, 0);

      // Check if the client's payments exist
      const paymentsToday = client.paid_amount_date
        ? client.paid_amount_date.filter((entry) => entry.date === currentDate)
        : [];


      // Filter payments based on selected agent
      const filteredPayments = singleAgentFilterData
        ? paymentsToday.filter((payment) => payment.userID === singleAgentFilterData)
        : paymentsToday;

      const totalClientPaymentTodayInternational = filteredPayments.reduce(
        (sum, payment) => sum + (parseFloat(payment.amount) || 0),
        0
      );

      const totalClientPaymentTodayLocal = filteredPayments.reduce((sum, payment) => {
        const rate = client.today_rate || 1; // Avoid division by zero
        const convertedAmount = payment.amount ? payment.amount / rate : 0;
        return sum + convertedAmount;
      }, 0);

      return {
        localTotalAmount: (total.localTotalAmount || 0) + totalClientPaymentTodayLocal,
        internationalTotalAmount: (total.internationalTotalAmount || 0) + totalClientPaymentTodayInternational,
      };
    },
      { localTotalAmount: 0, internationalTotalAmount: 0 }
    );
  }, [clientsData, singleAgentFilterData]);

  // console.log('totalCollectionToday', totalCollectionToday);

  const roundAmount = (amount) => {
    const whole = Math.floor(amount); // Get the integer part
    const decimal = amount - whole; // Get the decimal part

    if (decimal <= 0.49) {
      return whole; // Round down
    } else {
      return whole + 1; // Round up
    }
  };
  

  // const sendWhatsAppMessage = () => {
  //   if (!singleAgentFilterData) {
  //     Alert.alert("No Agent Selected", "Please select an agent first.");
  //     return;
  //   }

  //   // Find the selected agent in employeesData
  //   const selectedAgent = employeesData.find(emp => emp.user_id === singleAgentFilterData);

  //   if (!selectedAgent || !selectedAgent.phone_number) {
  //     Alert.alert("Phone Number Not Found", "This agent does not have a registered phone number.");
  //     return;
  //   }

  //   // Get current date
  //   const currentDate = moment().format('DD-MM-YYYY');

  //   // Calculate total local and international amounts received by the agent today
  //   let totalInternational = 0;
  //   let totalLocal = 0;
  //   let clientDetails = "";

  //   clientsData.forEach(client => {
  //     // Filter payments for today and by selected agent
  //     const paymentsToday = client.paid_amount_date
  //       ? client.paid_amount_date.filter(payment => payment.date === currentDate && payment.userID === singleAgentFilterData)
  //       : [];

  //     if (paymentsToday.length > 0) {
  //       let clientTotalInternational = 0;
  //       let clientTotalLocal = 0;

  //       paymentsToday.forEach(payment => {
  //         const internationalAmount = parseFloat(payment.amount) || 0;
  //         const localAmount = internationalAmount / (client.today_rate > 0 ? client.today_rate : 1);

  //         clientTotalInternational += internationalAmount;
  //         clientTotalLocal += localAmount;
  //       });

  //       totalInternational += clientTotalInternational;
  //       totalLocal += clientTotalLocal;

  //       // Append client details
  //       clientDetails += `👤 ${client.client_name}\n🌍 Intl: ${roundAmount(clientTotalInternational).toFixed(2)}\n🏡 Local: ${roundAmount(clientTotalLocal).toFixed(3)}\n\n`;
  //     }
  //   });

  //   if (totalInternational === 0 && totalLocal === 0) {
  //     Alert.alert("No Payments", "This agent has not received any payments today.");
  //     return;
  //   }

  //   // Format WhatsApp message
  //   const whatsappNumber = selectedAgent.phone_number.replace(/\D/g, ''); // Remove non-numeric characters


  //   const message = `Hello ${selectedAgent.username},\n\n📅 *Today's Collection Summary*\n\n` +
  //     `🌍 *Total International:* ${roundAmount(totalInternational).toFixed(2)}\n` +
  //     `🏡 *Total Local:* ${roundAmount(totalLocal).toFixed(3)}\n\n` +
  //     `📌 *Client Breakdown:*\n${clientDetails.trim()}`;

  //   // Open WhatsApp with pre-filled message
  //   const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
  //   const webFallbackUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  //   Linking.canOpenURL(whatsappUrl)
  //     .then(supported => {
  //       if (supported) {
  //         Linking.openURL(whatsappUrl);
  //       } else {
  //         Linking.openURL(webFallbackUrl); // Open in browser as a fallback
  //         Alert.alert("WhatsApp Not Installed", "Please install WhatsApp to send messages.");
  //       }
  //     })
  //     .catch(err => console.error("Error opening WhatsApp:", err));
  // };


  const sendWhatsAppMessage = () => {
    if (!singleAgentFilterData) {
      Alert.alert("No Agent Selected", "Please select an agent first.");
      return;
    }

    const selectedAgent = employeesData.find(emp => emp.user_id === singleAgentFilterData);
    // console.log(selectedAgent);


    if (!selectedAgent || !selectedAgent.phone_number) {
      Alert.alert("Phone Number Not Found", "This agent does not have a registered phone number.");
      return;
    }

    const currentDate = moment().format('DD-MM-YYYY');

    let totalLocal = 0;
    let clientDetails = "";
    let count = 1;

    clientsData.forEach(client => {
      const paymentsToday = client.paid_amount_date
        ? client.paid_amount_date.filter(payment => payment.date === currentDate && payment.userID === singleAgentFilterData)
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
          `      Collection Date :  ${currentDate}, \n` +
          `      Collection Local Amount : ${(clientTotalLocal).toFixed(3)}\n` +
          `------------------------------------------------------------\n\n`;
        count++;
      }
    });

    if (totalLocal === 0) {
      Alert.alert("No Payments", "This agent has not received any payments today.");
      return;
    }

    const whatsappNumber = selectedAgent.phone_number.replace(/\D/g, '');

    const message =
      `🔹 *Agent Report*\n` +
      `Agent Name : ${selectedAgent.username} \n` +
      `Collection Date : ${currentDate} \n\n` +
      clientDetails.trim() +
      `\n🔹 *TOTAL COLLECTION LOCAL  AMOUNT:* ${(totalLocal).toFixed(3)}`;

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




  const renderItem = ({ item, index }) => {

    const currentDate = moment().format('DD-MM-YYYY'); // Get the current date in the same format as the data
    const currentDatePayments = Array.isArray(item.paid_amount_date)
      ? item.paid_amount_date.filter(entry => entry.date === currentDate)
      : [];

    // Calculate the total amount paid today single person
    const totalPaidToday = currentDatePayments.reduce(
      (total, entry) => total + parseFloat(entry.amount || 0), 0
    );


    const agentName = employeesData.find((emp) => emp.user_id === item.agent_id)?.username || 'Not Found';

    const kuwaitLocalAmountValue = item.amount / item.today_rate;

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
        {/* <Text style={[styles.cell, { flex: 3 }]}>
          {(item.client_name || '').replace(/"/g, '')}
          {"\n"}
          <Text style={styles.cityText}> */}
        {/* {employeesData.find((empid) => empid.user_id === item.user_id)?.username || 'Not Found'} */}
        {/* {item.paid_amount_date.map((payment, index) => {
              const username = employeesData.find((emp) => emp.user_id === payment.userID)?.username || 'Not Found';
              return `${username}${index < item.paid_amount_date.length - 1 ? ', ' : ''}`;
            })} */}
        {/* {item.client_contact}
          </Text>
        </Text> */}

        <View style={{ alignItems: 'center', flex: 4 }}>
          <Text style={styles.cell} numberOfLines={1}>{(item.client_name || '').replace(/"/g, '')}</Text>
          <Text style={styles.cityText}>{item.client_contact}</Text>
        </View>

        <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{agentName}</Text>


        {/* {totalPaidToday > 0 ? `${totalPaidToday}` : "-"} */}
        <Text style={[styles.cell, { flex: 4 }]}>
          <Text style={{ textTransform: 'uppercase', color: Colors.DEFAULT_DARK_BLUE, }} numberOfLines={1}>inter : </Text>{roundAmount(item.amount).toFixed(2)}
          {"\n"}
          <Text style={{ textTransform: 'uppercase', color: Colors.DEFAULT_DARK_RED }} numberOfLines={1}>local : </Text>{kuwaitLocalAmountValue.toFixed(3)}
        </Text>

      </View>
    )
  }

  // console.log('00000000000',todayClientsCollectionAmountList);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
      {/* <Separator height={StatusBar.currentHeight} /> */}

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
            {/* <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsFocus((prev) => !prev)}
            >
              <MaterialIcons
                name="arrow-drop-down"
                size={30}
                color={Colors.DEFAULT_BLACK}
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity> */}
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


      {/* {isFocus && (
        <View style={[styles.dropdownWrapper, { position: 'absolute', top: 50, right: 25, zIndex: 9999 }]}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            containerStyle={{ marginTop: -5 }}
            maxHeight={250}
            search
            searchPlaceholder="Search..."
            data={agentList}
            labelField="label"
            valueField="value"
            placeholder={!singleAgentFilterData ? "Search Agent" : ""}
            value={singleAgentFilterData}
            onChange={(item) => {
              setSingleAgentFilterData(item.value);
              setIsFocus(false); // Close dropdown after selection
              setSearchText(item.label); // 🔹 Updates the SearchInput box
            }}
            renderLeftIcon={() => (
              <AntDesign
                name="Safety"
                size={20}
                color={Colors.DEFAULT_DARK_BLUE}
                style={{ marginRight: 5, }}
              />
            )}
          />
        </View>
      )} */}

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
      ) : todayClientsCollectionAmountList.length > 0 ? (
        <FlatList
          data={todayClientsCollectionAmountList
            // .filter((item) => {
            //   const currentDate = moment().format('DD-MM-YYYY');
            //   // Filter clients who have payments on the current date
            //   const hasPaymentsToday = Array.isArray(item.paid_amount_date) &&
            //     item.paid_amount_date.some(entry => entry.date === currentDate);

            //   // Apply search filtering
            //   const searchTextLower = searchText.toLowerCase();

            //   // Fetch the username using the user_id
            //   const assignedUsername = employeeMap[item.user_id]?.toLowerCase() || '';

            //   const matchesSearch =
            //     item.client_name?.toLowerCase().includes(searchTextLower) ||
            //     item.client_contact?.toString().includes(searchText) ||
            //     assignedUsername.includes(searchTextLower);

            //   return hasPaymentsToday && matchesSearch; // Include only clients matching the search
            // })
            // .sort((a, b) => {
            //   // Get the last payment time from the 'paid_amount' field
            //   const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
            //   const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;

            //   // Sort descending: latest payment first
            //   return bLastPayment - aLastPayment;
            // })
          }
          // keyExtractor={(item) => item.client_id?.toString()}
          keyExtractor={(item, index) =>
            `${item.client_id}-${item.agent_id}-${item.amount}-${item.payment_date}-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
        // ListEmptyComponent={<Text style={styles.emptyText}>I haven't collected the amount yet.</Text>}
        />
      ) : (
        <Text style={styles.emptyText}>I haven't collected the amount yet!</Text>
      )}

      <View style={styles.todayCollectionContainer}>
        {/* <Text style={styles.todayCollectionText}>Today Collections</Text> */}
        {/* <Text style={styles.todayCollectionText}>Local : {totalCollectionToday ? totalCollectionToday.toFixed(3) : 0}</Text>
        <Text style={styles.todayCollectionText}>Inter : {totalCollectionToday ? totalCollectionToday.toFixed(3) : 0}</Text> */}
        <Text style={styles.todayCollectionText}>
          Inter : {totalCollectionToday.internationalTotalAmount.toFixed(2)}
        </Text>
        <Text style={styles.todayCollectionText}>
          Local : {totalCollectionToday.localTotalAmount.toFixed(3)}
        </Text>
      </View>

    </View>
  )
}

export default TodayCollectionAmountScreen

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
    color: '#8898A9',
    textAlign: 'center',
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
    paddingTop: 5,
    textTransform: 'uppercase'
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
  flatListContainer: {
    paddingBottom: 50,
    // borderWidth:1
  },
})



{/* <View style={{ flex: 4, padding:5,alignItems:'center'}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'left' }}>
            <Text style={{
              fontSize: 14,
              lineHeight: 14 * 1.4,
              fontFamily: Fonts.POPPINS_SEMI_BOLD,
              color: Colors.DEFAULT_DARK_BLUE,
              textTransform: 'uppercase'
            }}>inter : </Text>
            <Text>{roundAmount(item.amount).toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'left' }}>
            <Text style={{
              fontSize: 14,
              lineHeight: 14 * 1.4,
              fontFamily: Fonts.POPPINS_SEMI_BOLD,
              color: Colors.DEFAULT_DARK_RED,
              textTransform: 'uppercase'
            }}>local : </Text>
            <Text>{kuwaitLocalAmountValue.toFixed(3)}</Text>
          </View>
        </View> */}