"use client";

import React, { useState, useEffect } from 'react';

type FadeInProps = {
    children: React.ReactNode;
    duration?: number;
    delay?: number;
    className?: string;
};

const FadeIn: React.FC<FadeInProps> = ({
    children,
    duration = 700,
    delay = 0,
    className = ""
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={`transition-opacity duration-${duration} ease-in ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
        >
            {children}
        </div>
    );
};

export default FadeIn;
