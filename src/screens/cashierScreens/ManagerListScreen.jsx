import { ActivityIndicator, FlatList, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
import Toast from 'react-native-toast-message'

const ManagerListScreen = ({ navigation }) => {

    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [employeeData, setEmployeeData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [addNewDistributorModal, setAddNewDistributorModal] = useState(false);
    const [distributorName, setDistributorName] = useState('');
    const [distributorContactNumber, setDistributorContactNumber] = useState('');

    const axiosInstance = axios.create({
        baseURL: API_HOST,
        timeout: 5000, // Set timeout to 5 seconds
    });


    // Fetch manager data
    const fetchEmpoyeesData = async () => {
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

            const ManagerList = response.data.filter((item) =>
                item.role === "Collection Manager"
            );
            setEmployeeData(response.data);
            // console.log(response.data);
            // console.log(collectionAgentList);
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
            fetchEmpoyeesData();

            // Reset the search text whenever the screen gains focus
            setSearchText('');
        }, [])
    )

    const onPressClearTextEntry = () => {
        // console.log('Remove');
        setSearchText('');
    }

    const handleCategoryClick = (category) => {
        setSelectedCategory(category)
        // console.log('category', category);
    }

    const categoryFilteredData = employeeData.filter((item) =>
        // selectedCategory === 'All' || item.role.toLowerCase() === selectedCategory.toLowerCase()
        selectedCategory === 'All' || item.role.toLowerCase().includes(selectedCategory.toLowerCase())
    );


    const searchedData = categoryFilteredData.filter(
        (item) =>
            item.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchText.toLowerCase())
    )

    const closeDistributorModal = () => {
        setDistributorName('');
        setDistributorContactNumber('');
        setAddNewDistributorModal(false);
    }


    const isConfirmButtonDisabled = !distributorName || !distributorContactNumber;


    const fetchAddNewDistributor = async () => {
        try {
            if (!distributorName || !distributorContactNumber) {
                return Alert.alert('Error', 'All fields are required.');
            }

            const addNewDistributorData = {
                username: distributorName,
                phone_number: distributorContactNumber,
                role: "Distributor",
            }

            const response = await axiosInstance.post(`/distrbutorCreated`,
                addNewDistributorData,
            );
            // console.log('333333333', response.data);

            Toast.show({
                type: 'success',
                text1: 'New Distributor Added Successfully!',
                // text2: 'This is some something 👋'
            });

            setDistributorName('');
            setDistributorContactNumber('');
            setAddNewDistributorModal(false);

            fetchEmpoyeesData();
        } catch (error) {
            // console.log('00000000000', error.message);
            console.error('Error adding new employee:', error.response ? error.response.data : error.message);
            Alert.alert('Error', error.response?.data?.message || 'An unexpected error occurred.');
            setLoading(false); // Hide loader on error
        }
    }

    const renderItem = ({ item, index }) => {
        return (
            <View style={styles.employeesListContainer}>
                <Image source={Images.MAN} resizeMode="contain" style={styles.image} />
                <Text numberOfLines={1} style={[styles.employeesList, { fontSize: 22, paddingTop: 15 }]}>{item.username}</Text>
                {/* <Text numberOfLines={1} style={[styles.employeesList, { textTransform: 'lowercase' }]}>{item.email}</Text> */}
                <Text numberOfLines={1} style={[styles.employeesList, { color: Colors.DEFAULT_LIGHT_WHITE }]}>{item.role}</Text>
                <TouchableOpacity
                    style={styles.buttonContainer}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('SingleManagerDetails', { employee: item })} // Pass employee details
                >
                    <Text style={styles.buttonText}>View More</Text>
                    <Feather
                        name="arrow-right-circle"
                        size={22}
                        color={Colors.DEFAULT_LIGHT_BLUE}
                    // style={{ marginRight: 10 }}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
            {/* <Separator height={StatusBar.currentHeight} /> */}

            <View style={styles.firstContainer}>
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
                            <TouchableOpacity activeOpacity={0.8}
                                onPress={onPressClearTextEntry}>
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

                {/* <View style={styles.addButtonContainer} >
                    <TouchableOpacity
                        style={styles.addButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('AddNewEmployee')}
                    >
                        <AntDesign
                            name="pluscircleo"
                            size={20}
                            color={Colors.DEFAULT_LIGHT_WHITE}
                        />
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View> */}
            </View>

            <View style={styles.doubleButtonContainer}>
                <TouchableOpacity
                    style={styles.doubleButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('AddNewEmployee')}
                >
                    <Text style={styles.doubleButtonText}>Add New Employee</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.doubleButton, { backgroundColor: Colors.DEFAULT_GREEN }]}
                    activeOpacity={0.8}
                    onPress={() => setAddNewDistributorModal(true)}
                >
                    <Text style={styles.doubleButtonText}>Add New Distributor</Text>
                </TouchableOpacity>
            </View>

            <Modal animationType="slide" transparent={true} visible={addNewDistributorModal}>
                <View style={styles.passwordModalConatiner}>
                    <View style={styles.passwordModal}>
                        <Text style={styles.deleteModalHeading}>Add New Distributor</Text>
                        {/* <Text style={styles.modalEmailText}>Dummy</Text> */}

                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Enter Name'
                                placeholderTextColor={Colors.DEFAULT_DARK_GRAY}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                value={distributorName}
                                onChangeText={setDistributorName}
                            />
                            {distributorName && (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setDistributorName('')}
                                >
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder='Enter Number'
                                placeholderTextColor={Colors.DEFAULT_DARK_GRAY}
                                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                                style={styles.textInput}
                                keyboardType='numeric'
                                value={distributorContactNumber}
                                onChangeText={setDistributorContactNumber}
                            />
                            {distributorContactNumber && (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setDistributorContactNumber('')}
                                >
                                    <AntDesign
                                        name="closecircleo"
                                        size={20}
                                        color={Colors.DEFAULT_DARK_GRAY}
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={closeDistributorModal}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={fetchAddNewDistributor}
                                disabled={isConfirmButtonDisabled}
                            >
                                <Text style={[styles.passwordText,
                                {
                                    color: isConfirmButtonDisabled
                                        ? Colors.DEFAULT_DARK_GRAY : Colors.DEFAULT_DARK_BLUE
                                }
                                ]}>
                                    Add
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCategoryClick('All')}
                        style={[styles.categoryButton,
                        { backgroundColor: selectedCategory === 'All' ? Colors.DEFAULT_LIGHT_BLUE : Colors.DEFAULT_LIGHT_WHITE }
                        ]}
                    >
                        <Text style={[styles.categoryButtonText,
                        { color: selectedCategory === 'All' ? Colors.DEFAULT_LIGHT_WHITE : Colors.DEFAULT_DARK_GRAY }
                        ]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCategoryClick('Distributor')}
                        style={[styles.categoryButton,
                        { backgroundColor: selectedCategory === 'Distributor' ? Colors.DEFAULT_LIGHT_BLUE : Colors.DEFAULT_LIGHT_WHITE }
                        ]}
                    >
                        <Text style={[styles.categoryButtonText,
                        { color: selectedCategory === 'Distributor' ? Colors.DEFAULT_LIGHT_WHITE : Colors.DEFAULT_DARK_GRAY }
                        ]}>Distributor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCategoryClick('Agent')}
                        style={[styles.categoryButton,
                        { backgroundColor: selectedCategory === 'Agent' ? Colors.DEFAULT_LIGHT_BLUE : Colors.DEFAULT_LIGHT_WHITE }
                        ]}
                    >
                        <Text style={[styles.categoryButtonText,
                        { color: selectedCategory === 'Agent' ? Colors.DEFAULT_LIGHT_WHITE : Colors.DEFAULT_DARK_GRAY }
                        ]}>Agent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCategoryClick('Admin')}
                        style={[styles.categoryButton,
                        { backgroundColor: selectedCategory === 'Admin' ? Colors.DEFAULT_LIGHT_BLUE : Colors.DEFAULT_LIGHT_WHITE }
                        ]}
                    >
                        <Text style={[styles.categoryButtonText,
                        { color: selectedCategory === 'Admin' ? Colors.DEFAULT_LIGHT_WHITE : Colors.DEFAULT_DARK_GRAY }
                        ]}>Admin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCategoryClick('Manager')}
                        style={[styles.categoryButton,
                        { backgroundColor: selectedCategory === 'Manager' ? Colors.DEFAULT_LIGHT_BLUE : Colors.DEFAULT_LIGHT_WHITE }
                        ]}
                    >
                        <Text style={[styles.categoryButtonText,
                        { color: selectedCategory === 'Manager' ? Colors.DEFAULT_LIGHT_WHITE : Colors.DEFAULT_DARK_GRAY }
                        ]}>Manager</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Data Loading and Display */}
            {loading ? (
                <ActivityIndicator
                    size='large'
                    color={Colors.DEFAULT_DARK_BLUE}
                    style={{ marginTop: 20, }}
                />
            ) : employeeData.length === 0 ? (
                <Text style={styles.emptyText}>There are no employees here!</Text>
            ) : (
                <FlatList
                    data={searchedData}
                    // .filter(
                    //     (item) => {
                    //         const searchTextLower = searchText.toLowerCase();
                    //         // Check if the searchText matches either employee name or employee email
                    //         return (
                    //             item.username?.toLowerCase().includes(searchTextLower) ||
                    //             item.email?.toLowerCase().includes(searchText)
                    //         );
                    //     })

                    keyExtractor={(item) => item.user_id?.toString()}
                    renderItem={renderItem}
                    numColumns={2} // Display 2 items per row
                    contentContainerStyle={styles.flatListContainer}
                    // ListEmptyComponent={<Text style={styles.emptyText}>This name does not exist here.</Text>}
                    ListEmptyComponent={<Text style={styles.emptyText}>No matching Employees found!</Text>}
                />
            )}

        </View>
    )
}

export default ManagerListScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE,
    },
    firstContainer: {
        // borderWidth: 1,
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 20
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
        // width: Display.setWidth(62),
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
        // width: Display.setWidth(43),
        width: Display.setWidth(72),
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
    flatListContainer: {
        // borderWidth:1,
        marginHorizontal: 10,
        marginVertical: 10,
        // paddingTop:10,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    employeesListContainer: {
        borderWidth: 2,
        borderColor: 'salmon',
        width: Display.setWidth(45),
        marginBottom: 20,
        marginRight: 17,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderColor: Colors.DEFAULT_LIGHT_BLUE,
        padding: 5,
        borderRadius: 22,
        elevation: 5,
    },
    image: {
        // borderWidth:1,
        width: Display.setWidth(40),
        height: Display.setHeight(10),
        marginVertical: 7
    },
    employeesList: {
        fontSize: 14,
        lineHeight: 14 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        padding: 5,
        color: Colors.DEFAULT_WHITE,
        textTransform: 'capitalize'
    },
    buttonContainer: {
        backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: Display.setWidth(35),
        padding: 10,
        borderRadius: 20,
        marginVertical: 10
    },
    buttonText: {
        fontSize: 14,
        lineHeight: 14 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_BLUE
    },
    emptyText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        marginVertical: 10,
        color: Colors.DEFAULT_DARK_RED
    },
    categoryContainer: {
        // flex:1,
        // borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        // width:Display.setWidth(90),
        // height:Display.setHeight(5),
        // marginHorizontal: 15,
        marginLeft: 15,
        marginRight: 5,
        marginBottom: 10,
    },
    categoryButton: {
        marginRight: 10,
        // borderWidth: 0.5,
        borderRadius: 20
    },
    categoryButtonText: {
        fontSize: 14,
        lineHeight: 14 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        paddingVertical: 10,
        paddingHorizontal: 25
    },
    doubleButtonContainer: {
        // borderWidth: 1,
        marginHorizontal: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // gap: 30
    },
    doubleButton: {
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
        borderRadius: 30,
        paddingHorizontal: 5,
    },
    doubleButtonText: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        color: Colors.DEFAULT_WHITE,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        padding: 10
        // paddingVertical: 10,
        // paddingHorizontal: 10
    },
    passwordModalConatiner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    passwordModal: {
        margin: 20,
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 20,
        padding: 30,
        // alignItems: 'center',
        width: Display.setWidth(90),
        height: Display.setHeight(35),
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
    textInputContainer: {
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_GRAY,
        flexDirection: 'row',
        alignItems: 'center',
        width: Display.setWidth(75),
        height: Display.setHeight(6),
        marginVertical: 10,
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 8,
    },
    deleteModalHeading: {
        marginBottom: 15,
        fontSize: 22,
        lineHeight: 22 * 1.4,
        fontFamily: Fonts.POPPINS_BOLD,
        color: Colors.DEFAULT_DARK_GRAY,
        textDecorationLine: 'underline'
    },
    modalEmailText: {
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_DARK_BLUE,
        backgroundColor: Colors.DEFAULT_WHITE,
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_GRAY,
    },
    textInput: {
        // borderWidth: 1,
        width: Display.setWidth(65),
        height: Display.setHeight(6),
        // backgroundColor: Colors.DEFAULT_WHITE,
        // borderColor: Colors.DEFAULT_LIGHT_GRAY,
        // elevation: 3,
        // borderRadius: 8,
        padding: 10,
        fontSize: 16,
        lineHeight: 16 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_LIGHT_BLUE,
        textTransform: 'capitalize'
    },
    modalButtonContainer: {
        // borderWidth:1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 20,
        marginTop: 5
    },
    cancelText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_REGULAR,
        padding: 10,
        color: Colors.DEFAULT_DARK_GRAY,
    },
    passwordText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        padding: 10,
        color: Colors.DEFAULT_DARK_BLUE,
    },
})