import React, { FC, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAccount, useNetwork, useSignTypedData, chain } from 'wagmi'
import { RECOMMENDED_PROFILES } from '@graphql/Queries/Recommended';
import { Profile , FollowModule, CreateFollowBroadcastItemResult, Maybe } from '@generated/types'
import Image from 'next/image'
import Link from 'next/link'
import { LightningBoltIcon } from '@heroicons/react/solid'
import  { UserAddIcon } from '@heroicons/react/outline'
import { CREATE_FOLLOW_TYPED_DATA } from '@graphql/Mutations/Follow';

const Recommended: FC = () => {
    const [recommended, setRecommended] = useState<Profile[]>()
    const { data: account } = useAccount()
    const { activeChain } = useNetwork()

    useQuery(RECOMMENDED_PROFILES, {
        onCompleted(data) {
            const profiles = data?.recommendedProfiles
            const filteredProfiles = profiles.filter((profile: Profile) => profile.picture?.original?.url !== undefined && profile.name !== null)
            setRecommended(filteredProfiles.slice(0, 5)); console.log(filteredProfiles)
        }
    })

    const [createFollowTypedData, {loading: isLoading}] = useMutation(CREATE_FOLLOW_TYPED_DATA, {
        onCompleted({
            createFollowTypedData
        }: {
            createFollowTypedData: CreateFollowBroadcastItemResult
        }){
            const { id, typedData } = createFollowTypedData;

        }
    })

    const followProfile = async (profileId: string, followmodule: Maybe<FollowModule> | undefined) => {
        console.log(profileId, followmodule)
        if (!account?.address) {
            console.log("Connect wallet")
        } else if (activeChain?.id !== chain.polygonMumbai.id) {
            console.log("Connect to Mumbai Testnet")
        } else {
            createFollowTypedData({
                variables: {
                    request: {
                        profile: profileId,
                        followModule: followmodule
                    }
                }
            })
        }
    }

    return (
        <>
        <div>Recommended Profiles <LightningBoltIcon className="w-4 h-4 text-yellow-500" /></div>
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