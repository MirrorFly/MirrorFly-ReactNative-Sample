import React from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ContactIcon, PlusIcon } from './Icons'

const styles = StyleSheet.create({
    primarypilbtn: {
        minWidth: 135,
        padding: 8,
        height: 40,
        minHeight: 4,
        backgroundColor: "#3276E2",
        borderRadius: 25,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    primarypilbtntext: {
        color: '#fff',
        fontSize: 16,
        fontWeight: "bold"

    },
    FloatingBtnContainer: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
    FloatingBtn: {
        backgroundColor: '#3276E2',
        borderRadius: 50,
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    FloatingBtnText: {
        color: "#fff",
        fontSize: 40
    },
})

export const PrimaryPillBtn = (props) => {
    return (
        <TouchableOpacity disabled={props?.isLoading === 'loading'} style={styles.primarypilbtn} {...props}>
            {props?.isLoading === 'loading'
                ? <ActivityIndicator size="large" color="#fff" />
                : <Text style={styles.primarypilbtntext}>{props.title}</Text>
            }
        </TouchableOpacity>
    )
}

export const BackBtn = (props) => {
    return <TouchableOpacity {...props}>
        <Image
            source={require('../assets/leftArrow.png')}
            style={{ width: 18.33, height: 15.32 }}
        />
    </TouchableOpacity >
}

export const SendBtn = (props) => {
    return <TouchableOpacity {...props}>
        <Image
            source={require('../assets/send.png')}
            style={{ width: 24.33, height: 20.32 }}
        />
    </TouchableOpacity >
}


export const FloatingBtn = (props) => {
    return <View style={styles.FloatingBtnContainer}>
        <TouchableOpacity style={styles.FloatingBtn} {...props}>
            <ContactIcon width={25} height={25} />
        </TouchableOpacity>
    </View>
}
