import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  AlertTriangle,
  Brain,
  Video,
  Clock,
  Shield,
  Eye,
  TrendingUp,
  ChevronRight,
  FileVideo,
  X,
  CheckCircle,
  AlertCircle,
  Zap,
  Car,
  Gauge,
  MapPin,
} from 'lucide-react';

interface AnalysisResult {
  id: string;
  timestamp: number;
  type: 'vehicle' | 'speed' | 'lane' | 'signal' | 'visibility' | 'behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}

interface KeyFrame {
  id: string;
  timestamp: number;
  thumbnail: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface AccidentCause {
  id: string;
  cause: string;
  confidence: number;
  contributing: string[];
  prevention: string;
}

export default function AccidentAnalysisPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated analysis results
  const [analysisResults] = useState<AnalysisResult[]>([
    { id: 'ar-1', timestamp: 2.3, type: 'speed', severity: 'high', description: 'Vehicle 1 exceeding speed limit by 25 km/h', confidence: 94 },
    { id: 'ar-2', timestamp: 3.1, type: 'lane', severity: 'medium', description: 'Unsafe lane change without signal', confidence: 88 },
    { id: 'ar-3', timestamp: 4.5, type: 'behavior', severity: 'critical', description: 'Aggressive acceleration detected', confidence: 91 },
    { id: 'ar-4', timestamp: 5.2, type: 'visibility', severity: 'medium', description: 'Reduced visibility due to weather conditions', confidence: 82 },
    { id: 'ar-5', timestamp: 6.8, type: 'signal', severity: 'high', description: 'Vehicle entered intersection during amber signal', confidence: 96 },
    { id: 'ar-6', timestamp: 8.1, type: 'vehicle', severity: 'critical', description: 'Insufficient following distance - 0.8 seconds', confidence: 93 },
  ]);

  const [keyFrames] = useState<KeyFrame[]>([
    { id: 'kf-1', timestamp: 4.5, thumbnail: '', description: 'Aggressive acceleration begins', riskLevel: 'high' },
    { id: 'kf-2', timestamp: 6.8, thumbnail: '', description: 'Signal violation occurs', riskLevel: 'critical' },
    { id: 'kf-3', timestamp: 7.9, thumbnail: '', description: 'Collision imminent - braking initiated', riskLevel: 'critical' },
    { id: 'kf-4', timestamp: 8.1, thumbnail: '', description: 'Impact moment', riskLevel: 'critical' },
  ]);

  const [accidentCauses] = useState<AccidentCause[]>([
    {
      id: 'ac-1',
      cause: 'Excessive Speed',
      confidence: 94,
      contributing: ['Poor weather visibility', 'Aggressive driving behavior'],
      prevention: 'Implementing dynamic speed limits during adverse weather conditions and enhanced speed monitoring',
    },
    {
      id: 'ac-2',
      cause: 'Signal Violation',
      confidence: 91,
      contributing: ['Rushing to beat amber light', 'Distracted driving suspected'],
      prevention: 'Extended amber signal duration at this intersection and red-light cameras',
    },
    {
      id: 'ac-3',
      cause: 'Insufficient Following Distance',
      confidence: 89,
      contributing: ['High traffic density', 'Sudden braking of lead vehicle'],
      prevention: 'AI-powered congestion warnings and adaptive cruise control advisories',
    },
  ]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysisComplete(false);
      setAnalysisProgress(0);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysisComplete(false);
      setAnalysisProgress(0);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate AI analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 200);
  }, []);

  const clearVideo = useCallback(() => {
    setVideoFile(null);
    setVideoUrl(null);
    setAnalysisComplete(false);
    setAnalysisProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const seekToTimestamp = useCallback((timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'riskCritical';
      case 'high': return 'riskHigh';
      case 'medium': return 'riskMedium';
      default: return 'riskLow';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speed': return <Gauge className="w-4 h-4" />;
      case 'lane': return <MapPin className="w-4 h-4" />;
      case 'vehicle': return <Car className="w-4 h-4" />;
      case 'signal': return <AlertTriangle className="w-4 h-4" />;
      case 'visibility': return <Eye className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              Accident Cause Analysis
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered video analysis to identify accident causes and prevention insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Shield className="w-3 h-3" />
              Human-in-the-Loop
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Eye className="w-3 h-3" />
              No Facial Recognition
            </Badge>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Upload & Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {!videoFile ? (
              /* Upload Zone */
              <Card className="border-dashed border-2 border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-[400px] cursor-pointer"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Upload Traffic or Accident Video
                    </h3>
                    <p className="text-muted-foreground text-sm text-center max-w-md mb-4">
                      Drag and drop your video file here, or click to browse.
                      Supports MP4, MOV, AVI formats.
                    </p>
                    <Button variant="glow">
                      <FileVideo className="w-4 h-4 mr-2" />
                      Select Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Video Player */
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative bg-black">
                    <video
                      ref={videoRef}
                      src={videoUrl || undefined}
                      className="w-full h-[400px] object-contain"
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    />
                    
                    {/* Analysis Overlay */}
                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center"
                        >
                          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                            <Brain className="w-10 h-10 text-primary animate-pulse" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Analyzing Video...
                          </h3>
                          <p className="text-muted-foreground text-sm mb-6">
                            AI is detecting vehicles, patterns, and risky behaviors
                          </p>
                          <div className="w-64">
                            <Progress value={analysisProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-center mt-2">
                              {Math.round(analysisProgress)}% complete
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Detection Overlays (when analysis complete) */}
                    {analysisComplete && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Simulated detection boxes */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute border-2 border-destructive rounded"
                          style={{ left: '30%', top: '40%', width: '15%', height: '20%' }}
                        >
                          <div className="absolute -top-6 left-0 bg-destructive/90 text-destructive-foreground text-[10px] px-2 py-0.5 rounded">
                            Vehicle 1 - High Risk
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="absolute border-2 border-warning rounded"
                          style={{ left: '55%', top: '45%', width: '12%', height: '18%' }}
                        >
                          <div className="absolute -top-6 left-0 bg-warning/90 text-warning-foreground text-[10px] px-2 py-0.5 rounded">
                            Vehicle 2 - Moderate
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center gap-3">
                        <Button variant="glass" size="sm" onClick={() => seekToTimestamp(currentTime - 5)}>
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button variant="glass" size="sm" onClick={togglePlayPause}>
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button variant="glass" size="sm" onClick={() => seekToTimestamp(currentTime + 5)}>
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 mx-4">
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-white font-mono">
                          {currentTime.toFixed(1)}s
                        </span>
                        <Button variant="glass" size="sm" onClick={clearVideo}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                        <Video className="w-3 h-3 mr-1" />
                        {videoFile.name}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {videoFile && !analysisComplete && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button variant="glow" size="lg" onClick={startAnalysis} className="w-full">
                  <Brain className="w-5 h-5 mr-2" />
                  Start AI Analysis
                </Button>
              </motion.div>
            )}

            {/* Key Frames */}
            {analysisComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Key Frames Before Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {keyFrames.map((frame, index) => (
                        <motion.div
                          key={frame.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          onClick={() => seekToTimestamp(frame.timestamp)}
                          className="cursor-pointer group"
                        >
                          <div className="relative aspect-video rounded-lg bg-muted overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <Badge variant={getSeverityColor(frame.riskLevel)} className="text-[9px] px-1.5 py-0">
                                {frame.timestamp.toFixed(1)}s
                              </Badge>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                            {frame.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Analysis Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Analysis Status */}
            <Card className={analysisComplete ? 'border-success/30' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    analysisComplete ? 'bg-success/20' : 'bg-muted'
                  }`}>
                    {analysisComplete ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Brain className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {analysisComplete ? 'Analysis Complete' : 'Ready to Analyze'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {analysisComplete ? `${analysisResults.length} events detected` : 'Upload a video to begin'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detected Events Timeline */}
            {analysisComplete && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Detected Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {analysisResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      onClick={() => seekToTimestamp(result.timestamp)}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          result.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                          result.severity === 'high' ? 'bg-destructive/15 text-destructive' :
                          result.severity === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-success/20 text-success'
                        }`}>
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              {result.timestamp.toFixed(1)}s
                            </span>
                            <Badge variant={getSeverityColor(result.severity)} className="text-[9px]">
                              {result.confidence}%
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground line-clamp-2">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Insights - Accident Causes */}
            {analysisComplete && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    AI-Identified Causes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accidentCauses.map((cause, index) => (
                    <motion.div
                      key={cause.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{cause.cause}</span>
                        <Badge variant="default" className="text-[10px]">
                          {cause.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cause.confidence}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">Contributing factors:</p>
                        {cause.contributing.map((factor, i) => (
                          <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <ChevronRight className="w-3 h-3" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Prevention Recommendations */}
            {analysisComplete && (
              <Card className="border-success/20 bg-success/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    Prevention Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {accidentCauses.map((cause, index) => (
                    <motion.div
                      key={`prev-${cause.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{cause.prevention}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
