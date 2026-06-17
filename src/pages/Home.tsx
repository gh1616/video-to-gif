import { Link } from 'react-router-dom';
import { Video, Image, Play, Zap, Shield } from 'lucide-react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <Video size={48} />
          </div>
          <h1>视频/图片转GIF</h1>
          <p>免费、高效、安全的在线GIF生成工具</p>
        </div>
      </section>

      <section className="tools-section">
        <div className="tool-category">
          <div className="tools-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto' }}>
            <Link to="/video-to-gif" className="tool-card" style={{ justifyContent: 'flex-start', padding: '32px' }}>
              <div className="tool-icon" style={{ width: '72px', height: '72px' }}>
                <Play size={40} />
              </div>
              <div className="tool-info">
                <h3>视频/图片转GIF</h3>
                <p>将视频或多张图片转换为GIF动图，支持自定义帧率、尺寸等参数</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>功能特点</h2>
        <div className="features-grid">
          <div className="feature">
            <Zap size={24} />
            <h3>视频转GIF</h3>
            <p>从视频中截取片段，转换为GIF动图</p>
          </div>
          <div className="feature">
            <Image size={24} />
            <h3>图片转GIF</h3>
            <p>将多张图片按顺序合成GIF动画</p>
          </div>
          <div className="feature">
            <Shield size={24} />
            <h3>隐私安全</h3>
            <p>文件仅在本地浏览器处理，不上传服务器</p>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ marginTop: '24px' }}>
        <h2>使用帮助</h2>
        <div style={{ textAlign: 'left', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary)' }}>1. 选择来源</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>选择"视频转GIF"或"图片转GIF"模式</p>
          </div>
          <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary)' }}>2. 上传文件</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>视频支持MP4、WebM等格式；图片支持PNG、JPG、WebP等格式</p>
          </div>
          <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary)' }}>3. 调整参数</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>设置帧率、输出尺寸、质量等参数</p>
          </div>
          <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary)' }}>4. 生成并下载</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>点击生成按钮，等待转换完成，即可预览和下载GIF</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;