import React from 'react';
import {StyleSheet, TextStyle, View} from 'react-native';
import ThemeText from '../base/themeText';
import rpx from '@/utils/rpx';
import useColors from '@/hooks/useColors';

interface ITitleAndTagProps {
    title: string;
    tag?: string;
    titleStyle?: TextStyle;
    isCurrentPlaying?: boolean;
    numberOfLines?: number;
}

export default function TitleAndTag({
                                        title,
                                        tag,
                                        titleStyle,
                                        isCurrentPlaying = false,
                                        numberOfLines = 1,
                                    }: ITitleAndTagProps) {
    const colors = useColors();

    return (
        <View style={styles.container}>
            <ThemeText
                numberOfLines={numberOfLines}
                fontSize="title"
                fontColor={isCurrentPlaying ? "textHighlight" : "text"}
                style={[
                    titleStyle,
                    {
                        color: isCurrentPlaying
                            ? colors.textHighlight || colors.primary
                            : colors.text,
                        fontWeight: isCurrentPlaying ? '600' : 'normal',
                    }
                ]}>
                {title}
            </ThemeText>

            {tag && (
                <View style={[
                    styles.tagContainer,
                    {
                        backgroundColor: isCurrentPlaying
                            ? colors.textHighlight || colors.primary
                            : colors.border || colors.card,
                        borderColor: isCurrentPlaying
                            ? colors.textHighlight || colors.primary
                            : colors.border || colors.card,
                    }
                ]}>
                    <ThemeText
                        fontSize="caption"
                        style={[
                            styles.tagText,
                            {
                                color: isCurrentPlaying
                                    ? '#FFFFFF'
                                    : colors.textSecondary,
                            }
                        ]}>
                        {tag}
                    </ThemeText>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        flex: 1,
    },
    tagContainer: {
        marginLeft: rpx(12),
        paddingHorizontal: rpx(12),
        paddingVertical: rpx(4),
        borderRadius: rpx(6),
        borderWidth: rpx(1),
    },
    tagText: {
        fontSize: rpx(20),
        fontWeight: '500',
    },
});
