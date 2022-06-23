import React, { FC, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAccount, useNetwork, useSignTypedData, chain, useContractWrite } from 'wagmi'
import { RECOMMENDED_PROFILES } from '@graphql/Queries/Recommended';
import { Profile , FollowModule, CreateFollowBroadcastItemResult, Maybe } from '@generated/types'
import Image from 'next/image'
import Link from 'next/link'
import { LightningBoltIcon } from '@heroicons/react/solid'
import  { UserAddIcon } from '@heroicons/react/outline'
import { CREATE_FOLLOW_TYPED_DATA } from '@graphql/Mutations/Follow';
import { BROADCAST_MUTATION } from '@graphql/Mutations/Broadcast';
import toast from 'react-hot-toast'
import omit from '@lib/omit'
import { utils } from 'ethers'
import { LensHubProxy } from 'src/abis/LensHubProxy'

const Recommended: FC = () => {
    const [recommended, setRecommended] = useState<Profile[]>()
    const { data: account } = useAccount()
    const { activeChain } = useNetwork()

    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
          toast.error(error?.message)
        }
      })

      const {
        data,
        isLoading: writeLoading,
        write
      } = useContractWrite(
        {
          addressOrName: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
          contractInterface: LensHubProxy
        },
        'postWithSig',
        {
          onError(error: any) {
            toast.error(error?.data?.message ?? error?.message)
          }
        }
      )

      const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
      useMutation(BROADCAST_MUTATION, {
        onError(error) {
        //   if (error.message === ERRORS.notMined) {
        //     toast.error(error.message)
        //   }
          console.log('Relay Error', '#ef4444', error.message)
        }
      })

    useQuery(RECOMMENDED_PROFILES, {
        onCompleted(data) {
            const profiles = data?.recommendedProfiles
            const filteredProfiles = profiles.filter((profile: Profile) => profile.picture?.original?.url !== undefined && profile.name !== null)
            setRecommended(filteredProfiles.slice(0, 5)); console.log(filteredProfiles)
        }
    })

    const [createFollowTypedData, {error, loading: isLoading}] = useMutation(CREATE_FOLLOW_TYPED_DATA, {
        onCompleted({
            createFollowTypedData
        }: {
            createFollowTypedData: CreateFollowBroadcastItemResult
        }){
            const { id, typedData } = createFollowTypedData;
            signTypedDataAsync({
                domain: omit(typedData?.domain, '__typename'),
                types: omit(typedData?.types, '__typename'),
                value: omit(typedData?.value, '__typename')
              }).then((signature) => {
                // setUserSigNonce(userSigNonce + 1)
                const { profileIds, datas: followData } = typedData?.value
                const { v, r, s } = utils.splitSignature(signature)
                const sig = { v, r, s, deadline: typedData.value.deadline }
                const inputStruct = {
                  follower: account?.address,
                  profileIds,
                  datas: followData,
                  sig
                }
                // if (RELAY_ON) {
                  broadcast({ variables: { request: { id, signature } } }).then(
                    ({ data, errors }) => {
                      if (errors || data?.broadcast?.reason === 'NOT_ALLOWED') {
                        write({ args: inputStruct })
                      }
                    }
                  )
                // } else {
                //   write({ args: inputStruct })
                // }
              })
            },
            onError(error) {
              toast.error(error.message)
            }
        }
    )
    console.log(error)

    const followProfile = async (profileId: string, followModule: Maybe<FollowModule> | undefined) => {
        console.log(profileId, followModule)
        if (!account?.address) {
            console.log("Connect wallet")
        } else if (activeChain?.id !== chain.polygonMumbai.id) {
            console.log("Connect to Mumbai Testnet")
        } else {
            createFollowTypedData({
                variables: {
                    request: {
                        profile: profileId,
                        followModule: followModule?.__typename === 'ProfileFollowModuleSettings' ?
                                {profileFollowModule: {profileId: '0x03ae'}} : null
                            // feeFollowModule: followModule?.__typename === 'FeeFollowModuleSettings' ?
                            //     {
                            //         amount: {
                            //             currency: followModule?.feeFollowModule?.contractAddress,
                            //             value: 
                            //         }
                            //     } : null
                        }
                    }
            })
        }
    }

    return (
        <>
        <div className="flex gap-2 items-center px-5 mb-2 sm:px-0">
            Recommended Profiles <LightningBoltIcon className="w-4 h-4 text-yellow-500" />
        </div>
        {
            recommended?.map((profile, index) => {
                return(
                    <div key={index}
                        className="my-5 text-sm"
                        >
                        <div className="flex">
                            <div className="flex cursor-pointer">
                                <Link href={`/post/${profile.id}`}>
                                    <Image src={profile?.picture?.original?.url} alt="profile-picture" width={35} height={35}
                                        className="rounded-full" />
                                </Link>
                            </div>
                            <div className="grow mx-3 cursor-pointer">
                                <Link href={`/post/${profile.id}`}>
                                    <div>
                                        <p className="top-0">{profile?.name}</p>
                                        <p className="text-xs">@{profile?.handle}</p>
                                    </div>
                                </Link>
                            </div>
                            <div>
                                <button onClick={() => {
                                    followProfile(profile?.id, profile?.followModule)
                                }}>
                                    <UserAddIcon className="w-8 h-7 text-green-300 p-1 box-border rounded-md border-2 border-green-300 hover:bg-green-100" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        </>
    )
}

export default Recommended