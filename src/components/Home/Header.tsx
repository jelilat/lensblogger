import React, { FC } from 'react'
import { APP_NAME, DEFAULT_OG } from 'src/constants'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from "next/router";
import LogIn from './LogIn'

const Header: FC = () => {

    return (
        <>
        <div className="flex text-xs p-3 border-b-2 border-b-black-500">
            <div className="flex w-16">
                
            </div>
            <div className="grow mx-5">
                <Link href="/">
                    <Image src={DEFAULT_OG} alt={APP_NAME} width={25} height={25} className="cursor-pointer" /> 
                </Link>
                <input className="border-2 border-b-black-500 mx-5 px-2 rounded-lg h-8" type="text" placeholder="Search..." />
                    <Link 
                        className={`px-2 py-1 bg-grey-500 ${useRouter().pathname === 'write' ? 
                            'bg-black-500' 
                            : 'bg-black-200'}`}
                        href="/write">
                        Write
                    </Link>
                <div className="float-right">
                    <LogIn />
                </div>
            </div>
            <div className="flex w-16">
                
            </div>
        </div>
        </>
    )
}

export default Header