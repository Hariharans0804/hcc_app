import { ActivityIndicator, FlatList, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { Display } from '../../utils';
import { Colors, Fonts, Images } from '../../constants';
import { Separator } from '../../components';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";


const SingleClientPaidCompletedListScreen = ({ route }) => {
  const { client, distributorName } = route.params; // Extract passed client data
  // console.log('11111', client);


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

  // Calculate the total paid amount
  const singleClientTotalPaidAmount = Array.isArray(client.paid_amount_date)
    ? client.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount), 0)
    : 0;

  // Calculate the remaining amount
  const singleClientRemainingAmount = client.amount - singleClientTotalPaidAmount

  //Local Total Amount
  const localTotalAmount = client.amount / (parseFloat(client.today_rate) || 1);

  //Local OverAll Paid Amount
  const localOverAllPaidAmount = singleClientTotalPaidAmount / (parseFloat(client.today_rate) || 1);

  //Local Balance Amount
  const LocalBalanceAmount = singleClientRemainingAmount / (parseFloat(client.today_rate) || 1);
  // console.log('LocalBalanceAmount', LocalBalanceAmount);



  const roundAmount = (amount) => {
    const whole = Math.floor(amount); // Get the integer part
    const decimal = amount - whole; // Get the decimal part

    if (decimal <= 0.49) {
      return whole; // Round down
    } else {
      return whole + 1; // Round up
    }
  };



  // console.log(client);

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

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ paddingBottom: 50, paddingTop: 10 }}>
          <Image source={Images.MAN} resizeMode='contain' style={styles.image} />
          <Text style={styles.headingText}>Distributor Name : <Text style={styles.detailsText}>{distributorName}</Text></Text>
          <Text style={styles.headingText}>Client ID : <Text style={styles.detailsText}>{client.client_id}</Text></Text>
          <Text style={styles.headingText}>Clinet Name : <Text style={styles.detailsText}>{client.client_name}</Text></Text>
          <Text style={styles.headingText}>Mobile : <Text style={styles.detailsText}>{client.client_contact}</Text></Text>
          <Text style={styles.headingText}>City : <Text style={styles.detailsText}>{client.client_city}</Text></Text>
          <Text style={[
            styles.headingText,
            {
              fontFamily:Fonts.POPPINS_SEMI_BOLD,
              color: Colors.DEFAULT_WHITE,
              backgroundColor: client.paid_and_unpaid === 1
                ? Colors.DEFAULT_GREEN
                : Colors.DEFAULT_DARK_RED,
            }
          ]}>Status : <Text style={[styles.detailsText, { color: Colors.DEFAULT_WHITE }]}>{client.paid_and_unpaid === 1 ? "Paid" : "Unpaid"}</Text></Text>
          <Text style={styles.headingText}>Date : <Text style={styles.detailsText}>{client.date}</Text></Text>
          <Text style={styles.headingText}>Today Rate : <Text style={styles.detailsText}>{client.today_rate}</Text></Text>
          <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Total Amount :</Text>
          <Text style={styles.headingText}>INTERNATIONAL : <Text style={styles.detailsText}>{roundAmount(client.amount).toFixed(2)}</Text></Text>
          <Text style={styles.headingText}>LOCAL : <Text style={styles.detailsText}>{localTotalAmount.toFixed(3)}</Text></Text>
          <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Over All Paid Amount :</Text>
          <Text style={styles.headingText}>INTERNATIONAL : <Text style={styles.detailsText}>{roundAmount(singleClientTotalPaidAmount).toFixed(2)}</Text></Text>
          <Text style={styles.headingText}>LOCAL : <Text style={styles.detailsText}>{localOverAllPaidAmount.toFixed(3)}</Text></Text>
          <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Balance Amount :</Text>
          <Text style={styles.headingText}>INTERNATIONAL : <Text style={styles.detailsText}>{roundAmount(singleClientRemainingAmount).toFixed(2)}</Text></Text>
          <Text style={styles.headingText}>LOCAL : <Text style={styles.detailsText}>{roundAmount(LocalBalanceAmount).toFixed(3)}</Text></Text>
          {/* <Text style={styles.headingText}>Full Details Paid Amount Date & Agent : </Text> */}
          <Text style={[styles.headingText, { backgroundColor: Colors.DEFAULT_LIGHT_BLUE, color: Colors.DEFAULT_LIGHT_WHITE }]}>Full Paid Amount Date & Agent :</Text>

          <View style={styles.amountDateFullContainer}>

            <View style={styles.amountDateHeadingContainer}>
              <Text style={[styles.amountDateHeading, { flex: 1 }]}>Agent</Text>
              <Text style={[styles.amountDateHeading, { flex: 1.5 }]}>Date</Text>
              <Text style={[styles.amountDateHeading, { flex: 2 }]}>Amount</Text>
            </View>

            {Array.isArray(client.paid_amount_date) && client.paid_amount_date.length > 0 ? (
              client.paid_amount_date.map((entry, index) => {
                const agent = employeesData.find((agent) => agent.user_id === entry.userID);
                const agentName = agent ? agent.username : 'UNKNOWN';
                const localPaidAmount = entry.amount / (parseFloat(client.today_rate) || 1);
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
                <Text style={[styles.amountDateDetails, { flex: 1.5 }]}>-</Text>
                <Text style={[styles.amountDateDetails, { flex: 1 }]}>-</Text>
                <Text style={[styles.amountDateDetails, { flex: 2 }]}>No Payments</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default SingleClientPaidCompletedListScreen

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
    marginVertical: 5
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