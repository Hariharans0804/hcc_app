This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

<!-- ======================================================= -->

npx react-native doctor

npx react-native run-android

npx react-native start


cd > android                                 step - 1

<!-- APK gradlew clean -->
android > gradlew clean                      step - 2

<!-- If you get any error while cleaning with gradlew clean, then in the next step you need to give this command -->
gradlew clean -x externalNativeBuildCleanRelease      step - 3


<!-- After this command, this command -->

<!-- APK gradlew assembleRelease -->
android > gradlew assembleRelease            step - 3

<!-- ======================================================= -->



🛠 What taskkill Does
taskkill is a Windows command used to terminate (kill) a process running on your system — like if it's stuck or you need to stop it manually.

We use it when something (like Metro bundler) is already using a port and we want to free that port.

✅ Step-by-Step Example to Kill Port 8081
📍 Step 1: Find the Process Using Port 8081
In Command Prompt (CMD), type:

netstat -ano | findstr :8081

Example output:

TCP    127.0.0.1:8081     0.0.0.0:0     LISTENING     12345
The last number (12345) is the PID (Process ID).

📍 Step 2: Kill the Process with That PID
Now run:

taskkill /PID 12345 /F
Replace 12345 with the number you got from above.

The /F flag means “forcefully” kill it.

✅ After that, port 8081 will be freed, and you can restart Metro:

npx react-native start
