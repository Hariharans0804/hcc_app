import { ActivityIndicator, Alert, BackHandler, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Colors, Fonts } from '../../constants';
import { Display } from '../../utils';
import { Separator } from '../../components';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import SearchInput from "react-native-search-filter";
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { getFromStorage, saveToStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import moment from 'moment';

const CollectionHomeScreen = ({ route }) => {
  const [singleAgentclientsData, setSingleAgentClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [agentloginUserData, setAgentLoginUserData] = useState(null);


  //BackHandler Function
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Exit App',
          'Do you want to exit?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel'
            },
            {
              text: 'YES',
              onPress: () => {
                // Save a flag to indicate app exit
                saveToStorage('appExited', 'true');
                BackHandler.exitApp();
              }
            }
          ],
          { cancelable: false }
        );
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );


  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });


  const fetchGetAgentLoginUserData = async () => {
    try {
      const data = await getFromStorage('users');
      // console.log('010101', data);
      const agentLoginUserID = data?.userID;
      // console.log('101010',agentLoginUserID);
      setAgentLoginUserData(agentLoginUserID);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  const fetchClientsData = async () => {
    if (!agentloginUserData) {
      // console.error('Agent login user data is missing');
      console.log('agentloginUserData:', agentloginUserData);
      return;
    }

    setLoading(true);
    try {
      // const response = await axios.get(`${API_HOST}/fetchUserlistIDS/${agentloginUserData}`);
      const response = await axiosInstance.get(`/fetchUserlistID/${agentloginUserData}`);

      // Log the full response to verify if CombinedData is populated
      // console.log('API Response:', response.data);

      const combinedData = response.data?.clientdata?.CombinedData || [];
      // console.log('CombinedData:', combinedData);

      const collectionsList = combinedData.flatMap(user => user.collections || []);
      // console.log('Collections List:', collectionsList);

      const currentDate = moment().format('DD-MM-YYYY');

      // Filter unpaid clients
      const unpaidClientsList = collectionsList.filter(
        (item) => item.paid_and_unpaid !== 1 && item.assigned_date === currentDate
      );

      setSingleAgentClientsData(unpaidClientsList);
      // console.log('00000000000', currentDate);

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

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchGetAgentLoginUserData();
        fetchClientsData();
      };
      fetchData();

      // Reset the search text whenever the screen gains focus
      setSearchText('');
    }, [agentloginUserData])
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


  const filteredData = singleAgentclientsData
    .sort((a, b) => b.client_id - a.client_id) // Sort by client_id in descending order
    .filter(
      (item) => {
        const searchTextLower = searchText.toLowerCase();
        return (
          item.client_name?.toLowerCase().includes(searchTextLower) ||
          item.client_contact?.toString().includes(searchText)
        );
      });


  // Calculate the total Local Amount
  const kuwaitLocalTotalAmount = selectedItem.amount / selectedItem.today_rate;

  // Calculate the total paid amount
  const modalTotalPaidAmount = Array.isArray(selectedItem?.paid_amount_date)
    ? selectedItem.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
    : 0;

  // Calculate the Local total paid amount
  const kuwaitLocalOverAllPaidAmount = modalTotalPaidAmount / selectedItem.today_rate;

  //Get the last paid amount
  const modalLastPaidAmount = Array.isArray(selectedItem?.paid_amount_date) && selectedItem.paid_amount_date.length > 0
    ? selectedItem.paid_amount_date[selectedItem.paid_amount_date.length - 1]?.amount
    : "No Payments"

  //Get the kuwait Local last paid amount
  const kuwaitLocalLastPaidAmount = modalLastPaidAmount / selectedItem.today_rate;

  // Get the last paid date
  const modalLastPaidDate = Array.isArray(selectedItem?.paid_amount_date) && selectedItem.paid_amount_date.length > 0
    ? selectedItem.paid_amount_date[selectedItem.paid_amount_date.length - 1]?.date
    : "No Paid Dates";

  // Calculate the remaining amount
  const modalRemainingAmount = selectedItem?.amount - modalTotalPaidAmount;

  // Calculate the Local remaining amount
  const kuwaitLocalBalanceAmount = modalRemainingAmount / selectedItem.today_rate;


  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 1 }]}>
          {index + 1}
          {/* {item.client_id} */}
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>
          {(item.client_name || '').replace(/"/g, '')}
          {"\n"}
          <Text style={styles.cityText}>{item.client_city || ''}</Text>
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
        <View style={[styles.buttonContainer, { flex: 2 }]}>
          <TouchableOpacity activeOpacity={0.8} style={styles.viewButton} onPress={() => handlePressView(item)}>
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
        </View>
      </View>
    )
  }


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
      {/* <Separator height={StatusBar.currentHeight} /> */}

      {/* <View style={styles.membersContainer}> */}
      {/* <Text style={styles.membersText}>members</Text> */}
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
        <Text style={[styles.heading, { flex: 2 }]}>Details</Text>
      </View>

      {/* Data Loading and Display */}
      {loading ? (
        <ActivityIndicator
          size='large'
          color={Colors.DEFAULT_DARK_BLUE}
          style={{ marginTop: 20, }}
        />
      ) : filteredData.length === 0 ? (
        <Text style={styles.emptyText}>No matching Clients found page!</Text>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.client_id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
        />
      )}

      {viewModalVisible && (
        <Modal animationType="slide" transparent={true} visible={viewModalVisible}>
          <View style={styles.viewModalConatiner}>
            <View style={styles.viewModal}>
              <TouchableOpacity activeOpacity={0.8} style={styles.viewModalCloseButton} onPress={() => setViewModalVisible(false)}>
                <AntDesign
                  name="closecircleo"
                  size={30}
                  color={Colors.DEFAULT_WHITE}
                />
              </TouchableOpacity>
              <Text style={styles.viewModalText}>Details</Text>
              <View style={styles.detailsContainer}>
                {/* <Text style={styles.detailsText}>Client Id : {selectedItem.index !== undefined ? selectedItem.index + 1 : 'N/A'}</Text> */}
                <Text style={styles.detailsText}>Client Id : {selectedItem?.client_id}</Text>
                <Text style={styles.detailsText}>Name : {selectedItem?.client_name}</Text>
                <Text style={styles.detailsText}>Mobile : {selectedItem?.client_contact}</Text>
                <Text style={styles.detailsText}>Total : {kuwaitLocalTotalAmount.toFixed(3)}</Text>
                <Text style={styles.detailsText}>Date : {selectedItem?.date}</Text>
                <Text style={styles.detailsText}>City : {selectedItem?.client_city}</Text>
                <Text style={styles.detailsText}>Over All Paid Amount : {kuwaitLocalOverAllPaidAmount ? kuwaitLocalOverAllPaidAmount.toFixed(3) : "No Payments"}</Text>
                <Text style={styles.detailsText}>Last Paid Amount : {kuwaitLocalLastPaidAmount ? kuwaitLocalLastPaidAmount.toFixed(3) : 'No Payments'}</Text>
                {/* <Text style={styles.detailsText}>Paid Amount & Date : {"\n"}
                {Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
                  ? selectedItem.paid_amount_date
                  .map(entry => `${entry.date} - ${entry.amount}`)
                  .join("\n")
                  : "No Payments"}
              </Text> */}
                <Text style={styles.detailsText}>Last Paid Date : {modalLastPaidDate}</Text>
                <Text style={styles.detailsText}>Balance Amount : {kuwaitLocalBalanceAmount.toFixed(3)}</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View >
  )
}

export default CollectionHomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  membersContainer: {
    // borderWidth:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15
  },
  membersText: {
    fontSize: 22,
    lineHeight: 22 * 1.4,
    fontFamily: Fonts.POPPINS_REGULAR,
    color: Colors.DEFAULT_BLACK,
  },
  inputContainer: {
    backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    borderRadius: 50,
    borderColor: Colors.DEFAULT_BLACK,
    // elevation: 1,
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
    width: Display.setWidth(70),
    paddingRight: 15,
    // borderWidth: 1
  },

  newLabelContainer: {
    position: "absolute",
    // top:0.5,
    // left: -11,
    top: 0,
    left: -16,
    backgroundColor: 'red',
    transform: [{ rotate: "-45deg" }],
    zIndex: 1,
  },
  newLabel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 8,
    paddingHorizontal: 15,
    // paddingVertical: 3,
    paddingTop: 4,
    paddingBottom: 2,
    textAlign: 'center'
  },
  // ====================================================*/
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
    paddingVertical: 10,
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
  flatListContainer: {
    paddingBottom: 50,
    // borderWidth:1
  },
})