import { ActivityIndicator, FlatList, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Separator } from '../../components'
import { Colors, Fonts, Images } from '../../constants'
import SearchInput from 'react-native-search-filter'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Display } from '../../utils'
import axios from 'axios'
import { useFocusEffect } from '@react-navigation/native'
import { getFromStorage } from '../../utils/mmkvStorage'
import { API_HOST } from "@env";

const SingleClientPaymentListScreen = ({ route, navigation }) => {
  const { clientPaymentList } = route.params; // Extract passed employee data
  // console.log('111111', clientPaymentList.paid_amount_date);

  const [loading, setLoading] = useState(true);
  const [employeesData, setEmployeesData] = useState([]);


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

      setLoading(true);
      // Axios GET request
      // const response = await axios.get(`${API_HOST}/list`, {
      const response = await axiosInstance.get('/list', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization, // Include the token in the Authorization header
        },
      });

      // const collectionAgentList = response.data.filter((item) =>
      //   item.user_id === clientPaymentList.user_id
      // );

      const collectionAgentList = response.data.filter((item) =>
        item.role === "Collection Agent"
      );

      setEmployeesData(collectionAgentList);
      // console.log(response.data);
      // console.log('22222', collectionAgentList);
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

  // Simulate loading delay
  useFocusEffect(
    useCallback(() => {
      fetchEmployeesData();
      const timer = setTimeout(() => {
        setLoading(false);  // Stop loading after 2 seconds (simulate processing)
      }, 1000);

      return () => clearTimeout(timer);  // Cleanup the timer
    }, [])
  )

  if (loading) {
    // Render loading spinner or text while data is being processed
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.DEFAULT_DARK_BLUE} />
      </View>
    );
  }


  // Ensure amount is a valid number before using .toFixed()
  const totalAmount = parseFloat(clientPaymentList.amount) || 0;


  // Over All Paid Amount International
  const overAllPaidAmount = Array.isArray(clientPaymentList.paid_amount_date)
    ? clientPaymentList.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount), 0)
    : 0;


  // Balance Amount International
  const balanceAmount = clientPaymentList.amount - overAllPaidAmount


  // console.log('0000000',balanceAmount);


  // Total Amount Local 
  // const localTotalAmount = clientPaymentList.amount / clientPaymentList.today_rate;
  const localTotalAmount = clientPaymentList.amount / (parseFloat(clientPaymentList.today_rate) || 1);


  // Over All Paid Amount Local
  // const localOverAllPaidAmount = overAllPaidAmount / clientPaymentList.today_rate;
  const localOverAllPaidAmount = overAllPaidAmount / (parseFloat(clientPaymentList.today_rate) || 1);



  // Balance Amount Local
  // const localBalanceAmount = balanceAmount / clientPaymentList.today_rate;
  const localBalanceAmount = balanceAmount / (parseFloat(clientPaymentList.today_rate) || 1);
  // console.log('localBalanceAmount', localBalanceAmount);


  const roundAmount = (amount) => {
    const whole = Math.floor(amount); // Get the integer part
    const decimal = amount - whole; // Get the decimal part

    if (decimal <= 0.49) {
      return whole; // Round down
    } else {
      return whole + 1; // Round up
    }
  };

  
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ paddingBottom: 20, paddingTop: 10 }}>
          <Image source={Images.MAN} resizeMode='contain' style={styles.image} />
          {/* <Text style={styles.headingText}>Agent Name : <Text style={styles.detailsText}>{employeesData.length > 0 ? employeesData[0].username : 'Not Found'}</Text></Text> */}
          <Text style={styles.headingText}>Client ID : <Text style={styles.detailsText}>{clientPaymentList.client_id}</Text></Text>
          <Text style={styles.headingText}>Client Name : <Text style={styles.detailsText}>{clientPaymentList.client_name}</Text></Text>
          <Text style={styles.headingText}>Mobile : <Text style={styles.detailsText}>{clientPaymentList.client_contact}</Text></Text>
          <Text style={styles.headingText}>City : <Text style={styles.detailsText}>{clientPaymentList.client_city}</Text></Text>
          <Text style={styles.headingText}>Date : <Text style={styles.detailsText}>{clientPaymentList.date}</Text></Text>
          <Text style={styles.headingText}>Today Rate : <Text style={styles.detailsText}>{clientPaymentList.today_rate}</Text></Text>
          <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Total Amount :</Text>
          <Text style={styles.headingText}>INTERNATIONAL : <Text style={styles.detailsText}>{totalAmount.toFixed(2)}</Text></Text>
          <Text style={styles.headingText}>LOCAL : <Text style={styles.detailsText}>{localTotalAmount.toFixed(3)}</Text></Text>
          <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Over All Paid Amount : </Text>
          <Text style={styles.headingText}>INTERNATIONAL : <Text style={styles.detailsText}>{roundAmount(overAllPaidAmount).toFixed(2)}</Text></Text>
          <Text style={styles.headingText}>LOCAL : <Text style={styles.detailsText}>{localOverAllPaidAmount.toFixed(3)}</Text></Text>
          <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Balance Amount : </Text>
          <Text style={styles.headingText}>INTERNATIONAL : <Text style={styles.detailsText}>{roundAmount(balanceAmount).toFixed(2)}</Text></Text>
          <Text style={styles.headingText}>LOCAL : <Text style={styles.detailsText}>{localBalanceAmount.toFixed(3)}</Text></Text>
          <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Full Paid Amount Date & Agent :</Text>

          <View style={styles.amountDateFullContainer}>

            <View style={styles.amountDateHeadingContainer}>
              <Text style={[styles.amountDateHeading, { flex: 1 }]}>Agent</Text>
              <Text style={[styles.amountDateHeading, { flex: 1.5 }]}>Date</Text>
              <Text style={[styles.amountDateHeading, { flex: 2 }]}>Amount</Text>
            </View>

            {Array.isArray(clientPaymentList.paid_amount_date) && clientPaymentList.paid_amount_date.length > 0 ? (
              clientPaymentList.paid_amount_date.map((entry, index) => {
                const agent = employeesData.find((agent) => agent.user_id === entry.userID);
                const agentName = agent ? agent.username : 'UNKNOWN';
                const localPaidAmount = entry.amount / clientPaymentList.today_rate;
                return (
                  <View key={index} style={styles.amountDateDetailsRow}>
                    <Text style={[styles.amountDateDetails, { flex: 1 }]}>{agentName}</Text>
                    <Text style={[styles.amountDateDetails, { flex: 1.5 }]}>{entry.date}</Text>
                    <Text style={[styles.amountDateDetails, { flex: 2 }]}>
                      INTER : {entry.amount.toFixed(2)}
                      {"\n"}
                      LOCAL : {localPaidAmount.toFixed(3)}
                    </Text>
                  </View>
                )
              })
            ) : (
              <View style={styles.amountDateDetailsRow}>
                <Text style={[styles.amountDateDetails, { flex: 1 }]}>-</Text>
                <Text style={[styles.amountDateDetails, { flex: 1.5 }]}>-</Text>
                <Text style={[styles.amountDateDetails, { flex: 2 }]}>No Payments</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default SingleClientPaymentListScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
    // padding: 20,
    // paddingVertical: 10,
    // paddingTop:5,
    paddingBottom: 10
    // alignItems: 'center',
    // borderWidth:1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  image: {
    width: Display.setWidth(100),
    height: Display.setHeight(15),
    marginBottom: 10,
    // borderWidth:1
  },
  headingText: {
    fontSize: 17,
    lineHeight: 17 * 1.4,
    color: Colors.DEFAULT_LIGHT_BLUE,
    marginVertical: 5,
    fontFamily: Fonts.POPPINS_MEDIUM,
    marginHorizontal: 20,
    backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    // textAlign:'center'
  },
  detailsText: {
    fontSize: 15,
    lineHeight: 15 * 1.4,
    fontFamily: Fonts.POPPINS_EXTRA_BOLD,
    color: Colors.DEFAULT_DARK_BLUE,
    textTransform: 'capitalize'
  },
  amountDateFullContainer: {
    marginHorizontal: 20,
    backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
    borderRadius: 10,
    marginVertical: 5,
    // borderWidth: 1,
    marginBottom: 15
  },
  amountDateHeadingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    // marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    borderColor: Colors.DEFAULT_DARK_RED,
    backgroundColor: Colors.DEFAULT_DARK_RED,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  amountDateHeading: {
    flex: 1,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,  // Change to the correct font if needed
    fontSize: 16,
    lineHeight: 16 * 1.4,
    textAlign: 'center',
    color: Colors.DEFAULT_WHITE,
  },
  amountDateDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    // borderWidth: 1,
    // marginHorizontal: 10,
    marginTop: 10,
    // marginBottom: 10,
    // borderColor: Colors.DEFAULT_LIGHT_BLUE,
    // backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  amountDateDetails: {
    flex: 1,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,  // Change to the correct font if needed
    fontSize: 14,
    lineHeight: 14 * 1.4,
    textAlign: 'center',
    color: Colors.DEFAULT_DARK_BLUE,
    // borderWidth: 1
  },
  amountDateDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.DEFAULT_WHITE, // Optional: separator line
    marginHorizontal: 10,
  },
})