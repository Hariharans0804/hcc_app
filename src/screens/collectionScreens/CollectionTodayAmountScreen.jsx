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
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import moment from 'moment';
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";


const CollectionTodayAmountScreen = () => {

  const [singleAgentTodayCollectionList, setSingleAgentTodayCollectionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [agentloginUserDataID, setAgentloginUserDataID] = useState(null);
  const [agentLoginUserData, setAgentLoginUserData] = useState('');
  // console.log('agentloginUserDataID', agentloginUserDataID);
  // console.log('agentLoginUserData', agentLoginUserData);
  // console.log('singleAgentTodayCollectionList', singleAgentTodayCollectionList);



  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });

  const fetchGetagentloginUserDataID = async () => {
    try {
      const data = await getFromStorage('users');
      // console.log('010101', data);
      const agentLoginUserID = data?.userID;
      // console.log('101010',agentLoginUserID);
      setAgentloginUserDataID(agentLoginUserID);
      setAgentLoginUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // Fetch clients data
  const fetchTodayCollectionDataList = async () => {
    if (!agentloginUserDataID) {
      // console.error('Agent login user data is missing');
      console.log('agentloginUserDataID:', agentloginUserDataID);
      return;
    }

    setLoading(true);
    try {
      // const response = await axios.get(`${API_HOST}/fetchUserlistIDS/${agentloginUserDataID}`);
      // const response = await axiosInstance.get(`/fetchUserlistID/${agentloginUserDataID}`);

      // // Log the full response to verify if CombinedData is populated
      // // console.log('API Response:', response.data);

      // const combinedData = response.data?.clientdata?.CombinedData || [];
      // // console.log('CombinedData:', combinedData);

      // const todayCollectionsList = combinedData.flatMap(user => user.collections || []);

      // setSingleAgentTodayCollectionList(todayCollectionsList);
      // // console.log('Collections List:', todayCollectionsList);


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

      setSingleAgentTodayCollectionList(response.data);
      // console.log('today collection amount', response.data);

    } catch (error) {
      console.error('Error fetching clients data:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  }


  // Combine both fetches with loading states
  useFocusEffect(
    useCallback(() => {
      const fetchTodayData = async () => {
        await fetchGetagentloginUserDataID();
        fetchTodayCollectionDataList();
      }
      fetchTodayData();

      // Reset the search text whenever the screen gains focus
      setSearchText('');
    }, [agentloginUserDataID])
  )


  // // Filter, search, and sort clients
  // const todayClientsCollectionAmountList = useMemo(() => {
  //   const currentDate = moment().format('DD-MM-YYYY');
  //   return singleAgentTodayCollectionList
  //     .filter((item) => {
  //       // Filter clients with payments today
  //       const hasPaymentsToday =
  //         Array.isArray(item.paid_amount_date) &&
  //         item.paid_amount_date.some((entry) => entry.date === currentDate);

  //       // Apply search filtering
  //       const searchTextLower = searchText.toLowerCase();
  //       // const assignedUsername = employeeMap[item.user_id]?.toLowerCase() || '';

  //       const matchesSearch =
  //         item.client_name?.toLowerCase().includes(searchTextLower) ||
  //         item.client_contact?.toString().includes(searchText);
  //       // assignedUsername.includes(searchTextLower);

  //       return hasPaymentsToday && matchesSearch;
  //     })
  //     .sort((a, b) => {
  //       // Sort by the latest payment time
  //       const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
  //       const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;
  //       return bLastPayment - aLastPayment;
  //     });
  // }, [singleAgentTodayCollectionList, searchText,]);


  // // Calculate the total collection amount for today
  // const totalCollectionToday = useMemo(() => {
  //   const currentDate = moment().format('DD-MM-YYYY');
  //   return singleAgentTodayCollectionList.reduce((total, client) => {
  //     const paymentsToday = Array.isArray(client.paid_amount_date)
  //       ? client.paid_amount_date.filter((entry) => entry.date === currentDate)
  //       : [];
  //     const totalPaidToday = paymentsToday.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
  //     return total + totalPaidToday;
  //   }, 0);
  // }, [singleAgentTodayCollectionList]);


  const todayClientsCollectionAmountList = useMemo(() => {
    const currentDate = moment().format('DD-MM-YYYY');

    return singleAgentTodayCollectionList
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
          agentName: payment.userID === agentLoginUserData.userID ? agentLoginUserData.name : '-',
          paid_time: client.paid_amount_time, // Assuming it's payment.time
        }))
          .filter(agent => agent.agentName === agentLoginUserData.name);
      })
      .filter((item) => {
        // Search functionality
        const searchTextLower = searchText.toLowerCase();
        // const agentName =
        //   agentLoginUserData.userID === item.agent_id
        //     ? agentLoginUserData.name?.toLowerCase() || 'Not Found'
        //     : '-';

        return (
          item.client_name.toLowerCase().includes(searchTextLower) ||
          item.client_contact.includes(searchText)
          // ||
          // agentName.includes(searchTextLower)
        );
      })
      .sort((a, b) => {
        const aTime = a.paid_time ? new Date(a.paid_time).getTime() : 0;
        const bTime = b.paid_time ? new Date(b.paid_time).getTime() : 0;
        return bTime - aTime;
      });
  }, [singleAgentTodayCollectionList, searchText, agentLoginUserData]);

  // console.log('0000000000', todayClientsCollectionAmountList);



  const totalCollectionToday = useMemo(() => {
    const currentDate = moment().format('DD-MM-YYYY');

    return singleAgentTodayCollectionList.reduce((total, client) => {

      const paymentsToday = client.paid_amount_date?.filter(
        (entry) => entry.date === currentDate && entry.userID === agentLoginUserData.userID
      );

      const totalClientPaymentTodayInternational = paymentsToday?.reduce(
        (sum, payment) => sum + parseFloat(payment.amount || 0),
        0
      );

      const totalClientPaymentTodayLocal = paymentsToday?.reduce(
        (sum, payment) => {
          const convertedAmount = payment.amount / (client.today_rate || 1); // Avoid division by zero
          return sum + convertedAmount;
        },
        0
      );

      const internationalTotalAmount = total + (totalClientPaymentTodayLocal || 0);
      const localTotalAmount = total + (totalClientPaymentTodayLocal || 0);
      // console.log('internationalTotal', internationalTotal);

      return localTotalAmount;
    }, 0);

  }, [singleAgentTodayCollectionList]);


  const onPressClearTextEntry = () => {
    // console.log('Remove');
    setSearchText('');
  }

  let rowsIndex = 0;

  const renderItem = ({ item, index }) => {

    const currentDate = moment().format('DD-MM-YYYY'); // Get the current date in the same format as the data
    const currentDatePayments = Array.isArray(item.paid_amount_date)
      ? item.paid_amount_date.filter(entry => entry.date === currentDate)
      : [];

    // Calculate the total amount paid today single person
    const totalPaidToday = currentDatePayments.reduce(
      (total, entry) => total + parseFloat(entry.amount || 0), 0
    );


    rowsIndex++;

    const kuwaitLocalAmountValue = item.amount / item.today_rate;

    return (

      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 1 }]}>
          {rowsIndex}
          {/* {index + 1} */}
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>
          {(item.client_name || '').replace(/"/g, '')}
          {/* {"\n"}
          <Text style={styles.cityText}>{item.client_city || ''}</Text> */}
          {"\n"}
          <Text style={styles.cityText}>
            {/* {item.client_city || ''} */}
            {/* {employeesData.find((empid) => empid.user_id === item.user_id)?.username || 'Not Found'} */}
            {item.agentName}
            {/* {"\n"}
            {item.today_rate} */}
          </Text>
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
        <Text style={[styles.cell, { flex: 2 }]}>
          {/* {totalPaidToday > 0 ? `${totalPaidToday}` : "-"} */}
          {/* {item.amount.toFixed(2)} */}
          {kuwaitLocalAmountValue.toFixed(3)}
          {'\n'}
          <Text style={styles.cityText}>
            {item.payment_date}
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
          {searchText && (
            <TouchableOpacity activeOpacity={0.8} onPress={onPressClearTextEntry}>
              <AntDesign
                name="closecircleo"
                size={20}
                color={Colors.DEFAULT_BLACK}
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.header}>
        <Text style={[styles.heading, { flex: 1 }]}>No</Text>
        <Text style={[styles.heading, { flex: 3 }]}>Name</Text>
        <Text style={[styles.heading, { flex: 3 }]}>Mobile</Text>
        <Text style={[styles.heading, { flex: 2 }]}>Amount</Text>
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
        <Text style={styles.todayCollectionText}>Today Collections : {totalCollectionToday ? totalCollectionToday.toFixed(3) : 0}</Text>
      </View>
    </View>
  )
}

export default CollectionTodayAmountScreen

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
    // borderWidth:1
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
    width: Display.setWidth(70),
    paddingRight: 15,
    // borderWidth:1,
    // textAlign:'center'
  },
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
    fontSize: 20,
    lineHeight: 20 * 1.4,
    fontWeight: 800,
    textAlign: 'center',
    marginRight: 10,
    fontFamily: Fonts.POPPINS_REGULAR,
    color: Colors.DEFAULT_LIGHT_WHITE,
    paddingVertical: 15
    // backgroundColor:Colors
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
  flatListContainer: {
    paddingBottom: 50,
    // borderWidth:1
  },
})