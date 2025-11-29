import React from 'react';
import classNames from 'classnames';
import styles from '@/components/server/console/style.module.css';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

export default ({ title, legend, children }: ChartBlockProps) => (
    // 1. Apply Dark BG, Rounded Corners, Border, Shadow, and Top Margin
    <div
        className={classNames(
            styles.chart_container,
            'group',
            'bg-neutral-800 rounded-xl border border-neutral-700 shadow-lg mt-4'
        )}
    >
        <div className={'flex items-center justify-between px-4 py-2'}>
            {/* 2. Set Title Text Color to Light Gray/White */}
            <h3 className={'font-header transition-colors duration-100 text-neutral-100 group-hover:text-neutral-50'}>
                {title}
            </h3>
            {/* 3. Set Legend Text Color to Light Gray */}
            {legend && <p className={'text-sm flex items-center text-neutral-200'}>{legend}</p>}
        </div>
        <div className={'z-10 ml-2'}>{children}</div>
    </div>
);
