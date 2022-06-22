import React, { FC, useState, useEffect } from 'react';
import { AUTHENTICATION } from '@graphql/Mutations/Authenticate';
import { GET_CHALLENGE } from '@graphql/Queries/Authenticate';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useAccount, useSignMessage } from 'wagmi';
import Cookies, { CookieAttributes } from 'js-cookie';
import { Button } from '@components/UI/Button'
import { Modal } from '@components/UI/Modal';
import Image from 'next/image'
import Connect from './Connect'

const LogIn: FC = () => {
    const { data: account } = useAccount();
    const { signMessageAsync, isLoading: signLoading } = useSignMessage();
    const [connectModal, setConnectModal] = useState(false);
    const [connected, setConnected] = useState<boolean>();
    const [loggedIn, setLoggedIn] = useState<boolean>()
    const COOKIE_CONFIG: CookieAttributes = {
        sameSite: 'None',
        secure: true,
        expires: 360
      }

    useEffect(()=>{
        if (window.localStorage.getItem('wagmi.connected') === 'true') {
            setConnected(true);
        }

        const accessToken = Cookies.get('accessToken')
        if (accessToken !== undefined) {
            setLoggedIn(true);
        }
    }, [connected, loggedIn])

    const [getChallenge, ] = useLazyQuery(GET_CHALLENGE, {
       variables: { request: {
           address: account?.address,
       }},
       fetchPolicy:'no-cache',
       onCompleted(data){
              console.log(data);    
       }
    })

   const [authenticate] = useMutation(AUTHENTICATION, {
        fetchPolicy:'no-cache',
        onCompleted(data){
                console.log(data);    
          }
   })

   const logout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    window.location.reload()
    }

    return (
        <>
            {!connected ?
                <Button 
                    variant="secondary"
                    onClick={()=>{
                        setConnectModal(true)
                    }}
                    data-bs-toggle="modal"
                >
                    Connect wallet
                        <Modal
                            title="Connect Wallet"
                            show={connectModal}
                            onClose={() => {
                                setConnectModal(false)
                            }}
                        >
                            <Connect />
                        </Modal>
                </Button>
                : !loggedIn ?
                    <Button 
                        variant="secondary"
                        onClick={()=>{
                            getChallenge()
                            .then(({data}) => {
                                signMessageAsync({message: data?.challenge?.text})  
                                .then(async (signature) => {
                                    await authenticate({
                                        variables: {
                                            request: {
                                                address: account?.address, signature
                                            }
                                        }
                                    })
                                    .then((res) => {
                                        Cookies.set(
                                            'accessToken',
                                            res.data.authenticate.accessToken,
                                            COOKIE_CONFIG
                                        )
                                        Cookies.set(
                                            'refreshToken',
                                            res.data.authenticate.refreshToken,
                                            COOKIE_CONFIG
                                        )
                                        window.location.reload()
                                    })
                                })
                            })
                        }}
                    >
                    <Image src='/lens.png' alt='lens' width={12} height={12} />  Login
                    </Button>
                    : <Button 
                        variant="secondary"
                        onClick={()=>{logout()}}
                    >
                        <Image src='/lens.png' alt='lens' width={12} height={12} />  Logout
                    </Button>
                    }
        </>
    )
}

export default LogIn