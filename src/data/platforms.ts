import type { Platform } from '../types';

export const platforms: Platform[] = [
  {
    id: 'generated-image-vertical-34',
    name: '通用封面 3:4',
    shortName: '通用 3:4',
    group: 'General',
    width: 1080,
    height: 1440,
  },
  {
    id: 'xhs-video-vertical',
    name: '小红书视频封面 竖版',
    shortName: '小红书竖版',
    group: 'Xiaohongshu',
    width: 1080,
    height: 1440,
  },
  {
    id: 'xhs-video-horizontal',
    name: '小红书视频封面 横版',
    shortName: '小红书横版',
    group: 'Xiaohongshu',
    width: 1440,
    height: 1080,
  },
  {
    id: 'douyin-video-vertical-34',
    name: '抖音视频封面 竖版 3:4',
    shortName: '抖音 3:4',
    group: 'Douyin',
    width: 1242,
    height: 1660,
  },
  {
    id: 'douyin-video-vertical-916',
    name: '抖音视频封面 竖版 9:16',
    shortName: '抖音 9:16',
    group: 'Douyin',
    width: 1080,
    height: 1920,
  },
  {
    id: 'douyin-video-horizontal',
    name: '抖音视频封面 横版',
    shortName: '抖音横版',
    group: 'Douyin',
    width: 1080,
    height: 608,
  },
  {
    id: 'wechat-channels-vertical',
    name: '视频号视频封面 竖版',
    shortName: '视频号竖版',
    group: 'WeChat Channels',
    width: 1080,
    height: 1260,
  },
  {
    id: 'wechat-channels-horizontal',
    name: '视频号视频封面 横版',
    shortName: '视频号横版',
    group: 'WeChat Channels',
    width: 1080,
    height: 608,
  },
  {
    id: 'wechat-official-cover',
    name: '微信公众号封面',
    shortName: '公众号封面',
    group: 'WeChat Official',
    width: 900,
    height: 383,
  },
];

export const defaultPlatform = platforms[0];
