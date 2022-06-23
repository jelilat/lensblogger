import React, { FC, useState } from 'react';
import { useQuery } from '@apollo/client';
import Explore from './Explore'
import Recommended from './Recommended'

const Body: FC = () => {

    return (
        <>
        <div className="flex p-3">
            <div className="flex w-16">
                
            </div>
            <div className="w-4/5 mx-7 px-5">
                <Explore />
            </div>
            <div className="w-1/5 mx-5">
                <Recommended />
            </div>
            <div className="flex w-16">
                
            </div>
        </div>
        </>
    )
}

export default Body