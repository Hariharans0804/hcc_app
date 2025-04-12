import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { Display } from '../../utils';
import { Colors, Fonts } from '../../constants';
import { Separator } from '../../components';
import SearchInput from 'react-native-search-filter';
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";

const CollectionPaidCompletedListScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [paidCompletedList, setPaidCompletedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeesData, setEmployeesData] = useState([]);
  const [agentloginUserData, setAgentLoginUserData] = useState(null);


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

  // Fetch clients data
  const fetchPaidCompletedListData = async () => {
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

      const totalFullAmountPaidList = combinedData.flatMap(user => user.collections || []);
      // console.log('Collections List:', totalFullAmountPaidList);

      const fullAmountPaidLists = totalFullAmountPaidList.filter(
        (item) => item.paid_and_unpaid === 1
      );
      setPaidCompletedList(fullAmountPaidLists);
      // console.log(fullAmountPaidLists);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }


  useFocusEffect(
    useCallback(() => {
      const fetchTodayData = async () => {
        await fetchGetAgentLoginUserData();
        fetchPaidCompletedListData();
      }
      fetchTodayData();
      // fetchEmployeesData();

      // Reset the search text whenever the screen gains focus
      setSearchText('');
    }, [agentloginUserData])
  )


  const onPressClearTextEntry = () => {
    // console.log('Remove');
    setSearchText('');
  }

  const renderItem = ({ item, index }) => {
    // console.log('111111111', item);

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
        <Text style={[styles.cell, { flex: 3 }]}>
          {(item.client_name || '').replace(/"/g, '')}
          {"\n"}
          <Text style={styles.cityText}>
            {item.client_city || ''}
            {/* {employeesData.find((empid) => empid.user_id === item.user_id)?.username || 'Not Found'} */}
          </Text>
        </Text>
        <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
        <View style={[styles.buttonContainer, { flex: 2 }]}>
          <TouchableOpacity
            style={styles.viewButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CollectionClientPaidCompletedList', { client: item, })} // Pass client details
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
        <Text style={[styles.heading, { flex: 2 }]}>Amount</Text>
      </View>

      {/* Data Loading and Display */}
      {/* {loading ? (
        <ActivityIndicator
          size='large'
          color={Colors.DEFAULT_DARK_BLUE}
          style={{ marginTop: 20, }}
        />
      ) : paidCompletedList.length > 0 ? (
        <FlatList
          data={paidCompletedList.filter(
            (item) => {
              // Apply search filtering
              const searchTextLower = searchText.toLowerCase();

              // Check if the searchText matches either client_name or client_contact or agent_name
              const matchesSearch =
                item.client_name?.toLowerCase().includes(searchTextLower) ||
                item.client_contact?.toString().includes(searchText);
              return matchesSearch;
            })
            .sort((a, b) => {
              // Get the last payment time from the 'paid_amount' field
              const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
              const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;

              // Sort descending: latest payment first
              return bLastPayment - aLastPayment;
            })
          }
          keyExtractor={(item) => item.client_id?.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.emptyText}>No one has paid the full amount yet!</Text>
      )} */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.DEFAULT_DARK_BLUE}
          style={{ marginTop: 20 }}
        />
      ) : paidCompletedList.length > 0 ? (
        (() => {
          const filteredList = paidCompletedList.filter((item) => {
            const searchTextLower = searchText.toLowerCase();
            return (
              item.client_name?.toLowerCase().includes(searchTextLower) ||
              item.client_contact?.toString().includes(searchText)
            );
          });

          if (filteredList.length > 0) {
            return (
              <FlatList
                data={filteredList.sort((a, b) => {
                  const aLastPayment = a.paid_amount_time
                    ? new Date(a.paid_amount_time).getTime()
                    : 0;
                  const bLastPayment = b.paid_amount_time
                    ? new Date(b.paid_amount_time).getTime()
                    : 0;

                  return bLastPayment - aLastPayment;
                })}
                keyExtractor={(item) => item.client_id?.toString()}
                renderItem={renderItem}
              />
            );
          } else {
            return (
              <Text style={styles.emptyText}>
                No matching Clients found page!
              </Text>
            );
          }
        })()
      ) : (
        <Text style={styles.emptyText}>
          No one has paid the full amount yet!
        </Text>
      )}

    </View>
  )

}

export default CollectionPaidCompletedListScreen

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
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEEC37',
    padding: 10,
    borderRadius: 25
  },
  emptyText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    textAlign: 'center',
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    marginVertical: 10,
    color: Colors.DEFAULT_DARK_RED
  }
})


// Fetch employees data
// const fetchEmployeesData = async () => {
//   try {
//     // Retrieve the token from storage
//     const storedToken = await getFromStorage('token');
//     // console.log('Retrieved token:', storedToken);

//     if (!storedToken) {
//       console.error('No token found in storage.');
//       return;
//     }

//     const authorization = storedToken; // Use the token as-is or modify if required
//     // console.log('Authorization header:', authorization);

//     setLoading(true);
//     // Axios GET request
//     const response = await axios.get('${API_HOST}/list', {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': authorization, // Include the token in the Authorization header
//       },
//     });

//     const collectionAgentList = response.data.filter((item) =>
//       item.role === "Collection Agent"
//     );
//     setEmployeesData(collectionAgentList);
//     // console.log(response.data);
//   } catch (error) {
//     // Handle errors
//     if (error.response) {
//       console.error('API response error:', error.response.data);
//       if (error.response.status === 401) {
//         console.error('Token might be invalid or expired. Redirecting to login...');
//         // Redirect to login or request a new token
//       }
//     } else {
//       console.error('Fetch error:', error.message);
//     }
//   } finally {
//     setLoading(false);
//   }
// }

// const employeeMap = useMemo(() => {
//   const map = {};
//   employeesData.forEach(emp => (map[emp.user_id] = emp.username));
//   return map;
// }, [employeesData])
