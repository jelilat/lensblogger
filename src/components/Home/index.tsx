import React, { FC } from 'react'
import Header from './Header'
import Hero from './Hero'
import Body from './Body'

const Home: FC = () => {
    return (
        <>
            <Header />
            <Hero />
            <Body />
        </>
    )
}

export default Home