import { ActivityIndicator, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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

const EmployeeListScreen = ({ navigation }) => {

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [employeesData, setEmployeesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Distributor');


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

      const collectionAgentList = response.data.filter((item) =>
        item.role === "Collection Agent"
      );
      setEmployeesData(response.data);
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
      fetchEmployeesData();

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

  const categoryFilteredData = employeesData.filter(
    (item) =>
      item.role.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  const searchedData = categoryFilteredData.filter(
    (item) =>
      item.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase())
  )



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
          // onPress={() => navigation.navigate('SingleEmployeeDetails', { employee: item })} // Pass employee details
          onPress={() => navigation.navigate('SingleEmployeeClientList', { employee: item })}
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
            placeholder="Name or Email"
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

      <View style={styles.categoryContainer}>
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
      </View>

      {/* Data Loading and Display */}
      {loading ? (
        <ActivityIndicator
          size='large'
          color={Colors.DEFAULT_DARK_BLUE}
          style={{ marginTop: 20, }}
        />
      ) : employeesData.length === 0 ? (
        <Text style={styles.emptyText}>There are no employees here!</Text>
      ) : (
        <FlatList
          data={searchedData}
          // { employeesData
          //   .filter(
          //     (item) => {
          //       const searchTextLower = searchText.toLowerCase();
          //       // Check if the searchText matches either employee name or employee email
          //       return (
          //         item.username?.toLowerCase().includes(searchTextLower) ||
          //         item.email?.toLowerCase().includes(searchText)
          //       );
          //     })}
          keyExtractor={(item) => item.user_id?.toString()}
          renderItem={renderItem}
          numColumns={2} // Display 2 items per row
          contentContainerStyle={styles.flatListContainer}
          // ListEmptyComponent={<Text style={styles.emptyText}>This name does not exist here.</Text>}
          ListEmptyComponent={<Text style={styles.emptyText}>No matching Agents found!</Text>}
        />
      )}

    </View>
  )
}

export default EmployeeListScreen

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
    borderWidth: 1,
    marginBottom: 20
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
    // borderWidth:1
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
    // gap: 10,
    // width:Display.setWidth(90),
    // height:Display.setHeight(5),
    marginHorizontal: 15,
    // marginLeft: 15,
    // marginRight: 5,
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
})


