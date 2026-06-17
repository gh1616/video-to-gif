import { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Play, Download, Loader2, RotateCcw, Settings, Video } from 'lucide-react';
// @ts-ignore
import GIF from 'gif.js';
import './VideoToGif.css';

interface VideoInfo {
  name: string;
  duration: number;
  width: number;
  height: number;
}

function VideoToGif() {
  // 视频相关状态
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  // 公共状态
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [gifUrl, setGifUrl] = useState<string>('');
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  
  // 参数设置
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [quality, setQuality] = useState(10);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 点击按钮时直接打开文件选择器
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 处理视频文件
    const file = files[0];
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);
    setGifUrl('');
    setGifBlob(null);
    setProgress(0);
    
    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  };

  // 视频加载完成后的处理
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      setVideoInfo({
        name: videoFile?.name || 'video',
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      
      setStartTime(0);
      setEndTime(Math.min(10, video.duration));
      
      const maxWidth = 640;
      if (video.videoWidth > maxWidth) {
        setWidth(maxWidth);
      } else {
        setWidth(video.videoWidth);
      }
    }
  };

  // 处理时间输入变化
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 允许空字符串，表示用户正在删除
    if (value === '') {
      // 不更新状态，让用户可以继续删除
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setStartTime(num);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 允许空字符串，表示用户正在删除
    if (value === '') {
      // 不更新状态，让用户可以继续删除
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setEndTime(Math.min(videoInfo?.duration || 999, num));
    }
  };

  // 失去焦点时确保值有效
  const handleStartTimeBlur = () => {
    if (startTime < 0 || isNaN(startTime)) {
      setStartTime(0);
    }
  };

  const handleEndTimeBlur = () => {
    if (endTime < 0 || isNaN(endTime) || !videoInfo) {
      setEndTime(videoInfo?.duration || 10);
    } else if (endTime > videoInfo.duration) {
      setEndTime(videoInfo.duration);
    }
    if (endTime <= startTime) {
      setEndTime(Math.min(startTime + 0.1, videoInfo?.duration || 10));
    }
  };

  // 生成GIF
  const generateGif = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setGenerating(true);
    setProgress(0);
    setProgressText('正在初始化...');
    setGifUrl('');
    setGifBlob(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const duration = endTime - startTime;
      const frameCount = Math.floor(duration * fps);
      const frameInterval = 1 / fps;

      if (frameCount <= 0) {
        setProgressText('请选择有效的时间范围');
        setGenerating(false);
        return;
      }

      const aspectRatio = video.videoHeight / video.videoWidth;
      const outputHeight = Math.round(width * aspectRatio);
      
      canvas.width = width;
      canvas.height = outputHeight;

      // @ts-ignore
      const gif = new GIF({
        workers: 2,
        quality: quality,
        width: width,
        height: outputHeight,
        workerScript: '/gif.worker.js'
      });

      video.currentTime = startTime;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });

      for (let i = 0; i < frameCount; i++) {
        const currentTime = startTime + i * frameInterval;
        
        video.currentTime = currentTime;
        
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
        });

        ctx.drawImage(video, 0, 0, width, outputHeight);
        
        const delay = Math.round(1000 / fps);
        gif.addFrame(ctx, { copy: true, delay });
        
        const currentProgress = Math.round(((i + 1) / frameCount) * 80);
        setProgress(currentProgress);
        setProgressText(`正在提取帧: ${i + 1}/${frameCount}`);
      }

      setProgressText('正在生成GIF...');
      
      await new Promise<void>((resolve) => {
        gif.on('finished', (blob: Blob) => {
          setGifBlob(blob);
          setGifUrl(URL.createObjectURL(blob));
          setProgress(100);
          setProgressText('生成完成!');
          setGenerating(false);
          resolve();
        });
        
        gif.on('progress', (p: number) => {
          const generateProgress = Math.round(80 + p * 20);
          setProgress(generateProgress);
        });
        
        gif.render();
      });

    } catch (error) {
      console.error('生成GIF失败:', error);
      setProgressText('生成失败，请重试');
      setGenerating(false);
    }
  };

  const downloadGif = () => {
    if (gifBlob) {
      const fileName = videoFile?.name.replace(/\.[^/.]+$/, '') || 'video';
      saveAs(gifBlob, `${fileName}.gif`);
    }
  };

  const reset = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
    }
    setVideoFile(null);
    setVideoUrl('');
    setVideoInfo(null);
    setGifUrl('');
    setGifBlob(null);
    setProgress(0);
    setStartTime(0);
    setEndTime(10);
  };

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, []);

  return (
    <div className="tool-page">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div className="tool-header">
        <h1>视频转GIF</h1>
        <p>将视频转换为GIF动图</p>
      </div>

      {/* 主要操作按钮 - 点击直接打开文件选择器 */}
      {!videoUrl && (
        <div className="main-actions">
          <button 
            className="main-action-btn video-btn active"
            onClick={handleSelectFile}
          >
            <Video size={32} />
            <span className="btn-title">视频转GIF</span>
            <span className="btn-desc">点击选择视频文件</span>
          </button>
        </div>
      )}

      {/* 视频预览和控制区域 */}
      {videoUrl && (
        <div className="video-preview-container">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={handleVideoLoaded}
              controls
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div className="settings-panel">
            <div className="settings-title">
              <Settings size={18} />
              <span>参数设置</span>
            </div>

            <div className="settings-group">
              <label>时间范围 (秒)</label>
              <div className="time-inputs">
                <div className="time-input">
                  <span>开始</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={startTime}
                    onChange={handleStartTimeChange}
                    onBlur={handleStartTimeBlur}
                    placeholder="0"
                    disabled={generating}
                  />
                </div>
                <div className="time-input">
                  <span>结束</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={endTime}
                    onChange={handleEndTimeChange}
                    onBlur={handleEndTimeBlur}
                    placeholder={videoInfo ? videoInfo.duration.toFixed(1) : '10'}
                    disabled={generating}
                  />
                </div>
              </div>
              <div className="time-duration">
                时长: {videoInfo ? Math.max(0, Math.min(endTime, videoInfo.duration) - startTime).toFixed(1) : Math.max(0, endTime - startTime).toFixed(1)} 秒
              </div>
            </div>

            <div className="settings-group">
              <label>帧率 (FPS): {fps}</label>
              <input
                type="range"
                min="1"
                max="30"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                disabled={generating}
              />
              <div className="range-labels">
                <span>1</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>

            <div className="settings-group">
              <label>输出宽度: {width}px</label>
              <input
                type="range"
                min="100"
                max="800"
                step="50"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                disabled={generating}
              />
              <div className="range-labels">
                <span>100px</span>
                <span>450px</span>
                <span>800px</span>
              </div>
            </div>

            <div className="settings-group">
              <label>质量: {quality} (数值越低质量越高)</label>
              <input
                type="range"
                min="1"
                max="30"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                disabled={generating}
              />
              <div className="range-labels">
                <span>高质量</span>
                <span>15</span>
                <span>低质量</span>
              </div>
            </div>

            {videoInfo && (
              <div className="预估-info">
                <div>视频信息: {videoInfo.width}x{videoInfo.height}, {videoInfo.duration.toFixed(1)}秒</div>
                <div>预计帧数: {Math.floor(Math.max(0, endTime - startTime) * fps)} 帧</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {videoUrl && (
        <div className="action-buttons">
          <button
            className="primary-btn"
            onClick={generateGif}
            disabled={generating || !videoInfo}
          >
            {generating ? (
              <>
                <Loader2 className="spin" size={20} />
                生成中...
              </>
            ) : (
              <>
                <Play size={20} />
                生成GIF
              </>
            )}
          </button>
          
          <button
            className="secondary-btn"
            onClick={reset}
            disabled={generating}
          >
            <RotateCcw size={18} />
            重新选择
          </button>
        </div>
      )}

      {/* 进度条 */}
      {generating && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">{progressText}</div>
          <div className="progress-percent">{progress}%</div>
        </div>
      )}

      {/* GIF预览 */}
      {gifUrl && (
        <div className="gif-preview">
          <div className="preview-title">预览结果</div>
          <div className="preview-image">
            <img src={gifUrl} alt="Generated GIF" />
          </div>
          <button className="primary-btn download-btn" onClick={downloadGif}>
            <Download size={20} />
            下载GIF
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoToGif;