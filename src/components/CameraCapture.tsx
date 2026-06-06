import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Card, Spin, message } from 'antd';
import { CameraOutlined, RotateCcwOutlined, CameraSwitchOutlined } from '@ant-design/icons';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getConstraints = useCallback(() => {
    return {
      video: {
        facingMode: isFrontCamera ? 'user' : 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };
  }, [isFrontCamera]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia(getConstraints());
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsLoading(false);
      } catch (error) {
        console.error('无法访问摄像头:', error);
        message.error('无法访问摄像头，请检查权限设置');
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [getConstraints]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.png`, {
          type: 'image/png',
        });
        onCapture(file);
      } else {
        message.error('拍照失败');
      }
      setIsCapturing(false);
    }, 'image/png', 0.9);
  };

  const handleSwitchCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsFrontCamera(prev => !prev);
  };

  const handleRetry = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getConstraints());
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLoading(false);
    } catch (error) {
      console.error('无法访问摄像头:', error);
      message.error('无法访问摄像头');
      setIsLoading(false);
    }
  };

  return (
    <Card
      title="拍照识别"
      extra={
        <Button
          type="text"
          icon={<RotateCcwOutlined />}
          onClick={onCancel}
        >
          返回
        </Button>
      }
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ aspectRatio: '4/3', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Spin size="large" tip="正在启动摄像头..." />
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
          <Button
            type="default"
            icon={<CameraSwitchOutlined />}
            onClick={handleSwitchCamera}
            disabled={isLoading || isCapturing}
          >
            切换镜头
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CameraOutlined />}
            onClick={handleCapture}
            loading={isCapturing}
            disabled={isLoading}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          />
          <Button
            type="default"
            icon={<RotateCcwOutlined />}
            onClick={handleRetry}
            disabled={isLoading || isCapturing}
          >
            重试
          </Button>
        </div>

        <p style={{ textAlign: 'center', color: '#999', fontSize: '12px', marginTop: '16px' }}>
          点击圆形按钮拍照
        </p>
      </div>
    </Card>
  );
};

export default CameraCapture;