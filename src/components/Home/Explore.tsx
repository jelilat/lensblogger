import React, { FC, useState } from 'react';
import { useQuery } from '@apollo/client';
import { EXPLORE_PUBLICATIONS } from '@graphql/Queries/Explore';
import { Post } from '@generated/types';
import { TimeAgo } from '@lib/dateConverter'
import Link from 'next/link';
import Image from 'next/image';

const Explore: FC = () => {
    const [publications, setPublications] = useState<Post[]>([]);

    useQuery(EXPLORE_PUBLICATIONS, {
        variables: {
            request: {
                sortCriteria: "TOP_COMMENTED",
                publicationTypes: ["POST"],
                sources: ["Lensblog"],
                limit: 10
            }
        },
        fetchPolicy: 'no-cache',
        onCompleted(data){
            const publication = data?.explorePublications?.items;
            console.log(publication)
            publication.map(
                (publicationDetails: Post) => {
                    return (
                        setPublications((publications) => [...publications, publicationDetails])
                    )
                }
            )
        }
    })
    
    const getDate = (publication: Post): string => {
        const epochTime = new Date(publication?.createdAt)
       const time = TimeAgo(epochTime.getTime())
       return time
    }

    return (
        <>
        <div>
            {
                publications && publications?.map((publication, index) => {
                    return (
                        <Link key={index} href={`post/${publication.id}`}>
                            <div className="border-b-2 border-b-black-500 m-3">
                                <div className="text-xs font-solid flex">
                                    <div>
                                        <Image src={publication?.profile?.picture?.original?.url} alt="profile-picture" width={30} height={30}
                                            className="rounded-full" />
                                    </div>
                                    <div className="p-2.5">
                                        {publication?.profile?.handle}
                                    </div>
                                </div>
                                    <div className="overflow-y-clip">
                                        <div className="flex">
                                            <div className="w-3/4">
                                                <h1 className="text-2xl font-bold py-2">
                                                    How to write a Solidity Smart Contract and deploy with remix IDE
                                                </h1>
                                                <div className="text-ellipsis overflow-y-hidden max-h-24"
                                                    dangerouslySetInnerHTML={{ __html: (publication.metadata.content).replace(/<img[^>]* src=\"([^\"]*)\"[^>]*>/g, "") }} />
                                            </div>
                                            <div className="float-right w-64 m-x-5"
                                                dangerouslySetInnerHTML={{ __html: (publication.metadata.content).match(/<img[^>]* src=\"([^\"]*)\"[^>]*>/g) ?
                                                (publication.metadata.content).match(/<img[^>]* src=\"([^\"]*)\"[^>]*>/g)[0] 
                                                : "<img src='/lensblogger.png' />"}} />
                                        </div>
                                        
                                        {/* <p className="text-sm">This is a very short and friendly article</p> */}
                                        <p className="text-xs my-3 text-gray-600">{getDate(publication)}</p>
                                    </div>
                                    <div>
                                        
                                    </div>
                            </div>
                        </Link>
                    )
                })
                }
        </div>
        </>
    )
}

export default Explore