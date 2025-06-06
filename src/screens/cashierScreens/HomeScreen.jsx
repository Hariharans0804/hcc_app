import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Colors, Fonts } from '../../constants';
import { Display } from '../../utils';
import { Separator } from '../../components';
import axios from 'axios';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import SearchInput from "react-native-search-filter";
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { Dropdown } from 'react-native-element-dropdown';
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";

const HomeScreen = ({ navigation }) => {

  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientNumber, setClientNumber] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientAmount, setClientAmount] = useState('');
  const [newClientData, setNewClientData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);

  const [distributorList, setDistributorList] = useState([]);
  const [longPressSelectedItems, setLongPressSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  // console.log('longPressSelectedItems', longPressSelectedItems);
  const [agentList, setAgentList] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [agentAssign, setAgentAssign] = useState('');
  // console.log('agentAssign', agentAssign);


  const isAgentAssignButtonDisabled = !agentAssign;

  const isFocused = useIsFocused();

  // console.log('111111111111', distributorList);

  // const [loginUserData, setLoginUserData] = useState(null);

  // const fetchGetLoginUserData = async () => {
  //   const data = await getFromStorage('users');
  //   console.log('2222222',data);
  //   setLoginUserData(data);
  // }


  // console.log('11111111',clientName,clientNumber,clientCity,clientAmount);
  // const filteredData = clientsData.filter(
  //   (item) => item.client_name.toLowerCase().includes(searchText.toLowerCase())
  // );


  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });

  const fetchAddNewClient = async () => {
    if (clientName && clientNumber && clientCity && clientAmount > 0) {
      try {
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

        const addNewClientData = {
          date: formattedDate,
          client_name: clientName,
          client_contact: clientNumber,
          client_city: clientCity,
          amount: clientAmount,
          sent: false,
          paid_and_unpaid: false,
        };

        // const response = await axios.post(`${API_HOST}/acc_insertarrays`,
        const response = await axiosInstance.post(`/acc_insertarrays`,
          addNewClientData,
          // { headers: { 'Content-Type': 'application/json' }, }// Setting the header for JSON
          // body: JSON.stringify(addNewClientData),
        );
        setNewClientData(response.data);
        console.log('222222222222', response.data);
        // Alert.alert('Success', 'Client added successfully!');
        setModalVisible(false);
        setClientName('');
        setClientNumber('');
        setClientCity('');
        setClientAmount('');

        Toast.show({
          type: 'success',
          text1: 'New Client Added Successfully!',
          // text2: 'This is some something 👋'
        });

      } catch (error) {
        console.log('00000000000', error.message);
      }
    } else {
      // console.log('Please fill all fields and ensure amount is greater than 0');
    }
  }

  const isAddButtonDisabled = !(clientName && clientNumber && clientCity && clientAmount > 0);


  // const fetchClientsData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(`${API_HOST}/acc_list`);
  //     const unpaidClientsList = response.data.filter(
  //       (item) => item.paid_and_unpaid !== 1
  //     );
  //     setClientsData(unpaidClientsList);
  //     // console.log('000',unpaidClientsList);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }


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

      const distributorList = response.data
        .filter((item) => item.role === "Distributor");
      // .map((item) => ({
      //   label: item.username,
      //   value: item.user_id,
      // }));

      const agentList = response.data
        .filter((item) => item.role === "Collection Agent")
        .map((item) => ({
          label: item.username,
          value: item.user_id,
        }));

      setAgentList(agentList);
      setDistributorList(distributorList);
      setEmployeesData(response.data);
      // console.log(response.data);
      // console.log(agentList.length);

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



  // Fetch Client data
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

      setLoading(true);


      // Axios GET request
      // const response = await axios.get(`${API_HOST}/acc_list`, {
      const response = await axiosInstance.get('/acc_list', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization, // Include the token in the Authorization header
        },
      });

      // Filter unpaid clients
      const unpaidClientsList = response.data.filter(
        (item) => item.paid_and_unpaid !== 1 /*|| item.sent === 0*/
      );

      setClientsData(unpaidClientsList); // Set the filtered data to state
      // console.log('Fetched clients:', unpaidClientsList);
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
      setLoading(false); // Set loading to false once the request is complete
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchClientsData();
      // fetchAddNewClient();
      fetchEmployeesData();

      // Reset the search text whenever the screen gains focus
      setSearchText('');
      // setAgentAssign('');
      // fetchGetLoginUserData();
    }, [])
  )


  // const newData = [
  //   { id: 1, name: 'hari', mobile: 1234567890, paid: 500 },
  //   { id: 2, name: 'vishwa', mobile: 2345678901, paid: 200 },
  //   { id: 3, name: 'ram', mobile: 3456789012, paid: 100 },
  //   { id: 4, name: 'raj', mobile: 4567890123, paid: 300 },
  //   { id: 5, name: 'karthik', mobile: 5678901234, paid: 400 },
  // ];

  // const oldData = [
  //   { id: 6, name: 'sathish', mobile: 6789012345, paid: 550 },
  //   { id: 7, name: 'mukilan', mobile: 7890123456, paid: 250 },
  //   { id: 8, name: 'jayaram', mobile: 8901234567, paid: 350 },
  //   { id: 9, name: 'surya', mobile: 9012345678, paid: 150 },
  //   { id: 10, name: 'ajith', mobile: 5432167890, paid: 450 },
  //   { id: 11, name: 'arun', mobile: 5432167890, paid: 450 },
  //   { id: 12, name: 'lenin', mobile: 5432167890, paid: 450 },
  //   { id: 13, name: 'ali', mobile: 5432167890, paid: 450 },
  //   { id: 14, name: 'boopathi', mobile: 5432167890, paid: 450 },
  //   { id: 15, name: 'sundar', mobile: 5432167890, paid: 450 },
  // ];

  // Process data to assign separate serial numbers
  // const processData = (oldData, newData) => {
  //   const oldIds = oldData.map((item) => item.id);

  //   // Separate new and old data
  //   const processedNewData = newData.map((item, index) => ({
  //     ...item,
  //     serialNo: index + 1, // New data starts from 1
  //     isNew: true,
  //   }));

  //   const processedOldData = oldData.map((item, index) => ({
  //     ...item,
  //     serialNo: index + 1, // Old data starts from 1 as well
  //     isNew: false,
  //   }));

  //   // Combine with new data first
  //   return [...processedNewData, ...processedOldData];
  // };

  // const processedData = processData(oldData, newData);

  const handleModalClose = () => {
    setModalVisible(false);
    setClientName('');
    setClientNumber('');
    setClientCity('');
    setClientAmount('');
  }

  const handlePressView = (item) => {
    setSelectedItem(item);
    setViewModalVisible(true);
    // console.log('0000', item);
  }

  const onPressClearTextEntry = () => {
    // console.log('Remove');
    setSearchText('');
  }

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


  // =======================================================================


  const toggleLongPressSelection = (clientId) => {
    setSelectionMode(true);
    setLongPressSelectedItems([clientId]); // Only select the long-pressed item
  };

  const toggleCheckboxSelection = (clientId) => {
    setLongPressSelectedItems((prev) => {
      if (prev.includes(clientId)) {
        return prev.filter((id) => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (longPressSelectedItems.length === clientsData.length) {
      setLongPressSelectedItems([]); // Deselect All
    } else {
      const allIds = clientsData.map(item => item.client_id); // Select All
      setLongPressSelectedItems(allIds);
    }
  };


  // const selectAll = () => {
  //   const allIds = clientsData.map(item => item.client_id);
  //   setLongPressSelectedItems(allIds);
  // };

  // const deselectAll = () => {
  //   setLongPressSelectedItems([]);
  // };

  const cancelSelection = () => {
    setSelectionMode(false);
    setLongPressSelectedItems([]);
  };


  const multipleClientsSingleAgentAssigned = async () => {

    if (longPressSelectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: `You have not selected any clients yet!`
      });
      return; // ✅ Exit early
    }

    // Check if any selected client has a today_rate > 0
    const hasRate = longPressSelectedItems.some(id => {
      const client = clientsData.find(c => c.client_id === id);
      return client?.today_rate <= 0;
    });

    if (hasRate) {
      Toast.show({
        type: 'error',
        text1: `If you set a today rate, you can't assign it to any agent!`
      });
      return;
    }

    try {
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

      const payload = longPressSelectedItems.map(clientId => ({
        client_id: clientId,
        user_id: agentAssign,
        sent: true,
        assigned_date: formattedDate
      }));
      // console.log('6666666', payload);

      const response = await axiosInstance.post(`/client_IDupdateds`, payload);
      // console.log('6666666', response.data);


      Toast.show({
        type: 'success',
        text1: 'Assign Employee Successfully!',
        // text2: 'This is some something 👋'
      });

      fetchClientsData();

    } catch (error) {
      console.error('Error updating client:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to assign clients',
        text2: error.response?.data?.message || 'Something went wrong!',
      });
    }
  }


  const renderItem = ({ item, index }) => {
    const distributor = distributorList.find(
      (distributor) => distributor.user_id === item.Distributor_id
    );
    // console.log(distributor);

    const isSelected = longPressSelectedItems.includes(item.client_id);

    return (
      <TouchableOpacity
        onLongPress={() => toggleLongPressSelection(item.client_id)}
        onPress={() => selectionMode && toggleCheckboxSelection(item.client_id)}
        activeOpacity={0.8}
      >
        <View style={[styles.row, isSelected && { backgroundColor: '#e6f7ff' }]}>
          <View style={[styles.cell, { flex: 1, flexDirection: 'row', alignItems: 'center', /*borderWidth: 1*/ }]}>
            {selectionMode ? (
              <Ionicons
                name={isSelected ? 'checkbox-outline' : 'square-outline'}
                size={18}
                color="green"
                style={{ marginRight: 4, }}
              />
            ) : (
              <View style={{ width: 13 }} />
            )}
            <Text style={{ fontSize: 14, lineHeight: 14 * 1.4, fontFamily: Fonts.POPPINS_SEMI_BOLD, }}>{index + 1}</Text>
          </View>
          {/* <Text style={[styles.cell, { flex: 1 }]}>
            {index + 1}
          </Text> */}
          <Text style={[styles.cell, { flex: 3 }]} >
            {(item.client_name || '').replace(/"/g, '')}
            {"\n"}
            <Text style={styles.cityText}>{item.client_contact || ''}</Text>
          </Text>
          {/* <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text> */}
          <Text style={[styles.cell, { flex: 3 }]}>{distributor ? distributor.username : 'Unknown'}</Text>

          <View style={[styles.buttonContainer, { flex: 2 }]}>
            {/* {item.sent === 0 && ( */}
            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: Colors.DEFAULT_GREEN }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SendClientsToAgents', { assignEmployee: item })}
            // onPress={() => navigation.navigate('DrawerNavigation', { screen: 'SendClientsToAgents', params: { assignEmployee: item } })}

            >
              <FontAwesome
                name="send"
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
              ]}>Send</Text>
            </TouchableOpacity>
            {/* )} */}

            <TouchableOpacity
              style={styles.viewButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SingleClientView', { viewSingleClient: item, employeesDataList: employeesData })}
            // onPress={() => navigation.navigate('DrawerNavigation', { screen: 'SingleClientView', params: { viewSingleClient: item } })}

            >
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
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
      {/* <Separator height={StatusBar.currentHeight} /> */}
      {/* {loginUserData ? (
        <Text style={styles.data}>{JSON.stringify(loginUserData, null, 2)}</Text>
      ) : (
        <Text style={styles.data}>No data found</Text>
      )} */}
      <View style={styles.firstContainer}>
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
                  style={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.addButtonContainer} >
          <TouchableOpacity
            style={styles.addButton}
            // onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddNewClient')}
          >
            <AntDesign
              name="pluscircleo"
              size={20}
              color={Colors.DEFAULT_LIGHT_WHITE}
            />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectionMode && (
        <>
          <View style={styles.agentAssignContainer}>
            <View style={[styles.dropdownWrapper, isFocus && { zIndex: 1000 }]}>
              {/* <Text style={styles.updateClientDetailHeading}>Assign Employee:</Text> */}
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: Colors.DEFAULT_LIGHT_BLUE }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                // containerStyle={{ marginTop: 0 }}
                data={agentList}
                search
                searchPlaceholder="Search..."
                labelField="label"
                valueField="value"
                placeholder={!agentAssign ? "Assign Employee" : ""}
                maxHeight={250}
                value={agentAssign}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  // console.log('Selected:', item.value);
                  setAgentAssign(item.value);
                  setIsFocus(false);
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

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.assignButton,
                isAgentAssignButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
              ]}
              onPress={multipleClientsSingleAgentAssigned}
              disabled={isAgentAssignButtonDisabled}
            >
              <Text style={styles.assignButtonText}>Assign</Text>
            </TouchableOpacity>
          </View>


          <View style={styles.selectedContainer}>
            <TouchableOpacity style={{ flex: 1 }} onPress={cancelSelection} activeOpacity={0.8}>
              <Ionicons
                name="close"
                size={30}
                color={Colors.DEFAULT_BLACK}
              // style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
            <Text style={styles.selectedCountText}>{longPressSelectedItems.length} Item Selected</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor:
                    longPressSelectedItems.length === clientsData.length
                      ? Colors.DEFAULT_DARK_RED
                      : Colors.DEFAULT_LIGHT_BLUE
                },
              ]}
              onPress={toggleSelectAll}
              activeOpacity={0.8}
            >
              <Text style={styles.selectButtonText}>{longPressSelectedItems.length === clientsData.length ? 'Deselect All' : 'Select All'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.header}>
        <Text style={[styles.heading, { flex: 1 }]}>No</Text>
        <Text style={[styles.heading, { flex: 3 }]}>Client</Text>
        <Text style={[styles.heading, { flex: 3 }]}>Distributor</Text>
        <Text style={[styles.heading, { flex: 2 }]}>Details</Text>
      </View>

      {/* Data Loading and Display */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.DEFAULT_DARK_BLUE}
          style={{ marginTop: 20, }}
        />
      ) : clientsData.length === 0 ? (
        <Text style={styles.emptyText}>No matching Clients found page!</Text>
      ) : (
        <FlatList
          data={clientsData
            .sort((a, b) => b.client_id - a.client_id) // Sort by client_id in descending order
            .filter(
              (item) => {
                const searchTextLower = searchText.toLowerCase();
                // Check if the searchText matches either client_name or client_contact
                return (
                  item.client_name?.toLowerCase().includes(searchTextLower) ||
                  item.client_contact?.toString().includes(searchText)
                );
              })
          }
          keyExtractor={(item) => item.client_id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
          // extraData={clientsData}
          ListEmptyComponent={<Text style={styles.emptyText}>No matching Clients found!</Text>}
        />
      )}

    </View >
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  firstContainer: {
    // borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: Display.setWidth(62),
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
    width: Display.setWidth(43),
    paddingRight: 5,
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
    // flex: 1,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    paddingTop: 5,
  },
  // addContainer:{
  //   flexDirection:'row'
  // },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6
  },
  addButtonText: {
    fontSize: 18,
    color: Colors.DEFAULT_LIGHT_WHITE,
    lineHeight: 18 * 1.4,
    fontFamily: Fonts.POPPINS_SEMI_BOLD
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
  cityText: {
    fontFamily: Fonts.POPPINS_MEDIUM,
    fontSize: 12,
    lineHeight: 12 * 1.4,
    color: '#8898A9'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
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
  modalText: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 22 * 1.4,
    fontFamily: Fonts.POPPINS_MEDIUM,
    color: Colors.DEFAULT_WHITE,
    textDecorationLine: 'underline'
  },
  closeButton: {
    marginLeft: 250,
  },
  TextInput: {
    // borderWidth:1,
    width: Display.setWidth(60),
    height: Display.setHeight(6),
    backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    lineHeight: 16 * 1.4,
    fontFamily: Fonts.POPPINS_MEDIUM,
    color: Colors.DEFAULT_DARK_BLUE,
    marginBottom: 20,
    textTransform: 'capitalize'
  },
  modalAddButton: {
    // backgroundColor: Colors.DEFAULT_DARK_RED,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  // buttonEnabled: {
  //   backgroundColor: Colors.DEFAULT_DARK_RED,
  // },
  // buttonDisabled: {
  //   backgroundColor: '#C8CFDD',
  // },
  modalAddButtonText: {
    fontSize: 20,
    lineHeight: 20 * 1.4,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    color: Colors.DEFAULT_WHITE,
    textAlign: 'center'
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
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8
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
  flatListContainer: {
    paddingBottom: 50,
    // borderWidth:1
  },
  selectedContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 5,
    // borderWidth: 1
  },
  selectedCountText: {
    flex: 5,
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontFamily: Fonts.POPPINS_REGULAR,
  },
  selectButton: {
    flex: 2.5,
    // backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
    borderRadius: 8,
  },
  selectButtonText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 16 * 1.4,
    fontFamily: Fonts.POPPINS_MEDIUM,
    color: Colors.DEFAULT_WHITE,
    padding: 8,
  },
  agentAssignContainer: {
    // borderWidth:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20

  },
  dropdown: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.DEFAULT_LIGHT_WHITE,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: Display.setWidth(60),
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
  assignButton: {
    backgroundColor: Colors.DEFAULT_DARK_BLUE,
    marginVertical: 20,
    borderRadius: 30
  },
  buttonEnabled: {
    backgroundColor: Colors.DEFAULT_DARK_BLUE,
  },
  buttonDisabled: {
    backgroundColor: Colors.DEFAULT_DARK_GRAY,
  },
  assignButtonText: {
    fontSize: 20,
    lineHeight: 20 * 1.4,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    color: Colors.DEFAULT_LIGHT_WHITE,
    textAlign: 'center',
    padding: 10,
  }
})




// =================================================//
{/* <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
              <AntDesign
                name="closecircleo"
                size={30}
                color={Colors.DEFAULT_WHITE}
              />
            </TouchableOpacity>
            <Text style={styles.modalText}>New Client</Text>
            <TextInput
              placeholder='Name'
              placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
              selectionColor={Colors.DEFAULT_LIGHT_BLUE}
              style={styles.TextInput}
              value={clientName}
              onChangeText={setClientName}
            />
            <TextInput
              placeholder='Mobile'
              keyboardType='numeric'
              placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
              selectionColor={Colors.DEFAULT_LIGHT_BLUE}
              style={styles.TextInput}
              value={clientNumber}
              onChangeText={setClientNumber}
            />
            <TextInput
              placeholder='City'
              placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
              selectionColor={Colors.DEFAULT_LIGHT_BLUE}
              style={styles.TextInput}
              value={clientCity}
              onChangeText={setClientCity}
            />
            <TextInput
              placeholder='Amount'
              keyboardType='numeric'
              placeholderTextColor={Colors.DEFAULT_LIGHT_BLUE}
              selectionColor={Colors.DEFAULT_LIGHT_BLUE}
              style={styles.TextInput}
              value={clientAmount}
              onChangeText={setClientAmount}
            />
            <TouchableOpacity style={[
              styles.modalAddButton,
              isAddButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
            ]}
              onPress={fetchAddNewClient}
              disabled={isAddButtonDisabled}
            >
              <Text style={styles.modalAddButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


{
  viewModalVisible && (
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
// <Text style={styles.detailsText}>Client Id : {selectedItem.client_id}</Text>
// <Text style={styles.detailsText}>Name : {selectedItem.client_name}</Text>
// <Text style={styles.detailsText}>Mobile : {selectedItem.client_contact}</Text>
// <Text style={styles.detailsText}>Total : {selectedItem.amount}</Text>
// <Text style={styles.detailsText}>Date : {selectedItem.date}</Text>
// <Text style={styles.detailsText}>City : {selectedItem.client_city}</Text>
// <Text style={styles.detailsText}>Over All Paid Amount : {modalTotalPaidAmount ? modalTotalPaidAmount : "No Payments"}</Text>
// <Text style={styles.detailsText}>Last Paid Amount : {modalLastPaidAmount}</Text>



{/* <Text style={styles.detailsText}>Paid Amount & Date : {"\n"}
            {Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
              ? selectedItem.paid_amount_date
                .map(entry => `${entry.date} - ${entry.amount}`)
                .join("\n")
              : "No Payments"}
          </Text> */}



//             <Text style={styles.detailsText}>Last Paid Date : {modalLastPaidDate}</Text>
//             <Text style={styles.detailsText}>Balance Amount : {modalRemainingAmount}</Text>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   )
// } */}