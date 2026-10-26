import { extractPlaylistId, extractYouTubeId, db } from './db';

export interface YouTubePlaylistItem {
  videoId: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration?: string;
  position: number;
}

export interface YouTubePlaylistResult {
  playlistId: string;
  title: string;
  description: string;
  channelTitle?: string;
  itemCount: number;
  items: YouTubePlaylistItem[];
  source: 'api' | 'innertube' | 'scraper' | 'single';
}

export async function fetchYouTubePlaylist(urlOrId: string): Promise<YouTubePlaylistResult> {
  const trimmed = (urlOrId || '').trim();
  if (!trimmed) {
    throw new Error('Please enter a YouTube playlist URL or ID.');
  }

  const playlistId = extractPlaylistId(trimmed);

  // If not a playlist URL, check if it's a single video URL
  if (!playlistId) {
    const singleVideoId = extractYouTubeId(trimmed);
    if (singleVideoId) {
      return await fetchSingleVideoAsPlaylist(singleVideoId);
    }
    throw new Error('Invalid YouTube Playlist or Video URL. Please provide a valid YouTube playlist link or ID.');
  }

  const settings = db.getSettings();
  const apiKey = process.env.YOUTUBE_API_KEY || (settings.youtubeApiKeyConfigured ? process.env.YOUTUBE_API_KEY : '');

  // 1. If API key exists, attempt official YouTube Data API v3 first
  if (apiKey) {
    try {
      return await fetchViaDataApi(playlistId, apiKey);
    } catch (err) {
      console.warn('YouTube Data API error, attempting internal client extractor:', err);
    }
  }

  // 2. High-reliability Innertube JSON API
  try {
    const innertubeResult = await fetchViaInnertube(playlistId);
    if (innertubeResult && innertubeResult.items.length > 0) {
      return innertubeResult;
    }
  } catch (err: any) {
    console.warn('Innertube extractor fallback triggered:', err?.message || err);
  }

  // 3. Direct web scraping with EU/GDPR consent cookies and balanced brace parsing
  try {
    return await fetchViaDirectScraper(playlistId);
  } catch (err: any) {
    // If still failing, check if the input was actually a single video
    const fallbackVideoId = extractYouTubeId(trimmed);
    if (fallbackVideoId) {
      return await fetchSingleVideoAsPlaylist(fallbackVideoId);
    }
    throw new Error(err.message || 'Unable to load YouTube playlist. Please check that the playlist is Public or Unlisted.');
  }
}

async function fetchViaInnertube(playlistId: string): Promise<YouTubePlaylistResult> {
  const browseId = playlistId.startsWith('VL') ? playlistId : 'VL' + playlistId;
  const res = await fetch('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'X-YouTube-Client-Name': '1',
      'X-YouTube-Client-Version': '2.20240401.01.00',
      'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+478; SOCS=CAESEwgDEgk1ODE2MjgxMDYaAmVuIAEaBgiA_LyaBg;'
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240401.01.00',
          hl: 'en',
          gl: 'US'
        }
      },
      browseId
    })
  });

  if (!res.ok) {
    throw new Error(`Innertube returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const playlistTitle = data.metadata?.playlistMetadataRenderer?.title || 
                        data.header?.playlistHeaderRenderer?.title?.simpleText || 
                        'Imported YouTube Playlist';
  const playlistDesc = data.metadata?.playlistMetadataRenderer?.description || '';

  const secList = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const items: YouTubePlaylistItem[] = [];

  for (const section of secList) {
    const contents = section.itemSectionRenderer?.contents || [];
    for (const c of contents) {
      // Modern lockupViewModel
      if (c.lockupViewModel) {
        const model = c.lockupViewModel;
        const videoId = model.contentId;
        if (!videoId || videoId.length !== 11) continue;

        let title = model.metadata?.lockupMetadataViewModel?.title?.content;
        if (!title && model.rendererContext?.accessibilityContext?.label) {
          title = model.rendererContext.accessibilityContext.label;
        }
        title = title || `Lesson ${items.length + 1}`;

        items.push({
          videoId,
          title: cleanVideoTitle(title),
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          position: items.length + 1
        });
      }
      // Classic playlistVideoRenderer
      if (c.playlistVideoListRenderer?.contents) {
        for (const item of c.playlistVideoListRenderer.contents) {
          const v = item.playlistVideoRenderer;
          if (!v || !v.videoId) continue;
          const title = v.title?.runs?.[0]?.text || v.title?.simpleText || `Lesson ${items.length + 1}`;
          items.push({
            videoId: v.videoId,
            title: cleanVideoTitle(title),
            thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
            duration: v.lengthText?.simpleText,
            position: items.length + 1
          });
        }
      }
    }
  }

  if (items.length === 0) {
    throw new Error('No videos found via Innertube');
  }

  return {
    playlistId,
    title: playlistTitle,
    description: playlistDesc,
    itemCount: items.length,
    items,
    source: 'innertube'
  };
}

async function fetchSingleVideoAsPlaylist(videoId: string): Promise<YouTubePlaylistResult> {
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      return {
        playlistId: videoId,
        title: data.title || 'YouTube Video',
        description: `Imported video from channel ${data.author_name || 'YouTube'}`,
        channelTitle: data.author_name,
        itemCount: 1,
        items: [
          {
            videoId,
            title: cleanVideoTitle(data.title || 'Video Lesson'),
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            position: 1
          }
        ],
        source: 'single'
      };
    }
  } catch (err) {
    console.warn('oEmbed single video fallback error:', err);
  }

  return {
    playlistId: videoId,
    title: 'YouTube Video Lesson',
    description: 'Single imported YouTube video',
    itemCount: 1,
    items: [
      {
        videoId,
        title: 'Video Lesson',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        position: 1
      }
    ],
    source: 'single'
  };
}

async function fetchViaDataApi(playlistId: string, apiKey: string): Promise<YouTubePlaylistResult> {
  const metaRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
  );
  const metaData = await metaRes.json();
  if (!metaData.items || metaData.items.length === 0) {
    throw new Error(`YouTube API: Playlist ${playlistId} not found or is private.`);
  }

  const snippet = metaData.items[0].snippet;
  const title = snippet.title || 'Imported YouTube Playlist';
  const description = snippet.description || '';
  const channelTitle = snippet.channelTitle;

  const items: YouTubePlaylistItem[] = [];
  let pageToken = '';

  do {
    const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const itemsRes = await fetch(itemsUrl);
    const itemsData = await itemsRes.json();

    if (!itemsData.items) break;

    for (const item of itemsData.items) {
      const vid = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      if (!vid) continue;
      const vTitle = item.snippet?.title || 'Untitled Lesson';
      if (vTitle === 'Private video' || vTitle === 'Deleted video') continue;

      const thumb = item.snippet?.thumbnails?.high?.url || 
                    item.snippet?.thumbnails?.medium?.url || 
                    `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;

      items.push({
        videoId: vid,
        title: vTitle,
        description: item.snippet?.description,
        thumbnail: thumb,
        position: items.length + 1
      });
    }

    pageToken = itemsData.nextPageToken || '';
  } while (pageToken && items.length < 150);

  return {
    playlistId,
    title,
    description,
    channelTitle,
    itemCount: items.length,
    items,
    source: 'api'
  };
}

async function fetchViaDirectScraper(playlistId: string): Promise<YouTubePlaylistResult> {
  const url = `https://www.youtube.com/playlist?list=${playlistId}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+478; SOCS=CAESEwgDEgk1ODE2MjgxMDYaAmVuIAEaBgiA_LyaBg;'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to load YouTube playlist (HTTP ${res.status}). Ensure the playlist is Public or Unlisted.`);
  }

  const html = await res.text();
  let data: any = null;

  // Balanced brace extraction for ytInitialData
  const needle = 'ytInitialData = ';
  const needleIdx = html.indexOf(needle);
  if (needleIdx !== -1) {
    const start = html.indexOf('{', needleIdx);
    let depth = 0;
    let end = -1;
    for (let i = start; i < html.length; i++) {
      if (html[i] === '{') depth++;
      else if (html[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end > start) {
      try {
        data = JSON.parse(html.substring(start, end));
      } catch (e) {
        // Fallback to regex
      }
    }
  }

  if (!data) {
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData = ({.*?});/s);
    if (match) {
      try {
        data = JSON.parse(match[1]);
      } catch (err) {
        // Failed parse
      }
    }
  }

  if (!data) {
    throw new Error('Unable to parse YouTube playlist page structure. The playlist might be private, region-restricted, or removed.');
  }

  const playlistTitle = data.metadata?.playlistMetadataRenderer?.title || 
                        data.header?.playlistHeaderRenderer?.title?.simpleText || 
                        'Imported YouTube Playlist';

  const playlistDesc = data.metadata?.playlistMetadataRenderer?.description || '';

  const secList = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const items: YouTubePlaylistItem[] = [];

  for (const section of secList) {
    const contents = section.itemSectionRenderer?.contents || [];
    for (const c of contents) {
      // Modern lockupViewModel
      if (c.lockupViewModel) {
        const model = c.lockupViewModel;
        const videoId = model.contentId;
        if (!videoId || videoId.length !== 11) continue;

        let title = model.metadata?.lockupMetadataViewModel?.title?.content;
        if (!title && model.rendererContext?.accessibilityContext?.label) {
          title = model.rendererContext.accessibilityContext.label;
        }
        title = title || `Lesson ${items.length + 1}`;

        items.push({
          videoId,
          title: cleanVideoTitle(title),
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          position: items.length + 1
        });
      }
      // Classic playlistVideoRenderer
      if (c.playlistVideoListRenderer?.contents) {
        for (const item of c.playlistVideoListRenderer.contents) {
          const v = item.playlistVideoRenderer;
          if (!v || !v.videoId) continue;
          const title = v.title?.runs?.[0]?.text || v.title?.simpleText || `Lesson ${items.length + 1}`;
          items.push({
            videoId: v.videoId,
            title: cleanVideoTitle(title),
            thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
            duration: v.lengthText?.simpleText,
            position: items.length + 1
          });
        }
      }
    }
  }

  if (items.length === 0) {
    throw new Error('No videos found in this playlist. Ensure the playlist contains public videos.');
  }

  return {
    playlistId,
    title: playlistTitle,
    description: playlistDesc,
    itemCount: items.length,
    items,
    source: 'scraper'
  };
}

function cleanVideoTitle(raw: string): string {
  if (!raw) return 'Lesson';
  let title = raw.replace(/\s+\d+\s+(hour|minute|second)s?,?(\s+\d+\s+minutes?)?$/i, '').trim();
  title = title.replace(/\s*720P\s*HD\s*$/i, '').replace(/\s*1080P\s*HD\s*$/i, '').trim();
  return title;
}
