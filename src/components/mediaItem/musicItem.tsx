import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import rpx from '@/utils/rpx';
import ListItem from '../base/listItem';

import LocalMusicSheet from '@/core/localMusicSheet';
import {showPanel} from '../panels/usePanel';
import TitleAndTag from './titleAndTag';
import ThemeText from '../base/themeText';
import TrackPlayer from '@/core/trackPlayer';
import Icon from '@/components/base/icon';
import useColors from "@/hooks/useColors";
import {isSameMediaItem} from "@/utils/mediaUtils";

interface IMusicItemProps {
    index?: string | number;
    showMoreIcon?: boolean;
    musicItem: IMusic.IMusicItem;
    musicSheet?: IMusic.IMusicSheetItem;
    onItemPress?: (musicItem: IMusic.IMusicItem) => void;
    onItemLongPress?: () => void;
    itemPaddingRight?: number;
    left?: () => JSX.Element;
    containerStyle?: StyleProp<ViewStyle>;
    isCurrentPlaying?: boolean;
}
export default function MusicItem(props: IMusicItemProps) {
    const {
        musicItem,
        index,
        onItemPress,
        onItemLongPress,
        musicSheet,
        itemPaddingRight,
        showMoreIcon = true,
        left: Left,
        containerStyle,
    } = props;

    const colors = useColors();
    const isCurrentPlaying = isSameMediaItem(musicItem, TrackPlayer.currentMusic);

    // 高亮样式
    const highlightStyles = {
        backgroundColor: isCurrentPlaying ? colors.listActive || colors.primary + '10' : 'transparent',
        borderLeftWidth: isCurrentPlaying ? rpx(6) : 0,
        borderLeftColor: isCurrentPlaying ? colors.textHighlight || colors.primary : 'transparent',
    };

    // 序号高亮样式
    const indexHighlightStyle = {
        color: isCurrentPlaying ? colors.textHighlight || colors.primary : colors.text,
        fontWeight: isCurrentPlaying ? 'bold' as const : 'normal' as const,
    };

    // 标题高亮样式
    const titleHighlightStyle = {
        color: isCurrentPlaying ? colors.textHighlight || colors.primary : colors.text,
        fontWeight: isCurrentPlaying ? '600' as const : 'normal' as const,
    };

    return (
        <ListItem
            heightType="big"
            style={containerStyle}
            withHorizontalPadding
            leftPadding={index !== undefined ? 0 : undefined}
            rightPadding={itemPaddingRight}
            onLongPress={onItemLongPress}
            onPress={() => {
                if (onItemPress) {
                    onItemPress(musicItem);
                } else {
                    TrackPlayer.play(musicItem);
                }
            }}>
            {Left ? <Left /> : null}
            {index !== undefined ? (
                <ListItem.ListItemText
                    width={rpx(82)}
                    position="none"
                    fixedWidth
                    contentStyle={styles.indexText}>
                    {isCurrentPlaying ? (
                        <View style={styles.playingIndicator}>
                            <Icon
                                name="playingIndicator"
                                size={rpx(28)}
                                color={colors.textHighlight || colors.primary}
                            />
                        </View>
                    ) : (
                        index
                    )}
                </ListItem.ListItemText>
            ) : null}
            <ListItem.Content
                title={
                    <TitleAndTag
                        title={musicItem.title}
                        tag={musicItem.platform}
                        titleStyle={titleHighlightStyle}
                        isCurrentPlaying={isCurrentPlaying}
                    />
                }
                description={
                    <View style={styles.descContainer}>
                        {LocalMusicSheet.isLocalMusic(musicItem) && (
                            <Icon
                                style={styles.icon}
                                color="#11659a"
                                name="check-circle"
                                size={rpx(22)}
                            />
                        )}
                        {/*/!* 当前播放标识 *!/*/}
                        {/*{isCurrentPlaying && (*/}
                        {/*    <Icon*/}
                        {/*        style={styles.playingIcon}*/}
                        {/*        color={colors.textHighlight || colors.primary}*/}
                        {/*        name="play"*/}
                        {/*        size={rpx(20)}*/}
                        {/*    />*/}
                        {/*)}*/}
                        <ThemeText
                            numberOfLines={1}
                            fontSize="description"
                            fontColor={isCurrentPlaying ? "textHighlight" : "textSecondary"}
                            style={{
                                color: isCurrentPlaying
                                    ? colors.textHighlight || colors.primary
                                    : colors.textSecondary
                            }}>
                            {musicItem.artist}
                            {musicItem.album ? ` - ${musicItem.album}` : ''}
                        </ThemeText>
                    </View>
                }
            />
            {showMoreIcon ? (
                <ListItem.ListItemIcon
                    width={rpx(48)}
                    position="none"
                    icon="ellipsis-vertical"
                    onPress={() => {
                        showPanel('MusicItemOptions', {
                            musicItem,
                            musicSheet,
                        });
                    }}
                />
            ) : null}
        </ListItem>
    );
}

const styles = StyleSheet.create({
    icon: {
        marginRight: rpx(6),
    },
    descContainer: {
        flexDirection: 'row',
        marginTop: rpx(16),
    },

    indexText: {
        fontStyle: 'italic',
        textAlign: 'center',
        padding: rpx(2)
    },

    localIcon: {
        marginRight: rpx(6),
    },
    playingIcon: {
        marginRight: rpx(6),
    },
    playingIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});