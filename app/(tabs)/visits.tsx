import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const Page = () => {
  return (
    <View>
      <Text>Visitas</Text>
      <Link href={'/details'}>Details</Link>
    </View>
  )
}

export default Page