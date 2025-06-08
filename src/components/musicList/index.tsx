import {RequestStateCode} from '@/constants/commonConst';
import TrackPlayer from '@/core/trackPlayer';
import rpx from '@/utils/rpx';
import {FlashList} from '@shopify/flash-list';
// import React from 'react';
import {Animated, FlatListProps, StyleSheet, View} from 'react-native';
import ListEmpty from '../base/listEmpty';
import ListFooter from '../base/listFooter';
import MusicItem from '../mediaItem/musicItem';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import useColors from '@/hooks/useColors';

interface IMusicListProps {
    /** 顶部 */
    Header?: FlatListProps<IMusic.IMusicItem>['ListHeaderComponent'];
    /** 音乐列表 */
    musicList?: IMusic.IMusicItem[];
    /** 所在歌单 */
    musicSheet?: IMusic.IMusicSheetItem;
    /** 是否展示序号 */
    showIndex?: boolean;
    /** 点击 */
    onItemPress?: (
        musicItem: IMusic.IMusicItem,
        musicList?: IMusic.IMusicItem[],
    ) => void;
    // 状态
    state: RequestStateCode;
    onRetry?: () => void;
    onLoadMore?: () => void;
}
const ITEM_HEIGHT = rpx(120);
const LOCATE_BUTTON_HIDE_DELAY = 3000; // 3秒后自动隐藏
const ANIMATION_DURATION = 200;


/** 音乐列表 */
export default function MusicList(props: IMusicListProps) {
    const {
        Header,
        musicList,
        musicSheet,
        showIndex,
        onItemPress,
        state,
        onRetry,
        onLoadMore,
    } = props;

    // ! keyExtractor需要保证整个生命周期统一？ 有些奇怪
    // const keyExtractor = useCallback(
    //     (item: any, index: number) =>
    //         '' + index + '-' + item.platform + '-' + item.id,
    //     [],
    // );

    // 定位功能相关状态
    const [showLocateButton, setShowLocateButton] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const locateButtonOpacity = useRef(new Animated.Value(0)).current;
    const flashListRef = useRef<FlashList<IMusic.IMusicItem>>(null);
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
    const colors = useColors();
    const currentPlayingMusic = TrackPlayer.currentMusic;

    // 清理定时器
    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    // 清除隐藏定时器
    const clearHideTimer = useCallback(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
    }, []);

    // 设置隐藏定时器
    const setHideTimer = useCallback(() => {
        clearHideTimer();
        hideTimerRef.current = setTimeout(() => {
            if (showLocateButton) {
                Animated.timing(locateButtonOpacity, {
                    toValue: 0,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: true,
                }).start(() => {
                    setShowLocateButton(false);
                });
            }
        }, LOCATE_BUTTON_HIDE_DELAY);
    }, [showLocateButton, locateButtonOpacity, clearHideTimer]);

    // 显示定位按钮
    const showLocateButtonWithAnimation = useCallback(() => {
        if (!showLocateButton) {
            setShowLocateButton(true);
            Animated.timing(locateButtonOpacity, {
                toValue: 1,
                duration: ANIMATION_DURATION,
                useNativeDriver: true,
            }).start();
        }
    }, [showLocateButton, locateButtonOpacity]);

    // 隐藏定位按钮
    const hideLocateButtonWithAnimation = useCallback(() => {
        if (showLocateButton) {
            Animated.timing(locateButtonOpacity, {
                toValue: 0,
                duration: ANIMATION_DURATION,
                useNativeDriver: true,
            }).start(() => {
                setShowLocateButton(false);
            });
        }
    }, [showLocateButton, locateButtonOpacity]);

    // 开始滚动时显示定位按钮
    const handleScrollBeginDrag = useCallback(() => {
        setIsScrolling(true);

        // 只有在有当前播放歌曲且列表不为空时才显示定位按钮 todo 歌单也要是当前的？
        if (currentPlayingMusic && musicList?.length) {
            showLocateButtonWithAnimation();
        }

        clearHideTimer();
    }, [currentPlayingMusic, musicList, showLocateButtonWithAnimation, clearHideTimer]);

    // 滚动结束时设置隐藏定时器
    const handleScrollEndDrag = useCallback(() => {
        setIsScrolling(false);

        // 只有在显示定位按钮时才设置隐藏定时器
        if (showLocateButton) {
            setHideTimer();
        }
    }, [showLocateButton, setHideTimer]);

    // 滚动动量结束时也设置隐藏定时器
    const handleMomentumScrollEnd = useCallback(() => {
        setIsScrolling(false);

        if (showLocateButton) {
            setHideTimer();
        }
    }, [showLocateButton, setHideTimer]);

    // 定位到当前播放歌曲
    const locateCurrentSong = useCallback(() => {
        if (!currentPlayingMusic || !musicList?.length || !flashListRef.current) {
            return;
        }

        // 根据平台和ID找到当前播放歌曲在列表中的下标 todo 换项目里有类似算法优化的实现 或者 做一个歌单删除后同步播放列表
        const currentIndex = musicList.findIndex(item =>
            (item.platform + item.id) === (currentPlayingMusic.platform + currentPlayingMusic.id)
        );

        if (currentIndex !== -1) {
            try {
                flashListRef.current.scrollToIndex({
                    index: currentIndex,
                    viewPosition: 0, // 显示在列表顶部
                    animated: true,
                });
            } catch (error) {
                console.warn('Failed to scroll to index:', error);
                // 备用方案：使用 scrollToOffset
                try {
                    flashListRef.current.scrollToOffset({
                        offset: currentIndex * ITEM_HEIGHT,
                        animated: true,
                    });
                } catch (offsetError) {
                    console.warn('Failed to scroll to offset:', offsetError);
                }
            }
        }

        // 点击后立即隐藏按钮
        hideLocateButtonWithAnimation();
        clearHideTimer();
    }, [currentPlayingMusic, musicList, hideLocateButtonWithAnimation, clearHideTimer]);

    // 渲染定位按钮
    const renderLocateButton = useCallback(() => {
        if (!showLocateButton) return null;

        return (
            <Animated.View
                style={[
                    styles.locateButton,
                    {
                        opacity: locateButtonOpacity,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.locateButtonInner,
                        {backgroundColor: colors.textHighlight || '#FF6B35'}
                    ]}
                    onPress={locateCurrentSong}
                    activeOpacity={0.7}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                    <Icon
                        name="navigation"
                        size={rpx(32)}
                        color="#FFF"
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    }, [showLocateButton, locateButtonOpacity, colors.textHighlight, locateCurrentSong]);

    return (
        <View style={styles.container}>
            <FlashList
                ListHeaderComponent={Header}
                ListEmptyComponent={<ListEmpty state={state} onRetry={onRetry}/>}
                ListFooterComponent={
                    musicList?.length ? <ListFooter state={state} onRetry={onRetry}/> : null
                }
                data={musicList ?? []}
                // keyExtractor={keyExtractor}
                estimatedItemSize={ITEM_HEIGHT}
                ref={flashListRef}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                renderItem={({index, item: musicItem}) => {
                    // const isCurrentPlaying = currentPlayingId &&
                    // musicItem.id === currentPlayingId &&
                    // musicItem.platform === TrackPlayer.getCurrentPlatform?.();
                    // const isCurrentPlaying=(musicItem.platform+musicItem.id) === currentPlayingId
                    // const isCurrentPlaying=(musicItem.platform+musicItem.id) === (currentPlayingMusic.platform+currentPlayingMusic.id)


                    return (
                        <MusicItem
                            musicItem={musicItem}
                            index={showIndex ? index + 1 : undefined}
                            // isCurrentPlaying={isCurrentPlaying}
                            onItemPress={() => {
                                if (onItemPress) {
                                    onItemPress(musicItem, musicList);
                                } else {
                                    TrackPlayer.playWithReplacePlayList(
                                        musicItem,
                                        musicList ?? [musicItem],
                                    );
                                }
                            }}
                            musicSheet={musicSheet}
                        />
                    );
                }}
                onEndReached={() => {
                    if (state === RequestStateCode.IDLE || state === RequestStateCode.PARTLY_DONE) {
                        onLoadMore?.();
                    }
                }}
                onEndReachedThreshold={0.1}
                // 优化性能 todo ???
                removeClippedSubviews={true}
                keyExtractor={(item, index) => `${item.platform}-${item.id}`}
                getItemType={() => 'music-item'}
            />
            {renderLocateButton()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    locateButton: {
        position: 'absolute',
        right: rpx(32),
        bottom: rpx(120),
        zIndex: 1000,
    },
    locateButtonInner: {
        width: rpx(96),
        height: rpx(96),
        borderRadius: rpx(48),
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
});