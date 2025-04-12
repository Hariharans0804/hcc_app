import { ActivityIndicator, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors, Fonts } from '../../constants';
import { Separator } from '../../components';
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Display } from '../../utils';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import SearchInput from "react-native-search-filter";
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import { RFValue } from "react-native-responsive-fontsize";

const CollectionListScreen = () => {

  const [selectedItem, setSelectedItem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  // const [modalContent, setModalContent] = useState();
  const [amountValue, setAmountValue] = useState(kuwaitLocalBalanceAmount ? kuwaitLocalBalanceAmount : "0.000");
  const [collectionDataList, setCollectionDataList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [employeesData, setEmployeesData] = useState([]);

  // console.log('5555555', selectedItem.today_rate);

  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });


  const roundAmount = (amount) => {
    const whole = Math.floor(amount); // Get the integer part
    const decimal = amount - whole; // Get the decimal part

    if (decimal <= 0.49) {
      return whole; // Round down
    } else {
      return whole + 1; // Round up
    }
  };


  // Pre-map employeesData for efficient lookup
  const employeeMap = useMemo(() => {
    const map = {};
    employeesData.forEach(emp => (map[emp.user_id] = emp.username));
    return map;
  }, [employeesData]);


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


  const fetchUpdatedAmountData = async (id) => {
    // console.log('11111111', id);

    if (!id) {
      console.error('Client ID is missing');
      return;
    }

    const remainingAmount = selectedItem.amount - modalTotalPaidAmount;

    //check the local remaining amount
    const localRemainingAmount = kuwaitLocalTotalAmount - kuwaitLocalOverAllPaidAmount;


    if (amountValue > 0) {
      if (Number(amountValue) > localRemainingAmount) {
        // Toast.show({
        //   type: 'error',
        //   text1: 'Entered amount exceeds balance amount!',
        //   position: 'top',
        // });
        setErrorMessage('Entered amount exceeds balance amount!');
        return;
      }

      try {
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;


        // Calculate the new modal remaining amount
        const BalanceRemainingAmount = selectedItem.amount - (modalTotalPaidAmount + Number(amountValue));
        // console.log('111111', BalanceRemainingAmount.toFixed(2));

        // Set paid_and_unpaid based on remaining amount
        const paidAndUnpaidStatus = BalanceRemainingAmount === 0 ? 1 : 0;

        // const kuwaitLocalTotalAmount = parseFloat((selectedItem.amount / selectedItem.today_rate).toFixed(3)) || 0;
        // const kuwaitLocalOverAllPaidAmount = parseFloat((modalTotalPaidAmount / selectedItem.today_rate).toFixed(3)) || 0;
        const kuwaitLocalAmountValue = parseFloat((selectedItem.today_rate * amountValue).toFixed(2)) || 0;


        const kuwaitLocalBalanceRemainingAmount = selectedItem.today_rate
          // ? parseFloat(((modalRemainingAmount - kuwaitLocalAmountValue) / selectedItem.today_rate).toFixed(3))
          // : 0.000;
          ? Math.max(0, parseFloat(((modalRemainingAmount - kuwaitLocalAmountValue) / selectedItem.today_rate).toFixed(3)))
          : 0.000;
        console.log('kuwaitLocalBalanceRemainingAmount', kuwaitLocalBalanceRemainingAmount);



        // // kuwait Local Set paid_and_unpaid based on remaining amount
        const localPaidAndUnpaidStatus = kuwaitLocalBalanceRemainingAmount === 0 ? 1 : 0;


        const addNewAmountData = {
          // paid_amount_date: formattedDate,
          paid_amount_time: today,
          paid_amount_date: [
            ...(selectedItem.paid_amount_date || []), // Preserve existing array if any
            { date: formattedDate, amount: kuwaitLocalAmountValue, userID: selectedItem.user_id }, // Add new object with amount and date
          ],
          paid_and_unpaid: localPaidAndUnpaidStatus,
        };
        console.log('Request Payload:', addNewAmountData);

        // Send API request
        // const response = await axios.put(`${API_HOST}/acc_updated/${id}`,
        const response = await axiosInstance.put(`/acc_updated/${id}`,
          addNewAmountData,
          { headers: { 'Content-Type': 'application/json' } }
        );

        // console.log('Response:', response.data);

        // Reset state and show success message
        setUpdateModalVisible(false);
        setAmountValue('');
        Toast.show({
          type: 'success',
          text1: 'Client Amount Added Successfully!',
          position: 'top',
        });

        // Refresh the list to reflect changes
        fetchCollectionDataList();

      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        setErrorMessage('Failed to update amount. Please try again.');

        // Show error message
        Toast.show({
          type: 'error',
          text1: 'Failed to update amount',
          text2: error.response?.data?.error || 'Please try again later.',
          position: 'top',
        });
      }
    } else {
      console.error('Invalid amount value');
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid amount',
        position: 'top',
      });
    }
  };

  const isUpdateButtonDisabled = !(amountValue);


  const fetchCollectionDataList = async () => {
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

      setCollectionDataList(response.data);
      // console.log('Fetched collection clients:', response.data);
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
      fetchCollectionDataList();
      fetchEmployeesData();
      // handlePaidUnpaidChange();

      // Reset the search text whenever the screen gains focus
      setSearchText('');
    }, [])
  )


  // useEffect(() => {
  //   console.log('7777777777', modalContent);
  // }, [modalContent]);


  // const handlePressView = (item) => {
  //   setSelectedItem(item);
  //   setModalContent('view');
  //   setUpdateModalVisible(true);
  //   // console.log('7777777777', modalContent);
  //   // console.log('Selected Item:', item);
  // }


  const handlePressUpdate = (item) => {
    setSelectedItem(item);
    // setModalContent('update');
    setUpdateModalVisible(true);
    setErrorMessage('');
    // console.log('7777777777', modalContent);
    // console.log('Selected Item:', item);
  }

  const handleModalClose = () => {
    setUpdateModalVisible(false);
    // setAmountValue('');
    setErrorMessage('');
  }


  const onPressClearTextEntry = () => {
    // console.log('Remove');
    setSearchText('');
  }


  // console.log('1111111',selectedItem);


  // Calculate the total paid amount
  const modalTotalPaidAmount = Array.isArray(selectedItem?.paid_amount_date)
    ? selectedItem.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount || 0), 0)
    : 0;
  // console.log('modalTotalPaidAmount', modalTotalPaidAmount);

  //Get the last paid amount
  const modalLastPaidAmount = Array.isArray(selectedItem?.paid_amount_date) && selectedItem.paid_amount_date.length > 0
    ? selectedItem.paid_amount_date[selectedItem.paid_amount_date.length - 1]?.amount
    : "No Payments";
  // console.log('modalLastPaidAmount', modalLastPaidAmount);

  // Get the last paid date
  const modalLastPaidDate = Array.isArray(selectedItem?.paid_amount_date) && selectedItem.paid_amount_date.length > 0
    ? selectedItem.paid_amount_date[selectedItem.paid_amount_date.length - 1]?.date
    : "No Paid Dates";
  // console.log('modalLastPaidDate', modalLastPaidDate);

  // Calculate the remaining amount
  const modalRemainingAmount = selectedItem?.amount - modalTotalPaidAmount;
  // console.log('modalRemainingAmount', modalRemainingAmount.toFixed(2));


  // Calculate the total Local Amount
  const kuwaitLocalTotalAmount = parseFloat((selectedItem.amount / selectedItem.today_rate).toFixed(3)) || 0;
  // console.log('kuwaitLocalTotalAmount', kuwaitLocalTotalAmount.toFixed(3));

  // Calculate the Local total paid amount
  const kuwaitLocalOverAllPaidAmount = parseFloat((modalTotalPaidAmount / selectedItem.today_rate).toFixed(3)) || 0;
  // console.log('kuwaitLocalOverAllPaidAmount', kuwaitLocalOverAllPaidAmount.toFixed(3));

  //Get the kuwait Local last paid amount
  const kuwaitLocalLastPaidAmount = parseFloat((modalLastPaidAmount / selectedItem.today_rate).toFixed(3)) || 0;
  // console.log('kuwaitLocalLastPaidAmount', kuwaitLocalLastPaidAmount.toFixed(3));

  // Calculate the Local remaining amount
  // const kuwaitLocalBalanceAmount = modalRemainingAmount / selectedItem.today_rate;
  const kuwaitLocalBalanceAmount = selectedItem.today_rate
    ? (modalRemainingAmount / selectedItem.today_rate).toFixed(3)
    : "0.000"; // Ensuring a string with 3 decimal places
  // console.log('kuwaitLocalBalanceAmount', kuwaitLocalBalanceAmount);

  useEffect(() => {
    if (kuwaitLocalBalanceAmount !== undefined) {
      setAmountValue(kuwaitLocalBalanceAmount);
    }
  }, [kuwaitLocalBalanceAmount]);

  const renderItem = ({ item, index }) => {

    // console.log(index);

    const remainingAmount = item.amount - (item.paid_amount_date?.reduce((total, entry) => total + parseFloat(entry.amount), 0) || 0);

    if (remainingAmount === 0) {
      return null;
    }

    const agentName = employeesData.find((emp) => emp.user_id === item.user_id)?.username || 'Not Found';

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 1 }]}>
          {index + 1}
          {/* {item.client_id} */}
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>
          {(item.client_name || '').replace(/"/g, '')}
          {"\n"}
          <Text style={styles.cityText}>{agentName}</Text>
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
        <View style={[styles.buttonContainer, { flex: 2 }]}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => handlePressUpdate(item)}
            activeOpacity={0.8}
          >
            <Feather
              name="edit"
              size={15}
              color={Colors.DEFAULT_LIGHT_WHITE}
            />
            <Text style={[
              styles.cell,
              {
                fontSize: 12,
                lineHeight: 12 * 1.4,
                textTransform: 'uppercase',
                color: Colors.DEFAULT_LIGHT_WHITE,
              }
            ]}>Paid</Text>
          </TouchableOpacity>
        </View>
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
          {/* <TextInput
            placeholder='Search'
            placeholderTextColor={Colors.DEFAULT_BLACK}
            selectionColor={Colors.DEFAULT_BLACK}
            style={styles.inputText}
          /> */}
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
        <Text style={[styles.heading, { flex: 2 }]}>Details</Text>
      </View>

      {/* Data Loading and Display */}
      {loading ? (
        <ActivityIndicator
          size='large'
          color={Colors.DEFAULT_DARK_BLUE}
          style={{ marginTop: 20, }}
        />
      ) : collectionDataList.length === 0 ? (
        <Text style={styles.emptyText}>No matching collection list found page!</Text>
      ) : (
        <FlatList
          data={collectionDataList
            .sort((a, b) => b.client_id - a.client_id) // Sort by client_id in descending order
            .filter(
              (item) => {
                // Apply search filtering
                const searchTextLower = searchText.toLowerCase();

                // Fetch the username using the user_id
                const assignedUsername = employeeMap[item.user_id]?.toLowerCase() || '';

                // Check if the searchText matches either client_name or client_contact
                const isMatchingSearch =
                  item.client_name?.toLowerCase().includes(searchTextLower) ||
                  item.client_contact?.toString().includes(searchText) ||
                  assignedUsername.includes(searchTextLower);

                const today = new Date();
                const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

                const isValidPaidAndUnpaid = item.paid_and_unpaid === 0 && item.sent === 1 && item.assigned_date === currentDate;

                return isMatchingSearch && isValidPaidAndUnpaid;
              })
          }
          keyExtractor={(item) => item.client_id?.toString() || item.index?.toString()}
          renderItem={renderItem}
          removeClippedSubviews={false}
          extraData={updateModalVisible}
          contentContainerStyle={styles.flatListContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No matching Clients found!</Text>}
        />
      )}

      {updateModalVisible && (
        <Modal animationType="slide" transparent={true} visible={updateModalVisible} style={{ zIndex: 1 }}>
          <View style={styles.updateModalConatiner}>
            <View style={styles.updateModal}>
              <TouchableOpacity style={styles.updateModalCloseButton} onPress={handleModalClose}>
                <AntDesign
                  name="closecircleo"
                  size={30}
                  color={Colors.DEFAULT_WHITE}
                />
              </TouchableOpacity>
              <Text style={styles.updateModalText}>Details</Text>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsText}>Client Id : {selectedItem.client_id}</Text>
                <Text style={styles.detailsText}>Name : {selectedItem.client_name}</Text>
                <Text style={styles.detailsText}>Mobile : {selectedItem.client_contact}</Text>
                <Text style={styles.detailsText}>Date : {selectedItem.date}</Text>
                <Text style={styles.detailsText}>City : {selectedItem.client_city}</Text>
                <Text style={styles.detailsText}>Total & Inter : {Number(selectedItem.amount).toFixed(2)}</Text>
                {/* <Text style={styles.detailsText}>
                  Total & Inter : {selectedItem?.amount ? Number(selectedItem.amount).toFixed(2) : "0.00"}
                </Text> */}
                <Text style={styles.detailsText}>Local : {kuwaitLocalTotalAmount.toFixed(3)}</Text>
                {/* <Text style={styles.detailsText}>Over All Paid Amount : {modalTotalPaidAmount ? modalTotalPaidAmount : "No Payments"}</Text> */}
                {/* <Text style={styles.detailsText}>Last Paid Amount : {modalLastPaidAmount}</Text> */}
                {/* <Text style={styles.detailsText}>Last Paid Date : {modalLastPaidDate}</Text> */}
                {/* <Text style={styles.detailsText}>Balance Amount : {modalRemainingAmount}</Text> */}
                <View style={styles.amountInputContainer}>
                  <Text style={styles.detailsText}>Today Amount : </Text>
                  <TextInput
                    placeholder='0'
                    placeholderTextColor={Colors.DEFAULT_DARK_BLUE}
                    selectionColor={Colors.DEFAULT_DARK_BLUE}
                    style={[styles.amountTextInput, errorMessage ? styles.errorInput : null]}
                    keyboardType='numeric'
                    value={amountValue}
                    // onChangeText={setAmountValue}
                    onChangeText={(text) => {
                      // Allow only valid numeric input with up to 3 decimal places
                      const validInput = text.match(/^\d*\.?\d{0,3}$/);
                      if (validInput) {
                        setAmountValue(text);
                      }
                    }}
                  />
                </View>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <View style={styles.saveButtonContainer}>
                  <TouchableOpacity style={[
                    styles.saveButton,
                    isUpdateButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
                  ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (parseFloat(amountValue) === modalRemainingAmount) {
                        fetchUpdatedAmountData(selectedItem.client_id);
                        // Remove client from the list if the balance is fully paid
                        setCollectionDataList((prevList) =>
                          prevList.filter((item) => item.client_id !== selectedItem.client_city)
                        );
                      } else if (parseFloat(amountValue) > 0) {
                        fetchUpdatedAmountData(selectedItem.client_id);
                      } else {
                        Toast.show({
                          type: 'error',
                          text1: 'Invalid Input',
                          text2: 'Please enter a valid amount',
                          position: 'top',
                        });
                      }
                    }}
                    disabled={isUpdateButtonDisabled}
                  >
                    <Text style={styles.saveButtonText}>Paid</Text>
                    <FontAwesome name="send" size={20} color={Colors.DEFAULT_LIGHT_BLUE} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

export default CollectionListScreen

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
    width: Display.setWidth(70),
    paddingRight: 15,
    // borderWidth: 1
  },
  inputText: {
    fontSize: 15,
    lineHeight: 15 * 1.4,
    letterSpacing: 1,
    textAlignVertical: 'center',
    paddingVertical: 0,
    height: Display.setHeight(6),
    color: Colors.DEFAULT_BLACK,
    flex: 1,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    paddingTop: 5,
  },

  detailsContainer: {
    width: Display.setWidth(70),
    // borderWidth: 1,
    // borderColor: Colors.DEFAULT_LIGHT_WHITE,
    // borderRadius: 10,
    // marginVertical:10,
    // padding: 40
    paddingVertical: 10,
    // paddingHorizontal: 10
  },
  detailsText: {
    fontSize: 18,
    // lineHeight: 18.5 * 1.4,
    // fontSize: RFValue(12.5),
    lineHeight: 20 * 1.4,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    color: Colors.DEFAULT_LIGHT_WHITE,
    textTransform: 'capitalize'
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    // borderWidth: 1.2,
  },
  amountTextInput: {
    borderWidth: 1.2,
    borderColor: Colors.DEFAULT_LIGHT_WHITE,
    borderRadius: 8,
    // flex: 1,
    backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
    fontSize: 18,
    lineHeight: 18 * 1.4,
    paddingVertical: 0,
    width: Display.setWidth(25),
    height: Display.setHeight(5),
    paddingHorizontal: 15,
    color: Colors.DEFAULT_DARK_BLUE
  },
  errorInput: {
    borderColor: Colors.DEFAULT_DARK_RED, // Red border for errors
    borderWidth: 2
  },
  errorText: {
    color: Colors.DEFAULT_DARK_RED,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    fontSize: 12,
    lineHeight: 12 * 1.4,
    marginTop: 5,
  },
  saveButtonContainer: {
    alignItems: 'center',
    marginVertical: 10
  },
  saveButton: {
    borderWidth: 2,
    borderRadius: 25,
    // borderColor: Colors.DEFAULT_LIGHT_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: Display.setWidth(32),
    marginVertical: 5,
    padding: 8,
    // backgroundColor: Colors.DEFAULT_LIGHT_WHITE
  },
  buttonEnabled: {
    backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
    borderColor: Colors.DEFAULT_LIGHT_WHITE,
  },
  buttonDisabled: {
    backgroundColor: Colors.DEFAULT_DARK_RED,
    borderColor: Colors.DEFAULT_DARK_RED,
  },
  saveButtonText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    color: Colors.DEFAULT_DARK_BLUE,
  },
  // =================================================*/
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
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.DEFAULT_GREEN,
    padding: 10,
    borderRadius: 25
  },
  updateModalConatiner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  updateModal: {
    margin: 20,
    backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: Display.setWidth(90),
    height: Display.setHeight(58),
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
  updateModalCloseButton: {
    marginLeft: 250,
  },
  updateModalText: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 22 * 1.4,
    fontFamily: Fonts.POPPINS_MEDIUM,
    color: Colors.DEFAULT_WHITE,
    textDecorationLine: 'underline'
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


{/* <Text style={styles.detailsText}>Paid Amount & Date : {"\n"}
                {Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
                  ? selectedItem.paid_amount_date
                  .map(entry => `${entry.date} - ${entry.amount}`)
                  .join("\n")
                  : "No Payments"}
              </Text> */}