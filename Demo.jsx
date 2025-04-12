import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Demo = () => {

    const sendCSVToWhatsApp = () => {
        if (!selectedEmployee?.phone_number) {
            alert("No phone number available for the employee.");
            return;
        }


        let message = "🔹 Clients Report\n\n";
        message += " # | Employee | Client | Total Amount | Collection | Balance | Date \n";
        message += "---|-----------|---------|--------------|-------------|----------\n";

        filteredClients.forEach((client, index) => {
            const totalAmount = parseFloat(client.amount || 0);
            const collectionAmount = (client.paid_amount_date || []).reduce(
                (sum, payment) => sum + parseFloat(payment.amount || 0),
                0
            );
            const balance = totalAmount - collectionAmount;

            message += ${ index + 1 } | ${ selectedEmployee?.username || 'Unknown' } | ${ client.client_name || 'Unknown' } | ${ totalAmount } | ${ collectionAmount } | ${ balance } | ${ selectedDate } \n;
        });


        const phone = selectedEmployee.phone_number;
        const whatsappLink = https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)};

            window.open(whatsappLink, "_blank");
    };

    const sendDistributorCSVToWhatsApp = () => {
        if (!selectedEmployee?.phone_number) {
            alert("No phone number available for the employee.");
            return;
        }

        let message = "🔹 * Distributor Clients Report*\n\n";
        message += " #   | Client Name | Date  | Today Rate | Local Amount | international Amount | \n";
        message += "---|--------------|---------|---------|------------\n";


        const totalLocalAmount = filteredUsers.reduce((sum, client) => {
            const localAmount = client?.amount && client?.today_rate &&
                !isNaN(parseFloat(client.amount)) &&
                !isNaN(parseFloat(client.today_rate))
                ? parseFloat(client.amount) / parseFloat(client.today_rate)
                : 0;

            return sum + localAmount;
        }, 0).toFixed(3);

        const totalInterAmount = Math.ceil(filteredUsers.reduce((sum, client) => {
            return sum + (parseFloat(client.amount) || 0);
        }, 0)).toFixed(2);



        filteredUsers.forEach((client, index) => {
            const localAmount = client.amount && client.today_rate
                ? (parseFloat(client.amount) / parseFloat(client.today_rate)).toFixed(3)
                : "N/A";

            const interAmount = Array.isArray(client.paid_amount_date)
                ? client.paid_amount_date.reduce((sum, payment) =>
                    sum + (parseFloat(payment.amount) || 0), 0
                ).toFixed(2)
                : "0.00";

            const todayRate = client.today_rate ? parseFloat(client.today_rate).toFixed(2) : "N/A";

            message += ${ index + 1 } | ${ client.client_name || 'Unknown' } | ${ client.date } | ${ todayRate } | ${ localAmount } | ${ Math.ceil((parseFloat(client.amount)) || 0).toFixed(2) } |\n;
        });


        message += "🔹 TOTAL CLIENT LOCAL AMOUNT\n\n";
        message += ----- ${ totalLocalAmount } \n\n;

        message += "🔹 TOTAL CLIENT INTERNATIONAL AMOUNT\n\n";
        message += ----- ${ totalInterAmount } \n\n;

        console.log(message);


        const phone = selectedEmployee.phone_number;
        const whatsappLink = https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)};

            window.open(whatsappLink, "_blank");
    };

    return (
        <View>
            <Text>Demo</Text>
        </View>
    )
}

export default Demo

const styles = StyleSheet.create({})