import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Colors, Fonts, Images } from '../../constants';
import { Display } from '../../utils';
import { Separator } from '../../components';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import SearchInput from "react-native-search-filter";
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { getFromStorage } from '../../utils/mmkvStorage';
import { API_HOST } from "@env";
import { Dropdown } from 'react-native-element-dropdown';
import { Screen } from 'react-native-screens';

const SingleManagerDetailsScreen = ({ route, navigation }) => {

  const { employee } = route.params; // Extract passed employee data
  console.log('9999', employee);

  const [passwordModalVisiable, setPasswordModalVisiable] = useState(false);
  const [deleteModalVisiable, setDeleteModalVisiable] = useState(false);
  const [newPasswordChanged, setNewPasswordChanged] = useState('');

  const axiosInstance = axios.create({
    baseURL: API_HOST,
    timeout: 5000, // Set timeout to 5 seconds
  });


  const handleDeleteEmployee = async () => {
    try {
      // Retrieve the token from storage
      const storedToken = await getFromStorage('token');
      // console.log('Retrieved token:', storedToken);

      if (!storedToken) {
        console.error('No token found in storage.');
        return;
      }

      const authorization = storedToken;

      // const response = await axios.delete(`${API_HOST}/delete/${employee.user_id}`);
      const response = await axiosInstance.delete(`/delete/${employee.user_id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization, // Include the token in the Authorization header
        },
      });
      console.log('777777', response.data);

      Toast.show({
        type: 'error',
        text1: 'Deleted Client Successfully!',
        // text2: 'This is some something 👋'
      });

      setDeleteModalVisiable(false);
      navigation.navigate('DrawerNavigation', { screen: 'ManagerList' });

    } catch (error) {
      console.error('Error deleting employee:', error);
      // Alert(error.response?.data?.message || 'Failed to update client');
    }
  }

  const handleNewPasswordChange = async () => {
    try {
      // Retrieve the token from storage
      const storedToken = await getFromStorage('token');
      // console.log('Retrieved token:', storedToken);
      console.log('selected', employee.email);


      if (!storedToken) {
        console.error('No token found in storage.');
        return;
      }

      const authorization = storedToken;

      const newEmployeePasswordChanged = {
        email: employee.email,
        password: newPasswordChanged,
      };

      // const response = await axios.delete(`${API_HOST}/passwordupdated`,
      const response = await axiosInstance.post(`/passwordupdated`,
        newEmployeePasswordChanged, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization, // Include the token in the Authorization header
        },
      })
      console.log('888888', response.data);

      Toast.show({
        type: 'success',
        text1: 'New Password Created Successfully!',
        // text2: 'This is some something 👋'
      });

      setPasswordModalVisiable(false);

    } catch (error) {
      console.error('Error not updated password employee:', error);
      // Alert(error.response?.data?.message || 'Failed to update client');
    }
  }




  const isPasswordChangeButtonDisabled = !newPasswordChanged;

  const closePasswordChangeModal = () => {
    setNewPasswordChanged('');
    setPasswordModalVisiable(false);
  }

  return (

    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
      {/* <Separator height={StatusBar.currentHeight} /> */}
      {/* <ScrollView> */}
      <Image source={Images.MAN} resizeMode="contain" style={styles.image} />
      <Text style={styles.detailText}>{employee.role} ID : <Text style={styles.detailsText}>{employee.user_id}</Text></Text>
      <Text style={styles.detailText}>Name : <Text style={styles.detailsText}>{employee.username}</Text></Text>
      {employee.role !== 'Distributor' && (
        <Text style={styles.detailText}>Email : <Text style={[styles.detailsText, { textTransform: 'lowercase' }]}>{employee.email}</Text></Text>
      )}
      <Text style={styles.detailText}>Contact : <Text style={styles.detailsText}>{employee.phone_number}</Text></Text>
      <Text style={styles.detailText}>Role : <Text style={styles.detailsText}>{employee.role}</Text></Text>

      {employee.role !== 'Distributor' && (
        <Text style={styles.detailText}>City : <Text style={styles.detailsText}>{employee.city}</Text></Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button,
          { backgroundColor: Colors.DEFAULT_GREEN }]}
          onPress={() => navigation.navigate('UpdateEmployee', { updateSingleEmployee: employee })}
        >
          <Text style={styles.buttonText}>Edit Employee</Text>
        </TouchableOpacity>
        {employee.role !== 'Distributor' && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button,
            { backgroundColor: Colors.DEFAULT_LIGHT_BLUE }]}
            onPress={() => setPasswordModalVisiable(true)}
          >
            <Text style={styles.buttonText}>Password Change</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button,
          { backgroundColor: Colors.DEFAULT_DARK_RED }]}
          onPress={() => setDeleteModalVisiable(true)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      {/* </ScrollView> */}

      <Modal animationType="slide" transparent={true} visible={passwordModalVisiable}>
        <View style={styles.passwordModalConatiner}>
          <View style={styles.passwordModal}>
            <Text style={styles.deleteModalHeading}>Change Password</Text>
            <Text style={styles.modalEmailText}>{employee.email}</Text>

            <View style={styles.textInputContainer}>
              <TextInput
                placeholder='New Password'
                placeholderTextColor={Colors.DEFAULT_DARK_GRAY}
                selectionColor={Colors.DEFAULT_LIGHT_BLUE}
                style={styles.textInput}
                value={newPasswordChanged}
                onChangeText={setNewPasswordChanged}
              />
              {newPasswordChanged && (
                <TouchableOpacity activeOpacity={0.8} onPress={() => setNewPasswordChanged('')}>
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
              <TouchableOpacity activeOpacity={0.8} onPress={closePasswordChangeModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNewPasswordChange}
                disabled={isPasswordChangeButtonDisabled}
              >
                <Text style={[styles.passwordText,
                {
                  color: isPasswordChangeButtonDisabled
                    ? Colors.DEFAULT_DARK_GRAY : Colors.DEFAULT_DARK_BLUE
                }
                ]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal animationType="slide" transparent={true} visible={deleteModalVisiable}>
        <View style={styles.deleteModalConatiner}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteModalHeading}>Confirm Deletion</Text>
            <Text style={styles.deleteModalText}>Are you sure want to delete the employee{' '}
              <Text style={styles.deleteModalClientName}>
                " {employee.username} "
              </Text>
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setDeleteModalVisiable(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={handleDeleteEmployee}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  )
}

export default SingleManagerDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
    // padding: 20
    paddingTop: 5,
    paddingBottom: 10,
    // alignItems: 'center',
    // borderWidth:1
  },
  image: {
    width: Display.setWidth(100),
    height: Display.setHeight(15),
    marginBottom: 10,
    marginTop: 10
    // borderWidth:1
  },
  detailText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    color: Colors.DEFAULT_LIGHT_BLUE,
    marginVertical: 5,
    paddingVertical: 10,
    fontFamily: Fonts.POPPINS_MEDIUM,
    textAlign: 'center',
    backgroundColor: Colors.DEFAULT_LIGHT_WHITE,
    marginHorizontal: 15,
    borderRadius: 8
  },
  detailsText: {
    fontSize: 16,
    lineHeight: 16 * 1.4,
    fontFamily: Fonts.POPPINS_EXTRA_BOLD,
    color: Colors.DEFAULT_DARK_BLUE,
    textTransform: 'capitalize'
  },
  buttonContainer: {
    // borderWidth:1,
    marginHorizontal: 15,
    // marginVertical: 10,
    flexDirection: 'column',
    // alignItems:'center',
    // justifyContent:'center'
  },
  button: {
    // backgroundColor:Colors.DEFAULT_DARK_RED,
    marginVertical: 10,
    borderRadius: 30
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    paddingVertical: 15,
    fontFamily: Fonts.POPPINS_MEDIUM,
    textAlign: 'center',
    color: Colors.DEFAULT_LIGHT_WHITE
  },
  deleteModalConatiner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deleteModal: {
    margin: 20,
    backgroundColor: Colors.DEFAULT_WHITE,
    borderRadius: 20,
    padding: 30,
    // alignItems: 'center',
    width: Display.setWidth(90),
    height: Display.setHeight(30),
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
  deleteModalHeading: {
    marginBottom: 15,
    fontSize: 22,
    lineHeight: 22 * 1.4,
    fontFamily: Fonts.POPPINS_BOLD,
    color: Colors.DEFAULT_DARK_GRAY,
    textDecorationLine: 'underline'
  },
  deleteModalText: {
    marginBottom: 15,
    fontSize: 16,
    lineHeight: 18 * 1.4,
    fontFamily: Fonts.POPPINS_REGULAR,
    color: Colors.DEFAULT_BLACK,
  },
  deleteModalClientName: {
    color: Colors.DEFAULT_DARK_RED,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
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
  deleteText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontFamily: Fonts.POPPINS_MEDIUM,
    padding: 10,
    color: Colors.DEFAULT_DARK_RED,
  },
  passwordText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    padding: 10,
    color: Colors.DEFAULT_DARK_BLUE,
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
    textTransform: 'none'
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
  }
})