  const fetchClientsData = async () => {
    try {
      const storedToken = await getFromStorage('token');
      console.log('Retrieved token:', storedToken);

      if (!storedToken) {
        console.error('No token found in storage.');
        return;
      }

      const authorization = storedToken; // Update format if required
      console.log('Authorization header:', authorization);

      setLoading(true);

      const response = await fetch('http://192.168.0.3:14926/acc_list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response error:', errorData);
        throw new Error(`HTTP status code ${response.status}`);
      }

      const data = await response.json();
      const unpaidClientsList = data.filter((item) => item.paid_and_unpaid !== 1);
      setClientsData(unpaidClientsList);
      console.log('Fetched clients:', unpaidClientsList);
    } catch (error) {
      console.error('Fetch error:', error.message);
      if (error.message.includes('401')) {
        console.error('Token might be invalid or expired. Redirecting to login...');
        // Redirect to login or request a new token
      }
    } finally {
      setLoading(false);
    }
  };



// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { getFromStorage, removeFromStorage } from './MMKV'; // Adjust the import path

// const ViewStoredDataScreen = () => {
//   const [storedData, setStoredData] = useState(null);

//   // Function to fetch data from storage
//   const fetchStoredData = async () => {
//     const data = await getFromStorage('users'); // Retrieve the value stored with key 'users'
//     setStoredData(data); // Set the state to render it
//   };

//   // Clear stored data (optional)
//   const clearStoredData = async () => {
//     await removeFromStorage('users'); // Clear the specific key
//     setStoredData(null); // Reset the state
//   };

//   useEffect(() => {
//     fetchStoredData(); // Fetch the data when the component mounts
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Stored Data:</Text>
//       {storedData ? (
//         <Text style={styles.data}>{JSON.stringify(storedData, null, 2)}</Text>
//       ) : (
//         <Text style={styles.data}>No data found</Text>
//       )}
//       <Button title="Fetch Data" onPress={fetchStoredData} />
//       <Button title="Clear Data" onPress={clearStoredData} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   data: {
//     fontSize: 16,
//     color: 'gray',
//     textAlign: 'center',
//     marginVertical: 20,
//   },
// });

// export default ViewStoredDataScreen;


// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
// import moment from 'moment';
// import axios from 'axios';

// const TodayCollectionAmountScreen = () => {
//   const [clientsData, setClientsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState('');
//   const [employeesData, setEmployeesData] = useState([]);

//   // Fetch employees data
//   const fetchEmployeesData = async () => {
//     try {
//       const response = await axios.get('http://192.168.0.4:5000/list');
//       setEmployeesData(response.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Fetch clients data
//   const fetchClientsData = async () => {
//     try {
//       const response = await axios.get('http://192.168.0.4:5000/acc_list');
//       setClientsData(response.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Combine both fetches with loading states
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([fetchEmployeesData(), fetchClientsData()]);
//       setLoading(false);
//     };

//     fetchData();
//   }, []);

//   // Pre-map employeesData for efficient lookup
//   const employeeMap = useMemo(() => {
//     const map = {};
//     employeesData.forEach((emp) => (map[emp.user_id] = emp.username));
//     return map;
//   }, [employeesData]);

//   // Filter, search, and sort clients
//   const filteredAndSortedData = useMemo(() => {
//     const currentDate = moment().format('DD-MM-YYYY');
//     return clientsData
//       .filter((item) => {
//         // Filter clients with payments today
//         const hasPaymentsToday =
//           Array.isArray(item.paid_amount_date) &&
//           item.paid_amount_date.some((entry) => entry.date === currentDate);

//         // Apply search filtering
//         const searchTextLower = searchText.toLowerCase();
//         const assignedUsername = employeeMap[item.user_id]?.toLowerCase() || '';

//         const matchesSearch =
//           item.client_name?.toLowerCase().includes(searchTextLower) ||
//           item.client_contact?.toString().includes(searchText) ||
//           assignedUsername.includes(searchTextLower);

//         return hasPaymentsToday && matchesSearch;
//       })
//       .sort((a, b) => {
//         // Sort by the latest payment time
//         const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
//         const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;
//         return bLastPayment - aLastPayment;
//       });
//   }, [clientsData, searchText, employeeMap]);

//   // Calculate total collection for today
//   const totalCollectionToday = useMemo(() => {
//     const currentDate = moment().format('DD-MM-YYYY');
//     return clientsData.reduce((total, client) => {
//       const paymentsToday = Array.isArray(client.paid_amount_date)
//         ? client.paid_amount_date.filter((entry) => entry.date === currentDate)
//         : [];
//       const totalPaidToday = paymentsToday.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
//       return total + totalPaidToday;
//     }, 0);
//   }, [clientsData]);

//   const renderItem = ({ item, index }) => {
//     const currentDate = moment().format('DD-MM-YYYY');
//     const paymentsToday = Array.isArray(item.paid_amount_date)
//       ? item.paid_amount_date.filter((entry) => entry.date === currentDate)
//       : [];
//     const totalPaidToday = paymentsToday.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);


//     return (
//       <View style={styles.row}>
//         <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
//         <Text style={[styles.cell, { flex: 3 }]}>
//           {(item.client_name || '').replace(/"/g, '')}
//           {"\n"}
//           <Text style={styles.cityText}>
//             {employeeMap[item.user_id] || 'Not Found'}
//           </Text>
//         </Text>
//         <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
//         <Text style={[styles.cell, { flex: 2 }]}>{totalPaidToday > 0 ? `${totalPaidToday}` : '-'}</Text>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
//       ) : filteredAndSortedData.length === 0 ? (
//         <Text style={styles.emptyText}>I haven't collected the amount yet.</Text>
//       ) : (
//         <FlatList
//           data={filteredAndSortedData}
//           keyExtractor={(item) => item.client_id?.toString()}
//           renderItem={renderItem}
//         />
//       )}
//       <View style={styles.todayCollectionContainer}>
//         <Text style={styles.todayCollectionText}>
//           Today Collections: {totalCollectionToday.toLocaleString()}
//         </Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // Add your styles here
// });

// export default TodayCollectionAmountScreen;



// // Pre-map employeesData for efficient lookup
// const employeeMap = useMemo(() => {
//     const map = {};
//     employeesData.forEach(emp => (map[emp.user_id] = emp.username));
//     return map;
//   }, [employeesData]);
  
//   <FlatList
//     data={clientsData
//       .filter((item) => {
//         const currentDate = moment().format('DD-MM-YYYY');
//         const hasPaymentsToday = Array.isArray(item.paid_amount_date) &&
//           item.paid_amount_date.some(entry => entry.date === currentDate);
  
//         const searchTextLower = searchText.toLowerCase();
  
//         // Fetch the username using the user_id
//         const assignedUsername = employeeMap[item.user_id]?.toLowerCase() || '';
  
//         // Apply search filtering: check name, contact, or username
//         const matchesSearch =
//           item.client_name?.toLowerCase().includes(searchTextLower) ||
//           item.client_contact?.toString().includes(searchText) ||
//           assignedUsername.includes(searchTextLower);
  
//         return hasPaymentsToday && matchesSearch; // Include clients matching search
//       })
//       .sort((a, b) => {
//         const aLastPayment = a.paid_amount_time ? new Date(a.paid_amount_time).getTime() : 0;
//         const bLastPayment = b.paid_amount_time ? new Date(b.paid_amount_time).getTime() : 0;
//         return bLastPayment - aLastPayment;
//       })
//     }
//     keyExtractor={(item) => item.client_id?.toString()}
//     renderItem={renderItem}
//   />
  

// import React, { useState, useCallback } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Button } from 'react-native';
// import axios from 'axios';
// import { useFocusEffect } from '@react-navigation/native';
// import Feather from 'react-native-vector-icons/Feather';
// import Colors from '../constants/Colors';

// const CollectionListScreen = () => {
//   const [selectedItem, setSelectedItem] = useState([]);
//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [amountValue, setAmountValue] = useState('');
//   const [collectionDataList, setCollectionDataList] = useState([]);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [searchText, setSearchText] = useState('');

//   const fetchCollectionDataList = async () => {
//     try {
//       const response = await axios.get('http://192.168.0.2:5000/acc_list');
//       setCollectionDataList(response.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchCollectionDataList();
//     }, [])
//   );

//   const handleAmountChange = (value) => {
//     setAmountValue(value);
//     setErrorMessage(''); // Clear the error message when the user starts typing
//   };

//   const fetchUpdatedAmountData = async (id) => {
//     if (!id) {
//       console.error('Client ID is missing');
//       return;
//     }

//     const remainingAmount = selectedItem.amount - modalTotalPaidAmount;

//     if (Number(amountValue) > remainingAmount) {
//       setErrorMessage('Entered amount exceeds balance amount!');
//       return;
//     }

//     try {
//       const today = new Date();
//       const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

//       const addNewAmountData = {
//         paid_amount_time: today,
//         paid_amount_date: [
//           ...(selectedItem.paid_amount_date || []),
//           { date: formattedDate, amount: amountValue },
//         ],
//       };

//       const response = await axios.put(
//         `http://192.168.0.2:5000/acc_updated/${id}`,
//         addNewAmountData,
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       console.log('Response:', response.data);

//       setUpdateModalVisible(false);
//       setAmountValue('');
//       fetchCollectionDataList();
//     } catch (error) {
//       console.error('Error:', error.response?.data || error.message);
//       setErrorMessage('Failed to update amount. Please try again.');
//     }
//   };

//   const handlePressUpdate = (item) => {
//     setSelectedItem(item);
//     setUpdateModalVisible(true);
//     setAmountValue('');
//     setErrorMessage('');
//   };

//   const handleModalClose = () => {
//     setUpdateModalVisible(false);
//     setAmountValue('');
//     setErrorMessage('');
//   };

//   const modalTotalPaidAmount = Array.isArray(selectedItem.paid_amount_date)
//     ? selectedItem.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount), 0)
//     : 0;

//   const renderItem = ({ item }) => {
//     const remainingAmount = item.amount - (item.paid_amount_date?.reduce((total, entry) => total + parseFloat(entry.amount), 0) || 0);

//     if (remainingAmount === 0) return null;

//     return (
//       <View style={styles.row}>
//         <Text style={[styles.cell, { flex: 1 }]}>{item.client_id}</Text>
//         <Text style={[styles.cell, { flex: 3 }]}>
//           {(item.client_name || '').replace(/"/g, '')}
//           {'\n'}
//           <Text style={styles.cityText}>{item.client_city || ''}</Text>
//         </Text>
//         <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
//         <View style={[styles.buttonContainer, { flex: 2 }]}>
//           <TouchableOpacity style={styles.updateButton} onPress={() => handlePressUpdate(item)}>
//             <Feather name="edit" size={15} color={Colors.DEFAULT_LIGHT_WHITE} />
//             <Text style={[styles.cell, styles.updateButtonText]}>Paid</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={collectionDataList}
//         renderItem={renderItem}
//         keyExtractor={(item, index) => index.toString()}
//       />
//       {updateModalVisible && (
//         <View style={styles.modal}>
//           <Text style={styles.modalTitle}>Update Payment</Text>
//           <Text>Remaining Amount: {selectedItem.amount - modalTotalPaidAmount}</Text>
//           <TextInput
//             style={[styles.input, errorMessage ? styles.errorInput : null]}
//             placeholder="Enter amount"
//             value={amountValue}
//             keyboardType="numeric"
//             onChangeText={handleAmountChange}
//           />
//           {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
//           <Button title="Submit" onPress={() => fetchUpdatedAmountData(selectedItem.id)} />
//           <Button title="Close" onPress={handleModalClose} />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   cell: {
//     fontSize: 14,
//   },
//   cityText: {
//     fontSize: 12,
//     color: 'gray',
//   },
//   buttonContainer: {
//     alignItems: 'flex-end',
//   },
//   updateButton: {
//     backgroundColor: Colors.DEFAULT_BLUE,
//     padding: 10,
//     borderRadius: 5,
//   },
//   updateButtonText: {
//     fontSize: 12,
//     color: Colors.DEFAULT_LIGHT_WHITE,
//     textTransform: 'uppercase',
//   },
//   modal: {
//     padding: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     elevation: 10,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     padding: 10,
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   errorInput: {
//     borderColor: '#f44336',
//   },
//   errorText: {
//     color: '#f44336',
//     fontSize: 14,
//     marginBottom: 8,
//   },
// });

// export default CollectionListScreen;


// const CollectionListScreen = () => {
//     const [selectedItem, setSelectedItem] = useState([]);
//     const [updateModalVisible, setUpdateModalVisible] = useState(false);
//     const [amountValue, setAmountValue] = useState('');
//     const [collectionDataList, setCollectionDataList] = useState([]);
//     const [searchText, setSearchText] = useState("");

//     const fetchUpdatedAmountData = async (id) => {
//         if (!id) {
//             console.error('Client ID is missing');
//             return;
//         }

//         const remainingAmount = selectedItem.amount - modalTotalPaidAmount;

//         if (amountValue > 0) {
//             if (amountValue > remainingAmount) {
//                 Toast.show({
//                     type: 'error',
//                     text1: 'Entered amount exceeds balance amount!',
//                 });
//                 return;
//             }

//             try {
//                 const today = new Date();
//                 const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

//                 const addNewAmountData = {
//                     paid_amount_date: [
//                         ...(selectedItem.paid_amount_date || []),
//                         { date: formattedDate, amount: amountValue },
//                     ],
//                 };

//                 const response = await axios.put(
//                     `http://192.168.0.3:5000/acc_updated/${id}`,
//                     addNewAmountData,
//                     { headers: { 'Content-Type': 'application/json' } }
//                 );

//                 setUpdateModalVisible(false);
//                 setAmountValue('');
//                 Toast.show({
//                     type: 'success',
//                     text1: 'Client Amount Added Successfully!',
//                 });

//                 fetchCollectionDataList();
//             } catch (error) {
//                 console.error('Error:', error.response?.data || error.message);
//                 Toast.show({
//                     type: 'error',
//                     text1: 'Failed to update amount',
//                     text2: error.response?.data?.error || 'Please try again later.',
//                 });
//             }
//         } else {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Please enter a valid amount',
//             });
//         }
//     };

//     const isUpdateButtonDisabled = !(amountValue);

//     const fetchCollectionDataList = async () => {
//         try {
//             const response = await axios.get('http://192.168.0.3:5000/acc_list');
//             setCollectionDataList(response.data);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     useFocusEffect(
//         useCallback(() => {
//             fetchCollectionDataList();
//         }, [])
//     );

//     const handlePressUpdate = (item) => {
//         setSelectedItem(item);
//         setUpdateModalVisible(true);
//     };

//     const handleModalClose = () => {
//         setUpdateModalVisible(false);
//         setAmountValue('');
//     };

//     const modalTotalPaidAmount = Array.isArray(selectedItem.paid_amount_date)
//         ? selectedItem.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount), 0)
//         : 0;

//     const modalLastPaidAmount = Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
//         ? selectedItem.paid_amount_date[selectedItem.paid_amount_date.length - 1].amount
//         : "No Payments";

//     const modalLastPaidDate = Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
//         ? selectedItem.paid_amount_date[selectedItem.paid_amount_date.length - 1].date
//         : "No Paid Dates";

//     const modalRemainingAmount = selectedItem.amount - modalTotalPaidAmount;

//     const renderItem = ({ item }) => {
//         const remainingAmount = item.amount - (item.paid_amount_date?.reduce((total, entry) => total + parseFloat(entry.amount), 0) || 0);

//         if (remainingAmount === 0) {
//             return null;
//         }

//         return (
//             <View style={styles.row}>
//                 <Text style={[styles.cell, { flex: 1 }]}>{item.client_id}</Text>
//                 <Text style={[styles.cell, { flex: 3 }]}>
//                     {(item.client_name || '').replace(/"/g, '')}
//                     {"\n"}
//                     <Text style={styles.cityText}>{item.client_city || ''}</Text>
//                 </Text>
//                 <Text style={[styles.cell, { flex: 3 }]}>{item.client_contact}</Text>
//                 <View style={[styles.buttonContainer, { flex: 2 }]}>
//                     <TouchableOpacity style={styles.updateButton} onPress={() => handlePressUpdate(item)}>
//                         <Feather
//                             name="edit"
//                             size={15}
//                             color={Colors.DEFAULT_LIGHT_WHITE}
//                         />
//                         <Text style={[
//                             styles.cell,
//                             {
//                                 fontSize: 12,
//                                 lineHeight: 12 * 1.4,
//                                 textTransform: 'uppercase',
//                                 color: Colors.DEFAULT_LIGHT_WHITE,
//                             }
//                         ]}>Paid</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         );
//     };

//     return (
//         <View style={styles.container}>
//             <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
//             <Separator height={StatusBar.currentHeight} />
//             <View style={styles.inputContainer}>
//                 <View style={styles.inputSubContainer}>
//                     <Feather
//                         name="search"
//                         size={20}
//                         color={Colors.DEFAULT_BLACK}
//                         style={{ marginRight: 10 }}
//                     />
//                     <SearchInput
//                         onChangeText={(text) => setSearchText(text)}
//                         placeholder="Search"
//                         selectionColor={Colors.DEFAULT_BLACK}
//                         style={styles.searchInput}
//                     />
//                 </View>
//             </View>

//             <View style={styles.header}>
//                 <Text style={[styles.heading, { flex: 1 }]}>No</Text>
//                 <Text style={[styles.heading, { flex: 3 }]}>Name</Text>
//                 <Text style={[styles.heading, { flex: 3 }]}>Mobile</Text>
//                 <Text style={[styles.heading, { flex: 2 }]}>Details</Text>
//             </View>

//             <FlatList
//                 data={collectionDataList.filter(
//                     (item) => {
//                         const searchTextLower = searchText.toLowerCase();
//                         return (
//                             item.client_name?.toLowerCase().includes(searchTextLower) ||
//                             item.client_contact?.toString().includes(searchText)
//                         );
//                     })}
//                 keyExtractor={(item) => item.client_id?.toString()}
//                 renderItem={renderItem}
//                 removeClippedSubviews={false}
//                 extraData={updateModalVisible}
//             />

//             {updateModalVisible && (
//                 <Modal animationType="slide" transparent={true} visible={updateModalVisible}>
//                     <View style={styles.updateModalConatiner}>
//                         <View style={styles.updateModal}>
//                             <TouchableOpacity style={styles.updateModalCloseButton} onPress={handleModalClose}>
//                                 <AntDesign
//                                     name="closecircleo"
//                                     size={30}
//                                     color={Colors.DEFAULT_WHITE}
//                                 />
//                             </TouchableOpacity>
//                             <Text style={styles.updateModalText}>Details</Text>

//                             <View style={styles.detailsContainer}>
//                                 <Text style={styles.detailsText}>Client Id : {selectedItem.client_id}</Text>
//                                 <Text style={styles.detailsText}>Name : {selectedItem.client_name}</Text>
//                                 <Text style={styles.detailsText}>Mobile : {selectedItem.client_contact}</Text>
//                                 <Text style={styles.detailsText}>Total : {selectedItem.amount}</Text>
//                                 <Text style={styles.detailsText}>Date : {selectedItem.date}</Text>
//                                 <Text style={styles.detailsText}>City : {selectedItem.client_city}</Text>
//                                 <Text style={styles.detailsText}>Over All Paid Amount : {modalTotalPaidAmount || "No Payments"}</Text>
//                                 <Text style={styles.detailsText}>Last Paid Amount : {modalLastPaidAmount}</Text>
//                                 <Text style={styles.detailsText}>Last Paid Date : {modalLastPaidDate}</Text>
//                                 <Text style={styles.detailsText}>Balance Amount : {modalRemainingAmount}</Text>

//                                 <View style={styles.amountInputContainer}>
//                                     <Text style={styles.detailsText}>Today Amount : </Text>
//                                     <TextInput
//                                         placeholder="0"
//                                         placeholderTextColor={Colors.DEFAULT_DARK_BLUE}
//                                         selectionColor={Colors.DEFAULT_DARK_BLUE}
//                                         style={styles.amountTextInput}
//                                         keyboardType="numeric"
//                                         value={amountValue}
//                                         onChangeText={setAmountValue}
//                                     />
//                                 </View>

//                                 <View style={styles.saveButtonContainer}>
//                                     <TouchableOpacity
//                                         style={[
//                                             styles.saveButton,
//                                             isUpdateButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled,
//                                         ]}
//                                         activeOpacity={0.8}
//                                         onPress={() => {
//                                             if (parseFloat(amountValue) > modalRemainingAmount) {
//                                                 Toast.show({
//                                                     type: "error",
//                                                     text1: "Invalid Amount",
//                                                     text2: "Amount entered exceeds the balance. Please try again.",
//                                                 });
//                                                 return;
//                                             } else if (parseFloat(amountValue) === modalRemainingAmount) {
//                                                 fetchUpdatedAmountData(selectedItem.client_id);
//                                                 // Remove client from the list if the balance is fully paid
//                                                 setCollectionDataList((prevList) =>
//                                                     prevList.filter((item) => item.client_id !== selectedItem.client_id)
//                                                 );
//                                             } else if (parseFloat(amountValue) > 0) {
//                                                 fetchUpdatedAmountData(selectedItem.client_id);
//                                             } else {
//                                                 Toast.show({
//                                                     type: "error",
//                                                     text1: "Invalid Input",
//                                                     text2: "Please enter a valid amount.",
//                                                 });
//                                             }
//                                         }}
//                                         disabled={isUpdateButtonDisabled}
//                                     >
//                                         <Text style={styles.saveButtonText}>Paid</Text>
//                                         <FontAwesome name="send" size={20} color={Colors.DEFAULT_LIGHT_BLUE} />
//                                     </TouchableOpacity>
//                                 </View>
//                             </View>
//                         </View>
//                     </View>
//                 </View>
//           </Modal>
//     )
// }
        





// {viewModalVisible && (
//     <Modal animationType="slide" transparent={true} visible={viewModalVisible}>
//       <View style={styles.viewModalConatiner}>
//         <View style={styles.viewModal}>
//           <TouchableOpacity style={styles.viewModalCloseButton} onPress={handleModalClose}>
//             <AntDesign
//               name="closecircleo"
//               size={30}
//               color={Colors.DEFAULT_WHITE}
//             />
//           </TouchableOpacity>
//           <Text style={styles.viewModalText}>Details</Text>
//           <View style={styles.detailsContainer}>
//             {/* <Text style={styles.detailsText}>Client Id : {selectedItem.index !== undefined ? selectedItem.index + 1 : 'N/A'}</Text> */}
//             <Text style={styles.detailsText}>Client Id : {selectedItem.client_id}</Text>
//             <Text style={styles.detailsText}>Name : {selectedItem.client_name}</Text>
//             <Text style={styles.detailsText}>Mobile : {selectedItem.client_contact}</Text>
//             <Text style={styles.detailsText}>Total : {selectedItem.amount}</Text>
//             <Text style={styles.detailsText}>Date : {selectedItem.date}</Text>
//             <Text style={styles.detailsText}>Paid Amount : {modalTotalPaidAmount ? modalTotalPaidAmount : "No Payments"}</Text>
//             {/* <Text style={styles.detailsText}>Paid Amount & Date : {"\n"}
//                 {Array.isArray(selectedItem.paid_amount_date) && selectedItem.paid_amount_date.length > 0
//                   ? selectedItem.paid_amount_date
//                   .map(entry => `${entry.date} - ${entry.amount}`)
//                   .join("\n")
//                   : "No Payments"}
//               </Text> */}
//             <Text style={styles.detailsText}>Last Paid Date : {modalLastPaidDate}</Text>
//             <Text style={styles.detailsText}>Balance Amount : {modalRemainingAmount}</Text>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   )}



//   viewModalConatiner: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   viewModal: {
//     margin: 20,
//     backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
//     borderRadius: 20,
//     padding: 30,
//     alignItems: 'center',
//     width: Display.setWidth(90),
//     height: Display.setHeight(65),
//     // height: '65%',
//     // width: '90%', // Increase the width to 90% of the screen width
//     maxWidth: 400, // Set a maxWidth for larger screens
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     // borderWidth: 1,
//   },
//   viewModalCloseButton: {
//     marginLeft: 250,
//   },
//   viewModalText: {
//     marginBottom: 15,
//     textAlign: 'center',
//     fontSize: 22,
//     lineHeight: 22 * 1.4,
//     fontFamily: Fonts.POPPINS_MEDIUM,
//     color: Colors.DEFAULT_WHITE,
//     textDecorationLine: 'underline'
//   },
//   detailsContainer: {
//     width: Display.setWidth(70),
//     // borderWidth: 1,
//     // borderColor: Colors.DEFAULT_LIGHT_WHITE,
//     // borderRadius: 10,
//     // marginVertical:10,
//     // padding: 40
//     paddingVertical: 10,
//     // paddingHorizontal: 10
//   },
//   detailsText: {
//     fontSize: 18,
//     // lineHeight: 20 * 1.4,
//     fontFamily: Fonts.POPPINS_MEDIUM,
//     color: Colors.DEFAULT_LIGHT_WHITE,
//     textTransform: 'capitalize'
//   },


// import React from 'react';
// import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
// import { useSelector } from 'react-redux';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import Fontisto from 'react-native-vector-icons/Fontisto';

// // import Colors from '../constants/Colors';
// import Fonts from '../constants/Fonts';
// import Images from '../constants/Images';

// // Screens
// import LoginScreen from '../screens/LoginScreen';
// import HomeScreen from '../screens/CollectionManagerScreens/HomeScreen';
// import CollectionListScreen from '../screens/CollectionManagerScreens/CollectionListScreen';
// import HistoryScreen from '../screens/CollectionManagerScreens/HistoryScreen';
// import TodayCollectionAmountScreen from '../screens/CollectionManagerScreens/TodayCollectionAmountScreen';
// import DemoScreen from '../screens/CollectionAgentScreens/DemoScreen';

// // Stack and Drawer instances
// const Stack = createNativeStackNavigator();
// const Drawer = createDrawerNavigator();

// const Navigators = () => {
//     const { isAuthenticated, role } = useSelector((state) => state.auth); // Role and auth state from Redux

//     return (
//         <>
//             <NavigationContainer>
//                 <Stack.Navigator screenOptions={{ headerShown: false }}>
//                     {!isAuthenticated ? (
//                         <Stack.Screen name="Login" component={LoginScreen} />
//                     ) : (
//                         <Stack.Screen
//                             name="DrawerNavigation"
//                             component={
//                                 role === 'Collection Manager'
//                                     ? ManagerDrawerNavigation
//                                     : AgentDrawerNavigation
//                             }
//                         />
//                     )}
//                 </Stack.Navigator>
//             </NavigationContainer>
//         </>
//     );
// };

// // Drawer for Collection Manager
// const ManagerDrawerNavigation = () => (
//     <Drawer.Navigator
//         screenOptions={({ navigation }) => ({
//             headerRight: () => (
//                 <TouchableOpacity
//                     onPress={() => alert('Notifications')}
//                     style={{ marginRight: 15 }}>
//                     <MaterialCommunityIcons
//                         name="bell-badge"
//                         size={25}
//                         color={Colors.DEFAULT_DARK_RED}
//                     />
//                 </TouchableOpacity>
//             ),
//             drawerStyle: {
//                 backgroundColor: Colors.DEFAULT_WHITE,
//                 width: 320,
//             },
//         })}
//         initialRouteName="Home"
//         drawerContent={(props) => <CustomDrawerContent {...props} />}
//     >
//         <Drawer.Screen name="Home" component={HomeScreen} />
//         <Drawer.Screen name="CollectionList" component={CollectionListScreen} />
//         <Drawer.Screen name="History" component={HistoryScreen} />
//         <Drawer.Screen
//             name="TodayCollectionAmount"
//             component={TodayCollectionAmountScreen}
//         />
//     </Drawer.Navigator>
// );

// // Drawer for Collection Agent
// const AgentDrawerNavigation = () => (
//     <Drawer.Navigator
//         screenOptions={({ navigation }) => ({
//             headerRight: () => (
//                 <TouchableOpacity
//                     onPress={() => alert('Notifications')}
//                     style={{ marginRight: 15 }}>
//                     <MaterialCommunityIcons
//                         name="bell-badge"
//                         size={25}
//                         color={Colors.DEFAULT_DARK_RED}
//                     />
//                 </TouchableOpacity>
//             ),
//             drawerStyle: {
//                 backgroundColor: Colors.DEFAULT_WHITE,
//                 width: 320,
//             },
//         })}
//         initialRouteName="Demo"
//         drawerContent={(props) => <CustomDrawerContent {...props} />}
//     >
//         <Drawer.Screen name="Demo" component={DemoScreen} />
//     </Drawer.Navigator>
// );

// // Custom Drawer Content
// const CustomDrawerContent = ({ navigation, state }) => {
//     const { routeNames, index } = state;
//     const focused = routeNames[index];

//     return (
//         <DrawerContentScrollView>
//             <View style={styles.loginNameContainer}>
//                 <Image source={Images.MAN} resizeMode="contain" style={styles.image} />
//                 <Text style={styles.loginText}>John Doe</Text>
//             </View>
//             <DrawerItem
//                 label={'Home'}
//                 onPress={() => navigation.navigate('Home')}
//                 icon={() => (
//                     <Ionicons
//                         name="home"
//                         size={20}
//                         color={focused === 'Home' ? Colors.DEFAULT_WHITE : Colors.DEFAULT_DARK_BLUE}
//                     />
//                 )}
//                 focused={focused === 'Home'}
//                 activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
//                 activeTintColor={Colors.DEFAULT_WHITE}
//                 inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
//                 labelStyle={styles.labelStyle}
//             />
//             <DrawerItem
//                 label={'CollectionList'}
//                 onPress={() => navigation.navigate('CollectionList')}
//                 icon={() => (
//                     <MaterialIcons
//                         name="collections-bookmark"
//                         size={20}
//                         color={
//                             focused === 'CollectionList'
//                                 ? Colors.DEFAULT_WHITE
//                                 : Colors.DEFAULT_DARK_BLUE
//                         }
//                     />
//                 )}
//                 focused={focused === 'CollectionList'}
//                 activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
//                 activeTintColor={Colors.DEFAULT_WHITE}
//                 inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
//                 labelStyle={styles.labelStyle}
//             />
//             <DrawerItem
//                 label={'History'}
//                 onPress={() => navigation.navigate('History')}
//                 icon={() => (
//                     <FontAwesome
//                         name="history"
//                         size={20}
//                         color={
//                             focused === 'History'
//                                 ? Colors.DEFAULT_WHITE
//                                 : Colors.DEFAULT_DARK_BLUE
//                         }
//                     />
//                 )}
//                 focused={focused === 'History'}
//                 activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
//                 activeTintColor={Colors.DEFAULT_WHITE}
//                 inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
//                 labelStyle={styles.labelStyle}
//             />
//             <DrawerItem
//                 label={'Logout'}
//                 onPress={() => navigation.replace('Login')}
//                 icon={() => (
//                     <MaterialCommunityIcons
//                         name="logout"
//                         size={20}
//                         color={
//                             focused === 'Login'
//                                 ? Colors.DEFAULT_WHITE
//                                 : Colors.DEFAULT_DARK_BLUE
//                         }
//                     />
//                 )}
//                 focused={focused === 'Login'}
//                 activeBackgroundColor={Colors.DEFAULT_LIGHT_BLUE}
//                 activeTintColor={Colors.DEFAULT_WHITE}
//                 inactiveTintColor={Colors.DEFAULT_DARK_BLUE}
//                 labelStyle={styles.labelStyle}
//             />
//         </DrawerContentScrollView>
//     );
// };

// // Styles
// const styles = StyleSheet.create({
//     loginNameContainer: { alignItems: 'center', marginBottom: 20 },
//     image: { height: 80, width: 80, borderRadius: 40 },
//     loginText: { fontSize: 16, fontFamily: Fonts.POPPINS_SEMI_BOLD, marginTop: 10 },
//     labelStyle: {
//         fontSize: 15,
//         marginLeft: 10,
//         fontFamily: Fonts.POPPINS_SEMI_BOLD,
//     },
// });

// export default Navigators;



// import React, { useState } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableWithoutFeedback,
//   Keyboard,
// } from 'react-native';

// const Dummy = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [inputText, setInputText] = useState('');

//   return (
//     <View style={styles.container}>
//       {/* Button to show the modal */}
//       <Button title="Open Modal" onPress={() => setModalVisible(true)} />

//       {/* Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <View style={styles.modalOverlay}>
//             <KeyboardAvoidingView
//               behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//               style={styles.modalContainer}
//             >
//               <Text style={styles.modalTitle}>Enter Text</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="Type something..."
//                 value={inputText}
//                 onChangeText={setInputText}
//               />
//               <Text style={styles.modalTitle}>Enter Text</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="Type something..."
//                 value={inputText}
//                 onChangeText={setInputText}
//               />
//               <Text style={styles.modalTitle}>Enter Text</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="Type something..."
//                 value={inputText}
//                 onChangeText={setInputText}
//               />
//               <Text style={styles.modalTitle}>Enter Text</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="Type something..."
//                 value={inputText}
//                 onChangeText={setInputText}
//               />
//               <Text style={styles.modalTitle}>Enter Text</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="Type something..."
//                 value={inputText}
//                 onChangeText={setInputText}
//               />
//               <Text style={styles.modalTitle}>Enter Text</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="Type something..."
//                 value={inputText}
//                 onChangeText={setInputText}
//               />
//               <Button
//                 title="Close Modal"
//                 onPress={() => setModalVisible(false)}
//               />
//             </KeyboardAvoidingView>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContainer: {
//     margin: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 5,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   textInput: {
//     width: '100%',
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 20,
//   },
// });

// export default Dummy;



// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { createDrawerNavigator } from "@react-navigation/drawer";
// import { NavigationContainer } from "@react-navigation/native";
// import Ionicons from "react-native-vector-icons/Ionicons";

// const Drawer = createDrawerNavigator();

// const HomeScreen = () => (
//   <View style={styles.screenContainer}>
//     <Text style={styles.screenText}>Home Screen</Text>
//   </View>
// );

// const ProfileScreen = () => (
//   <View style={styles.screenContainer}>
//     <Text style={styles.screenText}>Profile Screen</Text>
//   </View>
// );

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Drawer.Navigator
//         screenOptions={({ navigation }) => ({
//           headerRight: () => (
//             <TouchableOpacity
//               onPress={() => alert("Notifications")}
//               style={{ marginRight: 15 }}
//             >
//               <Ionicons name="notifications-outline" size={25} color="#000" />
//             </TouchableOpacity>
//           ),
//           drawerStyle: {
//             backgroundColor: "#f2f2f2", // Drawer background color
//             width: 250, // Drawer width
//           },
//           drawerActiveTintColor: "#ffffff", // Active item text color
//           drawerActiveBackgroundColor: "#007BFF", // Active item background color
//           drawerInactiveTintColor: "#000000", // Inactive item text color
//           drawerLabelStyle: {
//             fontSize: 16,
//             fontWeight: "bold",
//           },
//           headerTitleAlign: "center", // Optional: Center align the header title
//         })}
//       >
//         <Drawer.Screen
//           name="Home"
//           component={HomeScreen}
//           options={{
//             drawerIcon: ({ color, size }) => (
//               <Ionicons name="home-outline" size={size} color={color} />
//             ),
//           }}
//         />
//         <Drawer.Screen
//           name="Profile"
//           component={ProfileScreen}
//           options={{
//             drawerIcon: ({ color, size }) => (
//               <Ionicons name="person-outline" size={size} color={color} />
//             ),
//           }}
//         />
//       </Drawer.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   screenContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   screenText: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
// });


// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Modal,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import AntDesign from "react-native-vector-icons/AntDesign";

// const CollectionListScreen = () => {
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalType, setModalType] = useState(""); // To differentiate between "view" and "refresh"
//   const [updatedText, setUpdatedText] = useState(""); // Text input value for refresh

//   const data = [
//     { id: 1, name: "hariharan", mobile: 1234567890, total: 1000, paid: 500, pending: 500, time: "1.00 AM" },
//     { id: 2, name: "vishwa", mobile: 2345678901, total: 1000, paid: 200, pending: 800, time: "2.00 AM" },
//     // Add more items as needed...
//   ];

//   const handlePressItem = (item, type) => {
//     setSelectedItem(item);
//     setModalType(type);
//     setModalVisible(true);
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.row}>
//       <Text style={[styles.cell, { width: 45 }]}>{item.id}</Text>
//       <Text style={[styles.cell, { width: 150 }]}>{item.name}</Text>
//       <Text style={[styles.cell, { width: 150 }]}>{item.mobile}</Text>
//       <Text style={[styles.cell, { width: 100 }]}>{item.total}</Text>
//       <Text style={[styles.cell, { width: 100 }]}>{item.paid}</Text>
//       <Text style={[styles.cell, { width: 100 }]}>{item.pending}</Text>
//       <Text style={[styles.cell, { width: 120 }]}>{item.time}</Text>
//       <View style={[styles.buttonContainer, { width: 120 }]}>
//         <TouchableOpacity style={styles.viewButton} onPress={() => handlePressItem(item, "view")}>
//           <Ionicons name="eye" size={20} color="#000" />
//           <Text style={styles.buttonText}>View</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.updateButton} onPress={() => handlePressItem(item, "refresh")}>
//           <FontAwesome name="pencil-square-o" size={20} color="#fff" />
//           <Text style={styles.buttonText}>Refresh</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#000" />
//       <View style={styles.dataContainer}>
//         <ScrollView horizontal>
//           <View style={styles.listContainer}>
//             <FlatList data={data} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
//           </View>
//         </ScrollView>
//       </View>

//       {/* Modal */}
//       <Modal animationType="slide" transparent={true} visible={modalVisible}>
//         <View style={styles.centeredView}>
//           <View style={styles.modalView}>
//             <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//               <AntDesign name="closecircleo" size={30} color="#fff" />
//             </TouchableOpacity>
//             <Text style={styles.modalText}>
//               {modalType === "view" ? "View Details" : "Refresh Data"}
//             </Text>

//             {modalType === "view" && selectedItem && (
//               <View style={styles.detailsContainer}>
//                 <Text style={styles.detailsText}>No: {selectedItem.id}</Text>
//                 <Text style={styles.detailsText}>Name: {selectedItem.name}</Text>
//                 <Text style={styles.detailsText}>Mobile: {selectedItem.mobile}</Text>
//                 <Text style={styles.detailsText}>Total: {selectedItem.total}</Text>
//                 <Text style={styles.detailsText}>Paid: {selectedItem.paid}</Text>
//                 <Text style={styles.detailsText}>Pending: {selectedItem.pending}</Text>
//                 <Text style={styles.detailsText}>Time: {selectedItem.time}</Text>
//               </View>
//             )}

//             {modalType === "refresh" && (
//               <View>
//                 <TextInput
//                   style={styles.textInput}
//                   placeholder="Enter updated data"
//                   value={updatedText}
//                   onChangeText={setUpdatedText}
//                 />
//                 <TouchableOpacity style={styles.saveButton} onPress={() => console.log("Updated data:", updatedText)}>
//                   <Text style={styles.saveButtonText}>Save</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
//   dataContainer: { flex: 1, marginTop: 10 },
//   row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
//   cell: { textAlign: "center", padding: 10, borderWidth: 1, borderColor: "#ddd" },
//   buttonContainer: { flexDirection: "row", justifyContent: "space-around" },
//   viewButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },
//   updateButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#6200EE", padding: 10, borderRadius: 5 },
//   buttonText: { marginLeft: 5, color: "#000", fontWeight: "bold" },
//   centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
//   modalView: { width: 300, padding: 20, backgroundColor: "#fff", borderRadius: 10, alignItems: "center" },
//   closeButton: { position: "absolute", top: 10, right: 10 },
//   modalText: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
//   detailsContainer: { marginTop: 20 },
//   detailsText: { fontSize: 16, marginBottom: 10 },
//   textInput: { borderWidth: 1, borderColor: "#ddd", padding: 10, width: "100%", marginBottom: 20, borderRadius: 5 },
//   saveButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5 },
//   saveButtonText: { color: "#fff", fontWeight: "bold" },
// });

// export default CollectionListScreen;


// import React, { useState } from "react";
// import { View, Text, StyleSheet, FlatList } from "react-native";

// const Dummy = () => {
//     // Old and new data
//     const [oldData, setOldData] = useState([
//         { id: 1, name: "John", age: 30 },
//         { id: 2, name: "Jane", age: 25 },
//     ]);

//     const [newData, setNewData] = useState([
//         { id: 1, name: "John", age: 30 },
//         { id: 2, name: "Jane", age: 0 },
//         { id: 3, name: "Mike", age: 28 },
//         { id: 4, name: "Lucy", age: 22 },
//         { id: 5, name: "Emma", age: 27 },
//     ]);


//     // Process data to assign separate serial numbers
//     const processData = (oldData, newData) => {
//         const oldIds = oldData.map((item) => item.id);

//         // Separate new and old data
//         const processedNewData = newData.map((item, index) => ({
//             ...item,
//             serialNo: index + 1, // New data starts from 1
//             isNew: true,
//         }));

//         const processedOldData = oldData.map((item, index) => ({
//             ...item,
//             serialNo: index + 1, // Old data starts from 1 as well
//             isNew: false,
//         }));

//         // Combine with new data first
//         return [...processedNewData, ...processedOldData];
//     };

//     const processedData = processData(oldData, newData);


//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={processedData}
//                 keyExtractor={(item) => item.id.toString()}
//                 renderItem={({ item }) => (
//                     <View style={styles.itemContainer}>
//                         {/* Show "NEW" label for new items */}
//                         {item.isNew && <View style={styles.newLabelContainer}><Text style={styles.newLabel}>NEW</Text></View>}
//                         <View style={styles.row}>
//                             <Text style={styles.serialNo}>{item.serialNo}.</Text>
//                             <Text style={styles.name}>{item.name}</Text>
//                             <Text style={styles.age}>{item.age}</Text>
//                         </View>
//                     </View>
//                 )}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 20,
//         backgroundColor: "#f5f5f5",
//     },
//     itemContainer: {
//         position: "relative",
//         backgroundColor: "#fff",
//         padding: 15,
//         marginBottom: 15,
//         borderRadius: 10,
//         borderWidth: 1,
//         borderColor: "#ddd",
//         overflow: 'hidden'
//     },
//     row: {
//         flexDirection: "row",
//         alignItems: "center",
//     },
//     serialNo: {
//         width: 30,
//         fontWeight: "bold",
//     },
//     name: {
//         flex: 1,
//         fontSize: 16,
//     },
//     age: {
//         width: 50,
//         textAlign: "right",
//     },
//     newLabelContainer: {
//         position: "absolute",
//         // top:0.5,
//         // left: -11,
//         top: 0,
//         left: -16,
//         backgroundColor: "red",
//         transform: [{ rotate: "-45deg" }],
//         zIndex: 1,
//     },
//     newLabel: {
//         color: "white",
//         fontWeight: "bold",
//         fontSize: 8,
//         paddingHorizontal: 15,
//         // paddingVertical: 3,
//         paddingTop: 4,
//         paddingBottom: 2
//         , textAlign: 'center'
//     },
// });

// export default Dummy;
