import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

const Header = ({ title }) => {
  return (
    <View>
      <Text style={styles.header}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 5,
    textAlign: 'center',
    backgroundColor:  '#1a237e', /* indigo */
    color: "#FFFFFF"
  },
});

export default Header