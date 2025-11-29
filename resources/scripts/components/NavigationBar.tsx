import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        // Added 'relative' so we can position the bar inside
        ${tw`relative flex items-center h-full no-underline text-neutral-400 px-6 cursor-pointer transition-all duration-150`};

        &:active,
        &:hover {
            ${tw`text-primary-500 bg-neutral-800`};
        }

        &:active,
        &:hover,
        &.active {
            // Remove the old box-shadow line
            box-shadow: none;

            // Create the new glowing "Energy Dash" bar
            &:after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%); /* Center it */

                width: 20px; /* Make it short */
                height: 3px; /* Make it thick */
                border-radius: 4px 4px 0 0; /* Round the top corners */

                /* Color & Glow */
                background-color: ${theme`colors.primary.500`.toString()};
                box-shadow: 0 -2px 8px ${theme`colors.primary.500`.toString()};
            }
        }
    }
`;

export default () => {
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        // Added border-b border-neutral-800 for the subtle separator line
        <div className={'w-full bg-neutral-900 overflow-x-auto'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px]'}>
                {/* --- LEFT SIDE: LOGO & BRANDING --- */}
                <div id={'logo'} className={'flex-1'}>
                    <Link to={'/'} className={'px-4 no-underline transition-colors duration-150 flex items-center'}>
                        <img src='/assets/svgs/Tekkura.svg' alt='Tekkura Logo' style={{ height: '32px' }} />
                        <span className={'text-xl font-header ml-2 text-primary-500'}>Tekkura</span>
                    </Link>
                </div>

                {/* --- RIGHT SIDE: ICONS & ENERGY DASH --- */}
                <RightNavigation className={'flex h-full items-center justify-center'}>
                    <SearchContainer />

                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>

                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span className={'flex items-center w-5 h-5'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>

                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </div>
    );
};
