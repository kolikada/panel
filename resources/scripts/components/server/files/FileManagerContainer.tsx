import React, { useEffect } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw, { styled } from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { hashToPath } from '@/helpers';

// FIXED: Converted your CSS module to a Styled Component
const ManagerActions = styled.div`
    ${tw`grid grid-cols-2 sm:grid-cols-3 w-full gap-4 mb-4`};

    & button {
        ${tw`w-full first:col-span-2 sm:first:col-span-1`};
    }

    ${tw`md:(flex flex-1 justify-end mb-0)`};

    @media (min-width: 768px) {
        & button {
            ${tw`w-auto`};
        }
    }
`;

const sortFiles = (files: FileObject[]): FileObject[] => {
    const sortedFiles: FileObject[] = files
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    return sortedFiles.filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name);
};

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? files?.map((file) => file.name) || [] : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            {/* --- YOUR CUSTOM CARD WRAPPER --- */}
            <div css={tw`bg-neutral-800 rounded-xl border border-neutral-700 shadow-lg p-4 mt-4`}>
                <ErrorBoundary>
                    <div className={'flex flex-wrap-reverse md:flex-nowrap mb-4'}>
                        <FileManagerBreadcrumbs
                            renderLeft={
                                <FileActionCheckbox
                                    type={'checkbox'}
                                    css={tw`mx-4`}
                                    checked={selectedFilesLength === (files?.length === 0 ? -1 : files?.length)}
                                    onChange={onSelectAllClick}
                                />
                            }
                        />
                        <Can action={'file.create'}>
                            {/* FIXED: Using Styled Component instead of css class */}
                            <ManagerActions>
                                <FileManagerStatus />
                                <NewDirectoryButton />
                                <UploadButton />
                                <NavLink to={`/server/${id}/files/new${window.location.hash}`}>
                                    <Button>New File</Button>
                                </NavLink>
                            </ManagerActions>
                        </Can>
                    </div>
                </ErrorBoundary>
                {!files ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <>
                        {!files.length ? (
                            <p css={tw`text-sm text-neutral-400 text-center`}>This directory seems to be empty.</p>
                        ) : (
                            <CSSTransition classNames={'fade'} timeout={150} appear in>
                                <div>
                                    {files.length > 250 && (
                                        <div css={tw`rounded bg-yellow-400 mb-px p-3`}>
                                            <p css={tw`text-yellow-900 text-sm text-center`}>
                                                This directory is too large to display in the browser, limiting the
                                                output to the first 250 files.
                                            </p>
                                        </div>
                                    )}
                                    {sortFiles(files.slice(0, 250)).map((file) => (
                                        // FIXED: Changed file.key to file.name to prevent crash
                                        <FileObjectRow key={file.name} file={file} />
                                    ))}
                                    <MassActionsBar />
                                </div>
                            </CSSTransition>
                        )}
                    </>
                )}
            </div>
            {/* --- END CARD WRAPPER --- */}
        </ServerContentBlock>
    );
};