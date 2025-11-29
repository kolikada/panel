import React from 'react';
import Icon from '@/components/elements/Icon';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

export default ({ title, copyOnClick, icon, color, className, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            {/* Set main card background, border, and rounded corners */}
            <div
                className={classNames(
                    styles.stat_block,
                    'bg-neutral-800 rounded-xl border border-neutral-700',
                    className
                )}
            >
                {/* Set status bar and icon background to primary electric blue */}
                <div className={classNames(styles.status_bar, color || 'bg-primary-500')} />
                <div className={classNames(styles.icon, color || 'bg-primary-500')}>
                    <Icon
                        icon={icon}
                        className={classNames({
                            'text-black': !color || color === 'bg-primary-500', // Icon dark text if background is primary
                            'text-gray-50': color && color !== 'bg-primary-500', // Fallback color
                        })}
                    />
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'font-header leading-tight text-xs md:text-sm text-neutral-200'}>{title}</p>
                    <div
                        ref={ref}
                        className={'h-[1.75rem] w-full font-semibold text-neutral-50 truncate'} // Updated text to neutral-50
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
