import { ActivityIndicator, Alert, Animated, FlatList, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Colors, Fonts, Images } from '../../constants';;
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Display } from '../../utils';
import { Separator, SingleEmployeeDetailsComponent } from '../../components';
import { getFromStorage } from '../../utils/mmkvStorage';

const SingleEmployeeDetailsScreen = ({ route }) => {
  const { employee } = route.params; // Extract passed employee data
  // console.log(employee.role);
  const navigation = useNavigation();


  const scrollA = useRef(new Animated.Value(0)).current;


  const renderHeader = () => (
    <Animated.View style={styles.agentDetails(scrollA)}>
      <Image source={Images.MAN} resizeMode="contain" style={styles.image} />
      <Text style={styles.detailText}>
        {employee.role} ID : <Text style={styles.detailsText}>{employee.user_id}</Text>
      </Text>
      <Text style={styles.detailText}>
        Name : <Text style={styles.detailsText}>{employee.username}</Text>
      </Text>
      <Text style={styles.detailText}>
        Email : <Text style={[styles.detailsText, { textTransform: 'lowercase' }]}>{employee.email}</Text>
      </Text>
      <Text style={styles.detailText}>
        Role : <Text style={styles.detailsText}>{employee.role}</Text>
      </Text>
      <Text style={styles.detailText}>
        City : <Text style={styles.detailsText}>{employee.city || "UNKONWN"}</Text>
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.DEFAULT_DARK_BLUE} translucent />
      <Separator height={StatusBar.currentHeight} />

      <View style={styles.headerContainer}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <AntDesign
            name="arrowleft"
            size={28}
            color={Colors.DEFAULT_BLACK}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {/* Single {employee.role === "Distributor" ? employee.role : 'Agent'} Collection Lists */}
          {employee.role === "Distributor"? 'Single Distributor Client Lists' :'Single Agent Collection Lists'}
        </Text>
      </View>

      <Animated.FlatList
        data={[]} // You can provide your employee clients data here
        ListHeaderComponent={renderHeader}
        renderItem={null} // If you're not rendering list items, keep this as `null`
        keyExtractor={(item, index) => index.toString()}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollA } } }],
          { useNativeDriver: true }
        )}
        ListFooterComponent={
          <SingleEmployeeDetailsComponent employee={employee} navigation={navigation} />
        }
        contentContainerStyle={{ paddingBottom: 16 }} // Adjust padding as needed
      />

    </View>
  );
};


export default SingleEmployeeDetailsScreen;

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
  headerContainer: {
    // borderWidth:1,
    borderBottomWidth: 1,
    borderColor: Colors.DEFAULT_LIGHT_GRAY,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 15,
  },
  headerTitle: {
    fontSize: 19,
    lineHeight: 19 * 1.4,
    fontFamily: Fonts.POPPINS_MEDIUM,
    color: Colors.DEFAULT_BLACK
  },
  agentDetailsContainer: {
    marginTop: -1000,
    paddingTop: 1000,
    alignItems: 'center',
    overflow: 'hidden',
  },
  agentDetails: scrollA => ({
    // borderWidth: 1,
    paddingVertical: 10,
    // top: scrollA,
    height: Display.setHeight(53),
    width: Display.setWidth(100),
    transform: [
      {
        translateY: scrollA.interpolate({
          inputRange: [-Display.setHeight(53), 0, Display.setHeight(53), Display.setHeight(53) + 1],
          outputRange: [-Display.setHeight(53) / 2, 0, Display.setHeight(53) * 0.75, Display.setHeight(53) * 0.75],
        }),
      },
      {
        scale: scrollA.interpolate({
          inputRange: [-Display.setHeight(53), 0, Display.setHeight(53), Display.setHeight(53) + 1],
          outputRange: [2, 1, 0.5, 0.5],
        }),
      },
    ],
    // marginBottom: 10,
  }),
  image: {
    width: Display.setWidth(100),
    height: Display.setHeight(15),
    marginBottom: 10,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    marginHorizontal: 10,
    marginTop: 10,
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
  flatListContainer: {
    paddingBottom: 20,
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
    fontSize: 16,
    lineHeight: 16 * 1.4,
    textAlign: 'center',
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    marginVertical: 10,
    color: Colors.DEFAULT_DARK_RED
  }
});



{/* <Animated.ScrollView
        // onScroll={e => console.log(e.nativeEvent.contentOffset.y)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollA } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.agentDetailsContainer}>
          <Animated.View style={styles.agentDetails(scrollA)}>
            <Image source={Images.MAN} resizeMode="contain" style={styles.image} />
            <Text style={styles.detailText}>ID : <Text style={styles.detailsText}>{employee.user_id}</Text></Text>
            <Text style={styles.detailText}>Name : <Text style={styles.detailsText}>{employee.username}</Text></Text>
            <Text style={styles.detailText}>Email : <Text style={[styles.detailsText, { textTransform: 'lowercase' }]}>{employee.email}</Text></Text>
            <Text style={styles.detailText}>Role : <Text style={styles.detailsText}>{employee.role}</Text></Text>
            <Text style={styles.detailText}>City : <Text style={styles.detailsText}>{employee.city}</Text></Text>
          </Animated.View>
        </View>

        <SingleEmployeeDetailsComponent employee={employee} navigation={navigation} />
      </Animated.ScrollView> */}



// const data = [
//   { client_id: 1, client_name: 'hari', city: 'kuwait', client_contact: 1234567890, paid: 500 },
//   { client_id: 2, client_name: 'vishwa', city: 'kuwait', client_contact: 2345678901, paid: 200 },
//   { client_id: 3, client_name: 'ram', city: 'kuwait', client_contact: 3456789012, paid: 100 },
//   { client_id: 4, client_name: 'raj', city: 'kuwait', client_contact: 4567890123, paid: 300 },
//   { client_id: 5, client_name: 'karthik', city: 'kuwait', client_contact: 5678901234, paid: 400 },
//   { client_id: 6, client_name: 'hari', city: 'kuwait', client_contact: 1234567890, paid: 500 },
//   { client_id: 7, client_name: 'vishwa', city: 'kuwait', client_contact: 2345678901, paid: 200 },
//   { client_id: 8, client_name: 'ram', city: 'kuwait', client_contact: 3456789012, paid: 100 },
//   { client_id: 9, client_name: 'raj', city: 'kuwait', client_contact: 4567890123, paid: 300 },
//   { client_id: 10, client_name: 'karthik', city: 'kuwait', client_contact: 5678901234, paid: 400 },
// ];