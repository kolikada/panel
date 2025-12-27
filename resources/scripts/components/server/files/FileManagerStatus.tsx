import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';

export default () => {
    // 1. Get uploads from the store
    const uploads = ServerContext.useStoreState((state) => state.files.uploads);
    const [visible, setVisible] = useState(false);

    // 2. Convert to Array safely (Fixes the "not callable" error)
    // If it's an object, Object.values() turns it into an array we can map.
    const uploadList = Array.isArray(uploads) ? uploads : Object.values(uploads);

    useEffect(() => {
        if (!uploadList.length) {
            setVisible(false);
            return;
        }

        const timeout = setTimeout(() => setVisible(true), 250);
        return () => clearTimeout(timeout);
    }, [uploadList.length]);

    if (!visible) {
        return null;
    }

    return (
        <div css={tw`m-4`}>
            {uploadList.map((upload: any) => (
                <div key={upload.name} css={tw`flex items-center mb-2`}>
                    <div css={tw`flex-1 mr-4`}>
                        <div css={tw`h-2 w-full bg-neutral-700 rounded overflow-hidden`}>
                            <div
                                css={tw`h-full bg-cyan-500 transition-all duration-300`}
                                style={{ width: `${(upload.loaded / upload.total) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div css={tw`text-xs text-neutral-400`}>{upload.name}</div>
                </div>
            ))}
        </div>
    );
};