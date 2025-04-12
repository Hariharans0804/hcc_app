import { ActivityIndicator, FlatList, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Colors, Fonts, Images } from '../../constants';
import { Display } from '../../utils';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Separator } from '../../components';


const SingleClientDetailsScreen = ({ route }) => {
    const { client, employeeName, employeeRole } = route.params; // Extract passed client data
    // console.log(client, employeeName, employeeRole);
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);


    if (!client) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Client data not available.</Text>
            </View>
        );
    }

    // Calculate the total paid amount
    const singleClientTotalPaidAmount = Array.isArray(client.paid_amount_date)
        ? client.paid_amount_date.reduce((total, entry) => total + parseFloat(entry.amount), 0)
        : 0;

    // Calculate the remaining amount
    const singleClientRemainingAmount = client.amount - singleClientTotalPaidAmount

    // console.log(client);

    // Simulate loading delay
    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(() => {
                setLoading(false);  // Stop loading after 2 seconds (simulate processing)
            }, 1000);

            return () => clearTimeout(timer);  // Cleanup the timer
        }, [])
    )

    // if (loading) {
    //     // Render loading spinner or text while data is being processed
    //     return (
    //         <View style={styles.loadingContainer}>
    //             <ActivityIndicator size="large" color={Colors.DEFAULT_DARK_BLUE} />
    //         </View>
    //     );
    // }

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
                    {/* Single {employeeRole === 'Distributor' ? employeeRole : 'Agent'} Collection Details */}
                    {employeeRole === 'Distributor' ? 'Single Distributor Client Details' : 'Single Agent Collection Details'}
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.DEFAULT_DARK_BLUE} />
                </View>
            ) : (
                <ScrollView>
                    <View style={{ paddingBottom: 20, paddingTop: 10 }}>
                        <Image source={Images.MAN} resizeMode='contain' style={styles.image} />
                        <Text style={styles.headingText}>{employeeRole} : <Text style={styles.detailsText}>{employeeName}</Text></Text>
                        <Text style={styles.headingText}>Client ID : <Text style={styles.detailsText}>{client.client_id}</Text></Text>
                        <Text style={styles.headingText}>Client Name : <Text style={styles.detailsText}>{client.client_name}</Text></Text>
                        <Text style={styles.headingText}>Mobile : <Text style={styles.detailsText}>{client.client_contact}</Text></Text>
                        <Text style={styles.headingText}>Total: <Text style={styles.detailsText}>{client.amount}</Text></Text>
                        <Text style={styles.headingText}>Date : <Text style={styles.detailsText}>{client.date}</Text></Text>
                        <Text style={styles.headingText}>City : <Text style={styles.detailsText}>{client.client_city}</Text></Text>
                        <Text style={styles.headingText}>Over All Paid Amount : <Text style={styles.detailsText}>{singleClientTotalPaidAmount}</Text></Text>
                        {employeeRole === 'Distributor' && (
                            <Text style={styles.headingText}>Balance Amount : <Text style={styles.detailsText}>{singleClientRemainingAmount}</Text></Text>
                        )}
                        <Text style={styles.headingText}>Full Details Paid Amount Date & Time : </Text>

                        <View style={styles.amountDateFullContainer}>

                            <View style={styles.amountDateHeadingContainer}>
                                <Text style={[styles.amountDateHeading, { flex: 1 }]}>Date</Text>
                                <Text style={[styles.amountDateHeading, { flex: 1 }]}>Amount</Text>
                            </View>

                            {Array.isArray(client.paid_amount_date) && client.paid_amount_date.length > 0 ? (
                                client.paid_amount_date.map((entry, index) => (
                                    <View key={index} style={styles.amountDateDetailsRow}>
                                        <Text style={[styles.amountDateDetails, { flex: 1 }]}>{entry.date}</Text>
                                        <Text style={[styles.amountDateDetails, { flex: 1 }]}>{entry.amount}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.amountDateDetailsRow}>
                                    <Text style={[styles.amountDateDetails, { flex: 1 }]}>No Payments</Text>
                                    <Text style={[styles.amountDateDetails, { flex: 1 }]}>-</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    )
}

export default SingleClientDetailsScreen

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
    headerContainer: {
        // borderWidth:1,
        borderBottomWidth: 1,
        borderColor: Colors.DEFAULT_LIGHT_GRAY,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    headerTitle: {
        fontSize: 19,
        lineHeight: 19 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK
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
        marginVertical: 5,
        // borderWidth: 1,
        marginBottom: 15
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
        borderColor: Colors.DEFAULT_LIGHT_BLUE,
        backgroundColor: Colors.DEFAULT_LIGHT_BLUE,
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
        fontSize: 16,
        lineHeight: 16 * 1.4,
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