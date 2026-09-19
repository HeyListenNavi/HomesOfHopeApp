import React from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '@/lib/utils';

interface FluentEmojiProps extends TextProps {
    emoji: string;
}

const FluentEmoji = ({ emoji, style, className, ...props }: FluentEmojiProps) => {
    return (
        <Text 
            style={[{ fontFamily: 'FluentEmoji', includeFontPadding: false }, style]} 
            className={cn("text-base leading-none", className)}
            {...props}
        >
            {emoji}
        </Text>
    );
};

export default FluentEmoji;
