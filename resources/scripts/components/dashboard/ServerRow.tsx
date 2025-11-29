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

// --- CONFIGURATION: GAME IMAGES ---
// You can add more games here!
const GAME_IMAGES = {
    // --- SURVIVAL GAMES ---
    minecraft:
        'https://raw.githubusercontent.com/kolikada/Tekkura-assets/refs/heads/main/cool-minecraft-title-art-wmlohye0d7evf2o9.jpg',
    ark: 'https://images.alphacoders.com/599/thumb-1920-599023.jpg', // Your provided link
    rust: 'https://files.facepunch.com/rust/blog/2020/jan/header_1.jpg',
    valheim: 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/library_hero.jpg',
    terraria: 'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/library_hero.jpg',
    dayz: 'https://cdn.cloudflare.steamstatic.com/steam/apps/221100/library_hero.jpg',
    projectzomboid: 'https://cdn.cloudflare.steamstatic.com/steam/apps/108600/library_hero.jpg',
    seven_days: 'https://cdn.cloudflare.steamstatic.com/steam/apps/251570/library_hero.jpg', // 7 Days to Die

    // --- SHOOTERS / FPS ---
    csgo: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_hero.jpg',
    tf2: 'https://cdn.cloudflare.steamstatic.com/steam/apps/440/library_hero.jpg',
    gmod: 'https://cdn.cloudflare.steamstatic.com/steam/apps/4000/library_hero.jpg',
    fivem: 'https://wallpapers.com/images/hd/gta-5-wallpaper-hd-1920-x-1080-h0di01420p9w5869.jpg', // GTA V / FiveM

    // --- PROGRAMMING / BOTS ---
    nodejs: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2070&auto=format&fit=crop', // Code background
    python: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=2074&auto=format&fit=crop', // Python/Code
    java: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop', // Java/Code
    discord: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2074&auto=format&fit=crop', // Discord Bot

    // --- VOICE ---
    teamspeak: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop', // Generic Audio/Waveform

    // --- DEFAULT ---
    default: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop', // Circuit Board
};

// Function to pick image based on server name
const getGameBackground = (serverName: string): string => {
    const name = serverName.toLowerCase();

    // --- CHECK FOR GAMES ---
    if (name.includes('ark')) return GAME_IMAGES.ark;
    if (name.includes('rust')) return GAME_IMAGES.rust;
    if (
        name.includes('minecraft') ||
        name.includes('mc') ||
        name.includes('paper') ||
        name.includes('forge') ||
        name.includes('bedrock')
    )
        return GAME_IMAGES.minecraft;
    if (name.includes('valheim')) return GAME_IMAGES.valheim;
    if (name.includes('terraria')) return GAME_IMAGES.terraria;
    if (name.includes('dayz')) return GAME_IMAGES.dayz;
    if (name.includes('zomboid')) return GAME_IMAGES.projectzomboid;
    if (name.includes('7 days') || name.includes('7d2d')) return GAME_IMAGES.seven_days;

    // --- CHECK FOR FPS ---
    if (name.includes('csgo') || name.includes('counter strike')) return GAME_IMAGES.csgo;
    if (name.includes('tf2') || name.includes('team fortress')) return GAME_IMAGES.tf2;
    if (name.includes('gmod') || name.includes('garry')) return GAME_IMAGES.gmod;
    if (name.includes('fivem') || name.includes('gta')) return GAME_IMAGES.fivem;

    // --- CHECK FOR BOTS/LANGUAGES ---
    if (name.includes('discord') || name.includes('bot')) return GAME_IMAGES.discord;
    if (name.includes('node') || name.includes('js') || name.includes('javascript')) return GAME_IMAGES.nodejs;
    if (name.includes('python') || name.includes('py')) return GAME_IMAGES.python;
    if (name.includes('java') && !name.includes('script')) return GAME_IMAGES.java; // Avoid matching javascript

    // --- CHECK FOR VOICE ---
    if (name.includes('ts3') || name.includes('teamspeak')) return GAME_IMAGES.teamspeak;

    // --- DEV OVERRIDE (Keep this for your local testing) ---
    if (name.includes('dev')) return GAME_IMAGES.minecraft;

    return GAME_IMAGES.default;
};

// --- STYLED COMPONENTS ---

const CardWrapper = styled(Link)`
    ${tw`block relative w-full rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-neutral-800`};
    height: 180px;

    &:hover {
        ${tw`border-primary-500 shadow-xl transform -translate-y-1`};
        & > .bg-image {
            transform: scale(1.05);
        }
    }
`;

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
    // 1. Base shape and Pulse Animation
    ${tw`w-3 h-3 rounded-full mr-3 animate-pulse`};

    // 2. Color & Glow Logic
    // usage: shadow-[x y blur spread color]
    ${({ $status }) =>
        !$status || $status === 'offline'
            ? // RED: Core color + Fuzzy Glow (0px offset, 10px blur, 4px spread)
              tw`bg-red-500 shadow-[0_0_10px_4px_rgba(239,68,68,0.6)]`
            : $status === 'running'
            ? // GREEN: Core color + Fuzzy Glow
              tw`bg-green-500 shadow-[0_0_10px_4px_rgba(34,197,94,0.6)]`
            : // YELLOW: Core color + Fuzzy Glow
              tw`bg-yellow-500 shadow-[0_0_10px_4px_rgba(234,179,8,0.6)]`}
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
        alarms.memory = false; // Simplified
        alarms.disk = false; // Simplified
    }

    // --- GET DYNAMIC IMAGE ---
    const bgImage = getGameBackground(server.name);

    return (
        <CardWrapper to={`/server/${server.id}`} className={className}>
            {/* Background Layers */}
            <BackgroundImage $imageUrl={bgImage} className='bg-image' />
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
                    css={tw`grid grid-cols-4 gap-2 mt-auto pt-3 pb-2 px-2 // Added padding for the box look
    border-t border-white/10 
    bg-neutral-800/50       // Semi-transparent dark background
    backdrop-filter backdrop-blur-sm // The blur effect
    rounded-lg              // Rounded corners for the glass box
`}
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
