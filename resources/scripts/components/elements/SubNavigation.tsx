import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    // Added 'pb-2' to give space for the scrollbar
    ${tw`w-full max-w-6xl mx-auto bg-neutral-800 shadow overflow-x-auto rounded-xl mb-4 pb-2`};

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        ${tw`w-full`};

        & > a,
        & > div {
            // --- INDIVIDUAL TAB STYLES: ADD rounded-lg ---
            ${tw`inline-block py-3 px-4 text-neutral-100 no-underline whitespace-nowrap transition-all duration-150 rounded-lg`}; // ADDED rounded-lg HERE

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                ${tw`text-primary-500`};
            }

            // --- ACTIVE/CURRENT TAB HIGHLIGHT ---
            &:active,
            &.active {
                ${tw`text-primary-500`};
                box-shadow: inset 0 2px ${theme`colors.primary.500`.toString()};
            }
        }
    }
`;

export default SubNavigation;
