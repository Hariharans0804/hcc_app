import React, { useRef } from 'react';
import { View, ScrollView, Image, Animated, Text } from 'react-native';
import { DummyText } from '../../components';
import { Colors, Fonts, Images } from '../../constants';
import { Display } from '../../utils';

const Demo = () => {

  const scrollA = useRef(new Animated.Value(0)).current;

  const BANNER_H = 350;
  const TOPNAVI_H = 50;

  return (
    <View>
      {/* <TopNavigation title="Home" scrollA={scrollA} /> */}
      <Animated.ScrollView
        // onScroll={e => console.log(e.nativeEvent.contentOffset.y)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollA } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* <View style={styles.bannerContainer}>
          <Animated.Image
            style={styles.banner(scrollA)}
            source={Images.BANNER}
          />
        </View> */}

        <View style={styles.agentDetailsContainer}>
          <Animated.View style={styles.agentDetails(scrollA)}>
            <Image source={Images.MAN} resizeMode="contain" style={styles.image} />
            <Text style={styles.detailText}>Agent ID : <Text style={styles.detailsText}>55555555</Text></Text>
            <Text style={styles.detailText}>Name : <Text style={styles.detailsText}>55555555</Text></Text>
            <Text style={styles.detailText}>Email : <Text style={[styles.detailsText, { textTransform: 'lowercase' }]}>55555555</Text></Text>
            <Text style={styles.detailText}>Role : <Text style={styles.detailsText}>55555555</Text></Text>
            <Text style={styles.detailText}>City : <Text style={styles.detailsText}>55555555</Text></Text>
          </Animated.View>
        </View>

        <DummyText />
      </Animated.ScrollView>
    </View>
  );
};

const styles = {
  bannerContainer: {
    marginTop: -1000,
    paddingTop: 1000,
    alignItems: 'center',
    overflow: 'hidden',
  },
  banner: scrollA => ({
    height: BANNER_H,
    width: '200%',
    transform: [
      {
        translateY: scrollA.interpolate({
          inputRange: [-BANNER_H, 0, BANNER_H, BANNER_H + 1],
          outputRange: [-BANNER_H / 2, 0, BANNER_H * 0.75, BANNER_H * 0.75],
        }),
      },
      {
        scale: scrollA.interpolate({
          inputRange: [-BANNER_H, 0, BANNER_H, BANNER_H + 1],
          outputRange: [2, 1, 0.5, 0.5],
        }),
      },
    ],
  }),
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
};

export default Demo;

// import { StyleSheet, Text, View, Dimensions } from 'react-native';
// import React from 'react';
// import { ProgressChart } from 'react-native-chart-kit';

// const Demo = () => {
//   // Data for the ProgressChart
//   // each value represents a goal ring in Progress chart
//   const data = {
//     labels: ["Swim", "Bike", "Run"], // optional
//     data: [0.4, 0.6, 0.8]
//   };

//   const screenWidth = Dimensions.get("window").width;

//   const chartConfig = {
//     backgroundGradientFrom: "#1E2923",
//     backgroundGradientFromOpacity: 0,
//     backgroundGradientTo: "#08130D",
//     backgroundGradientToOpacity: 0.2,
//     color: (opacity = 1) => `rgba(30, 80, 177, ${opacity})`,
//     strokeWidth: 2, // optional, default 3
//     barPercentage: 0.5,
//     useShadowColorFromDataset: false, // optional
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Progress Chart Example</Text>
//       <ProgressChart
//         data={data}
//         width={screenWidth}
//         height={220}
//         strokeWidth={16}
//         radius={32}
//         chartConfig={chartConfig}
//         hideLegend={false}
//       />
//     </View>
//   );
// };

// export default Demo;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f4f4f4',
//     padding: 10,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
// });
