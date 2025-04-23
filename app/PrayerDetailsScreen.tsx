import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Cards from './components/Cards';
import { Link } from 'expo-router';
import Calendar from './components/Calendar';
import ReadQuran from './components/ReadQuran'; // Import the ReadQuran component
import { useFonts } from 'expo-font';

const { height } = Dimensions.get('window');

export default function PrayerDetailsScreen() {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any[]>([]);
  const [showReadQuran, setShowReadQuran] = useState(false); // State to toggle ReadQuran

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    ScheherazadeNew: require('../assets/fonts/ScheherazadeNew-Regular.ttf'),
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Simulate data fetching
        setLoading(false);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const openQuran = (content: any[]) => {
    setSelectedContent(content);
    setShowReadQuran(true);
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      resizeMode="cover"
      className="flex-1"
      style={{ height }}
    >
      <View className="flex-1 bg-black/50 px-4 pt-10">
        <ScrollView
          className="space-y-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Cards />

          {/* Fixed Link */}
          <View className="px-4">
            <Link href="/AlarmScreen" asChild>
              <TouchableOpacity
                className="bg-white rounded-xl px-6 py-4 shadow-lg"
                activeOpacity={0.8}
              >
                <Text className="text-zinc-900 text-lg font-semibold text-center">
                  Set Alarm
                </Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              className="bg-amber-500 rounded-xl px-6 py-4 shadow-lg mt-5"
              activeOpacity={0.8}
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-white text-lg font-semibold text-center">
                Read Quran
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-8">
            <Calendar />
          </View>
        </ScrollView>

        {/* Modal for Quran Options */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)} // Close modal on request
        >
          <View className="flex-1 justify-center items-center bg-black/50 px-6">
            {showReadQuran ? (
              // Render ReadQuran component
              <ReadQuran
                onClose={() => {
                  setModalVisible(false); // Close the modal
                  setShowReadQuran(false); // Reset the Quran view
                }}
                content={selectedContent} // Pass the selected content
              />
            ) : (
              <View className="bg-zinc-800 rounded-lg p-6 w-full max-w-md">
                <Text className="text-lg text-white font-bold text-center mb-4">
                  Select Quran Translation
                </Text>

                {/* Arabic Quran */}
                <TouchableOpacity
                  className="bg-amber-500/20 rounded-lg p-4 mb-4"
                  activeOpacity={0.8}
                  onPress={() =>
                    openQuran(require('../assets/quran/merged-ar-en.json'))
                  }
                >
                  <Text className="text-amber-500 text-lg font-semibold text-center">
                    Arabic + English Quran
                  </Text>
                </TouchableOpacity>

                {/* Bengali Quran */}
                <TouchableOpacity
                  className="bg-amber-500/20 rounded-lg p-4 mb-4"
                  activeOpacity={0.8}
                >
                  <Text
                    className="text-amber-500 text-lg font-semibold text-center"
                    onPress={() =>
                      openQuran(require('../assets/quran/banglaquran.json'))
                    }
                  >
                    Bengali Quran
                  </Text>
                </TouchableOpacity>

                {/* Footer Text */}
                <Text className="text-center text-zinc-300 text-sm mt-4">
                  More translations coming soon
                </Text>

                {/* Close Button */}
                <TouchableOpacity
                  className="bg-red-500 rounded-lg p-3 mt-6"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white text-center font-semibold">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
        <View className="my-2 p-4 bg-black/50 rounded-lg">
          <Text className="text-center text-zinc-300 text-2xl">
            Place Add Here
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
