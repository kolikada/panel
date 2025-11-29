import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Can from '@/components/elements/Can';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import SubNavigation from '@/components/elements/SubNavigation';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';
import tw from 'twin.macro';

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();

    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [error, setError] = useState('');

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            <NavigationBar />
            {!uuid || !id ? (
                error ? (
                    <ServerError message={error} />
                ) : (
                    <Spinner size={'large'} centered />
                )
            ) : (
                <>
                    {/* --- SUB NAVIGATION WRAPPER --- */}
                    <div css={tw`max-w-6xl mx-auto px-4`}>
                        <CSSTransition timeout={150} classNames={'fade'} appear in>
                            <SubNavigation>
                                <div>
                                    {routes.server
                                        .filter((route) => !!route.name)
                                        // --- ADMIN PERMISSION FILTER ---
                                        .filter((route) => {
                                            // Hide 'Startup' tab if user is NOT an admin
                                            if (route.path === '/startup' && !rootAdmin) return false;

                                            // Hide 'Settings' tab if user is NOT an admin
                                            //if (route.path === '/settings' && !rootAdmin) return false;

                                            // Hide 'Databases' tab if user is NOT an admin (Optional - remove if you want clients to see it)
                                            // if (route.path === '/databases' && !rootAdmin) return false;
                                            if (route.path === '/network' && !rootAdmin) return false;

                                            return true;
                                        })
                                        // -------------------------------
                                        .map((route) =>
                                            route.permission ? (
                                                <Can key={route.path} action={route.permission} matchAny>
                                                    <NavLink to={to(route.path, true)} exact={route.exact}>
                                                        {route.name}
                                                    </NavLink>
                                                </Can>
                                            ) : (
                                                <NavLink key={route.path} to={to(route.path, true)} exact={route.exact}>
                                                    {route.name}
                                                </NavLink>
                                            )
                                        )}
                                    {rootAdmin && (
                                        // eslint-disable-next-line react/jsx-no-target-blank
                                        <a href={`/admin/servers/view/${serverId}`} target={'_blank'}>
                                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                                        </a>
                                    )}

                                    {/* --- RIGHT SIDE AESTHETIC FILLER --- */}
                                    <section css={tw`ml-auto flex items-center hidden md:flex whitespace-nowrap`}>
                                        {/* Glowing Dot - Fixed height/width to prevent squishing */}
                                        <div
                                            css={tw`w-2 h-2 min-w-[0.5rem] bg-primary-500 rounded-full mr-3 shadow-primary-glow animate-pulse`}
                                        ></div>

                                        {/* Text - Added flex to align text parts */}
                                        <div css={tw`text-xs font-mono text-neutral-400 flex items-center`}>
                                            <span>
                                                ID: <span css={tw`text-neutral-200`}>{uuid?.split('-')[0]}</span>
                                            </span>
                                            <span css={tw`mx-3 text-neutral-600`}>|</span>
                                            <span css={tw`text-primary-500 uppercase font-bold tracking-wider`}>
                                                Tekkura Secured
                                            </span>
                                        </div>
                                    </section>
                                    {/* ----------------------------------- */}
                                </div>
                            </SubNavigation>
                        </CSSTransition>
                    </div>

                    <InstallListener />
                    <TransferListener />
                    <WebsocketHandler />

                    {/* --- MAIN CONTENT WRAPPER --- */}
                    <div css={tw`max-w-6xl mx-auto p-4`}>
                        {inConflictState &&
                        (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                            <ConflictStateRenderer />
                        ) : (
                            <ErrorBoundary>
                                <TransitionRouter>
                                    <Switch location={location}>
                                        {routes.server.map(({ path, permission, component: Component }) => (
                                            <PermissionRoute key={path} permission={permission} path={to(path)} exact>
                                                <Spinner.Suspense>
                                                    <Component />
                                                </Spinner.Suspense>
                                            </PermissionRoute>
                                        ))}
                                        <Route path={'*'} component={NotFound} />
                                    </Switch>
                                </TransitionRouter>
                            </ErrorBoundary>
                        )}
                    </div>
                </>
            )}
        </React.Fragment>
    );
};
