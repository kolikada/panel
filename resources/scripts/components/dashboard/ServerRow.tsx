import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip } from '@/lib/formatters';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';

// --- CONFIGURATION: GAME MEDIA ---
// We changed this from "GAME_IMAGES" to "GAME_MEDIA" to support videos.
// Structure: { type: 'image' | 'video', url: '...' }

type GameMedia = {
    type: 'image' | 'video';
    url: string;
};

const GAME_MEDIA: Record<string, GameMedia> = {
    // --- SURVIVAL GAMES ---
    // UPDATED: Minecraft is now a video example
    minecraft: {
        type: 'video',
        url: 'https://cdn.pixabay.com/video/2021/11/29/99299-655758366_large.mp4', // Change this to your preferred video
    },
    ark: {
        type: 'image',
        url: 'https://cdn1.epicgames.com/offer/dae80c0d4e3b4d648498b48af609b8bb/EGS_ARKSurvivalAscended_StudioWildcard_Editions_S1_2560x1440-56bbd196193f1dc3d74adab54973fd9c',
    },
    rust: { type: 'video', url: 'https://files.facepunch.com/lewis/1b2911b110/krieg_hero.mp4' },
    valheim: { type: 'image', url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/library_hero.jpg' },
    terraria: { type: 'image', url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/library_hero.jpg' },
    dayz: { type: 'image', url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/221100/library_hero.jpg' },
    projectzomboid: { type: 'image', url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/108600/library_hero.jpg' },
    seven_days: { type: 'image', url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/251570/library_hero.jpg' },

    // --- SHOOTERS / FPS ---
    csgo: { type: 'image', url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_hero.jpg' },
    tf2: { type: 'image', url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/440/library_hero.jpg' },
    gmod: { type: 'image', url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/4000/library_hero.jpg' },
    fivem: {
        type: 'image',
        url: 'https://wallpapers.com/images/high/gta-background-fekdt074snbdico4.webp',
    },

    // --- PROGRAMMING / BOTS ---
    nodejs: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2070&auto=format&fit=crop',
    },
    python: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=2074&auto=format&fit=crop',
    },
    java: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
    },
    discord: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2074&auto=format&fit=crop',
    },

    // --- VOICE ---
    teamspeak: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    },

    // --- DEFAULT ---
    default: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    },
};

// Function to pick media based on server name
const getGameMedia = (serverName: string): GameMedia => {
    const name = serverName.toLowerCase();

    // --- CHECK FOR GAMES ---
    if (name.includes('ark')) return GAME_MEDIA.ark;
    if (name.includes('rust')) return GAME_MEDIA.rust;
    if (
        name.includes('minecraft') ||
        name.includes('mc') ||
        name.includes('paper') ||
        name.includes('forge') ||
        name.includes('bedrock')
    )
        return GAME_MEDIA.minecraft;
    if (name.includes('valheim')) return GAME_MEDIA.valheim;
    if (name.includes('terraria')) return GAME_MEDIA.terraria;
    if (name.includes('dayz')) return GAME_MEDIA.dayz;
    if (name.includes('zomboid')) return GAME_MEDIA.projectzomboid;
    if (name.includes('7 days') || name.includes('7d2d')) return GAME_MEDIA.seven_days;

    // --- CHECK FOR FPS ---
    if (name.includes('csgo') || name.includes('counter strike')) return GAME_MEDIA.csgo;
    if (name.includes('tf2') || name.includes('team fortress')) return GAME_MEDIA.tf2;
    if (name.includes('gmod') || name.includes('garry')) return GAME_MEDIA.gmod;
    if (name.includes('fivem') || name.includes('gta')) return GAME_MEDIA.fivem;

    // --- CHECK FOR BOTS/LANGUAGES ---
    if (name.includes('discord') || name.includes('bot')) return GAME_MEDIA.discord;
    if (name.includes('node') || name.includes('js') || name.includes('javascript')) return GAME_MEDIA.nodejs;
    if (name.includes('python') || name.includes('py')) return GAME_MEDIA.python;
    if (name.includes('java') && !name.includes('script')) return GAME_MEDIA.java;

    // --- CHECK FOR VOICE ---
    if (name.includes('ts3') || name.includes('teamspeak')) return GAME_MEDIA.teamspeak;

    // --- DEV OVERRIDE ---
    if (name.includes('dev')) return GAME_MEDIA.rust;

    return GAME_MEDIA.default;
};

// --- STYLED COMPONENTS ---

const CardWrapper = styled(Link)`
    ${tw`block relative w-full rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-neutral-800`};
    height: 180px;

    &:hover {
        ${tw`border-primary-500 shadow-xl transform -translate-y-1`};
        // This targets both the image div AND the video tag with class "bg-media"
        & > .bg-media {
            transform: scale(1.05);
        }
    }
`;

// Renamed BackgroundImage to handle Images specifically, but added reusable CSS logic
const BackgroundImage = styled.div<{ $imageUrl: string }>`
    ${tw`absolute inset-0 bg-center bg-cover transition-transform duration-700 ease-in-out z-0`};
    background-image: url('${(props) => props.$imageUrl}');
`;

const Overlay = styled.div`
    ${tw`absolute inset-0 z-0 bg-gradient-to-b from-neutral-900/40 via-neutral-900/80 to-neutral-900`};
`;

const ContentWrapper = styled.div`
    ${tw`relative z-10 p-4 h-full flex flex-col justify-between`};
`;

const StatusDot = styled.div<{ $status: ServerPowerState | undefined }>`
    ${tw`w-3 h-3 rounded-full mr-3 animate-pulse`};
    ${({ $status }) =>
        !$status || $status === 'offline'
            ? tw`bg-red-500 shadow-[0_0_10px_4px_rgba(239,68,68,0.6)]`
            : $status === 'running'
            ? tw`bg-green-500 shadow-[0_0_10px_4px_rgba(34,197,94,0.6)]`
            : tw`bg-yellow-500 shadow-[0_0_10px_4px_rgba(234,179,8,0.6)]`}
`;

// ---------------------------------

type Timer = ReturnType<typeof setInterval>;

const ServerRow = ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;
        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });
        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = false;
        alarms.disk = false;
    }

    // --- GET DYNAMIC MEDIA ---
    const media = getGameMedia(server.name);

    return (
        <CardWrapper to={`/server/${server.id}`} className={className}>
            {/* Background Layer: Logic to switch between Video and Image */}
            {media.type === 'video' ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className='bg-media absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 ease-in-out'
                >
                    <source src={media.url} type='video/mp4' />
                </video>
            ) : (
                <BackgroundImage $imageUrl={media.url} className='bg-media' />
            )}

            <Overlay />

            {/* Main Content Layer */}
            <ContentWrapper>
                {/* TOP SECTION */}
                <div css={tw`flex justify-between items-start`}>
                    <div css={tw`flex items-center`}>
                        <StatusDot $status={stats?.status} />
                        <div>
                            <h3 css={tw`text-lg font-bold text-white leading-tight drop-shadow-md`}>{server.name}</h3>
                            <div css={tw`flex items-center text-xs text-neutral-300 mt-1`}>
                                <span css={tw`font-mono opacity-100`}>{server.uuid.split('-')[0]}</span>
                                <span css={tw`mx-2 text-primary-500`}> </span>
                            </div>
                        </div>
                    </div>
                    <FontAwesomeIcon icon={faServer} css={tw`text-neutral-100 text-xl opacity-100 drop-shadow-md`} />
                </div>

                {/* BOTTOM SECTION: Stats Bar */}
                <div
                    css={tw`grid grid-cols-4 gap-2 mt-auto pt-3 pb-2 px-2 
    border-t border-white/10 
    bg-neutral-800/50 
    backdrop-filter backdrop-blur-sm 
    rounded-lg`}
                >
                    {/* CPU */}
                    <div css={tw`flex flex-col`}>
                        <div css={tw`flex items-center mb-1`}>
                            <FontAwesomeIcon icon={faMicrochip} css={tw`text-neutral-400 text-[10px] mr-1`} />
                            <span css={tw`text-[10px] text-neutral-400 uppercase tracking-wider`}>CPU</span>
                        </div>
                        <span css={tw`text-sm font-mono text-white`}>
                            {!stats || isSuspended ? '-' : `${stats.cpuUsagePercent.toFixed(1)}%`}
                        </span>
                    </div>

                    {/* MEMORY */}
                    <div css={tw`flex flex-col`}>
                        <div css={tw`flex items-center mb-1`}>
                            <FontAwesomeIcon icon={faMemory} css={tw`text-neutral-400 text-[10px] mr-1`} />
                            <span css={tw`text-[10px] text-neutral-400 uppercase tracking-wider`}>Mem</span>
                        </div>
                        <span css={tw`text-sm font-mono text-white`}>
                            {!stats || isSuspended ? '-' : bytesToString(stats.memoryUsageInBytes)}
                        </span>
                    </div>

                    {/* DISK */}
                    <div css={tw`flex flex-col`}>
                        <div css={tw`flex items-center mb-1`}>
                            <FontAwesomeIcon icon={faHdd} css={tw`text-neutral-400 text-[10px] mr-1`} />
                            <span css={tw`text-[10px] text-neutral-400 uppercase tracking-wider`}>Disk</span>
                        </div>
                        <span css={tw`text-sm font-mono text-white`}>
                            {!stats || isSuspended ? '-' : bytesToString(stats.diskUsageInBytes)}
                        </span>
                    </div>

                    {/* IP */}
                    <div css={tw`flex flex-col`}>
                        <div css={tw`flex items-center mb-1`}>
                            <FontAwesomeIcon icon={faEthernet} css={tw`text-neutral-400 text-[10px] mr-1`} />
                            <span css={tw`text-[10px] text-neutral-400 uppercase tracking-wider`}>IP</span>
                        </div>
                        <span css={tw`text-xs font-mono text-white truncate`}>
                            {
                                server.allocations
                                    .filter((alloc) => alloc.isDefault)
                                    .map((alloc) => alloc.alias || ip(alloc.ip))[0]
                            }
                        </span>
                    </div>
                </div>
            </ContentWrapper>
        </CardWrapper>
    );
};

export default memo(ServerRow, isEqual);
