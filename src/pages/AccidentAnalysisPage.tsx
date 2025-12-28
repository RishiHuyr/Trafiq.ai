import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
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
  Loader2,
  Download,
} from 'lucide-react';

interface SecondaryFactor {
  factor: string;
  confidence: number;
  description: string;
}

interface DetectedVehicle {
  type: string;
  position: string;
  speed_estimate: string;
  behavior: string;
}

interface SpeedPattern {
  vehicle: string;
  estimated_speed: string;
  speed_limit: string;
  violation: boolean;
}

interface BehaviorDetected {
  behavior: string;
  severity: string;
  timestamp_estimate: string;
}

interface TimelineEvent {
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PreventionRecommendation {
  title: string;
  description: string;
  priority: string;
}

interface AnalysisData {
  primary_cause: string;
  primary_cause_confidence: number;
  secondary_factors: SecondaryFactor[];
  detected_vehicles: DetectedVehicle[];
  speed_patterns: SpeedPattern[];
  behaviors_detected: BehaviorDetected[];
  timeline_events: TimelineEvent[];
  ai_insights: string;
  prevention_recommendations: PreventionRecommendation[];
}

interface KeyFrame {
  id: string;
  timestamp: number;
  thumbnail: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export default function AccidentAnalysisPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [keyFrames, setKeyFrames] = useState<KeyFrame[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysisComplete(false);
      setAnalysisProgress(0);
      setAnalysisData(null);
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
      setAnalysisData(null);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!videoFile) return;

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Authentication required', { description: 'Please login to analyze videos' });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Progress animation
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 8 + 2;
      });
    }, 300);

    try {
      // First create a record in the database with user_id
      const { data: insertData, error: insertError } = await supabase
        .from('video_analyses')
        .insert({
          user_id: user.id,
          video_name: videoFile.name,
          video_size: videoFile.size,
          video_type: videoFile.type,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create analysis record:', insertError);
        throw new Error('Failed to start analysis');
      }

      // Call the AI analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: {
          videoName: videoFile.name,
          videoSize: videoFile.size,
          videoType: videoFile.type,
          analysisId: insertData.id,
        },
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisProgress(100);
      setAnalysisData(data.analysis);

      // Generate key frames from timeline events
      const frames: KeyFrame[] = data.analysis.timeline_events
        .filter((e: TimelineEvent) => e.severity === 'high' || e.severity === 'critical')
        .slice(-4)
        .map((event: TimelineEvent, index: number) => ({
          id: `kf-${index}`,
          timestamp: parseFloat(event.timestamp.replace(':', '.')) || index * 2,
          thumbnail: '',
          description: event.event,
          riskLevel: event.severity,
        }));
      setKeyFrames(frames);

      setAnalysisComplete(true);
      toast.success('AI analysis complete!', {
        description: `Primary cause: ${data.analysis.primary_cause}`,
      });

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Analysis failed:', error);
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      setAnalysisProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoFile]);

  const clearVideo = useCallback(() => {
    setVideoFile(null);
    setVideoUrl(null);
    setAnalysisComplete(false);
    setAnalysisProgress(0);
    setAnalysisData(null);
    setKeyFrames([]);
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

  const generatePDFReport = useCallback(() => {
    if (!analysisData || !videoFile) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // Helper function for text wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, x, y);
        y += lineHeight;
      });
      return y;
    };

    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246);
    pdf.text('TRAFIQ.AI', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Accident Video Analysis Report', 20, yPos);
    yPos += 15;

    // Disclaimer
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    yPos = addWrappedText(
      'DISCLAIMER: This is an AI-assisted analysis for awareness and safety improvement purposes only. No automated blame or enforcement. All findings are educational.',
      20, yPos, pageWidth - 40, 5
    );
    yPos += 10;

    // Video Info
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Video Information', 20, yPos);
    yPos += 7;
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`File: ${videoFile.name}`, 25, yPos);
    yPos += 5;
    pdf.text(`Size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB`, 25, yPos);
    yPos += 5;
    pdf.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 25, yPos);
    yPos += 12;

    // Primary Cause Section
    pdf.setFontSize(14);
    pdf.setTextColor(220, 38, 38);
    pdf.text('PRIMARY ACCIDENT CAUSE', 20, yPos);
    yPos += 8;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${analysisData.primary_cause} (${analysisData.primary_cause_confidence}% confidence)`, 20, yPos);
    yPos += 12;

    // Secondary Factors
    if (analysisData.secondary_factors?.length > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Contributing Factors', 20, yPos);
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      analysisData.secondary_factors.forEach((factor) => {
        pdf.text(`• ${factor.factor} (${factor.confidence}%)`, 25, yPos);
        yPos += 5;
        yPos = addWrappedText(`  ${factor.description}`, 25, yPos, pageWidth - 50, 5);
        yPos += 3;
      });
      yPos += 7;
    }

    // Timeline Events
    if (analysisData.timeline_events?.length > 0) {
      if (yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Event Timeline', 20, yPos);
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      analysisData.timeline_events.forEach((event) => {
        const severityColor = event.severity === 'critical' ? [220, 38, 38] : 
                              event.severity === 'high' ? [234, 88, 12] :
                              event.severity === 'medium' ? [234, 179, 8] : [34, 197, 94];
        pdf.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
        pdf.text(`[${event.timestamp}] ${event.severity.toUpperCase()}`, 25, yPos);
        pdf.setTextColor(60, 60, 60);
        yPos += 5;
        yPos = addWrappedText(`  ${event.event}`, 25, yPos, pageWidth - 50, 5);
        yPos += 3;
      });
      yPos += 7;
    }

    // AI Insights
    if (analysisData.ai_insights) {
      if (yPos > 180) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('AI Analysis Summary', 20, yPos);
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      yPos = addWrappedText(analysisData.ai_insights, 20, yPos, pageWidth - 40, 5);
      yPos += 10;
    }

    // Prevention Recommendations
    if (analysisData.prevention_recommendations?.length > 0) {
      if (yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFontSize(14);
      pdf.setTextColor(34, 197, 94);
      pdf.text('Prevention Recommendations', 20, yPos);
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      analysisData.prevention_recommendations.forEach((rec, index) => {
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${index + 1}. ${rec.title} [${rec.priority}]`, 25, yPos);
        yPos += 5;
        pdf.setTextColor(60, 60, 60);
        yPos = addWrappedText(`   ${rec.description}`, 25, yPos, pageWidth - 50, 5);
        yPos += 5;
      });
    }

    // Footer
    const pageCount = pdf.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated by TRAFIQ.AI - Page ${i} of ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
    }

    // Save PDF
    const fileName = `TRAFIQ_Analysis_${videoFile.name.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    toast.success('Report downloaded!', { description: fileName });
  }, [analysisData, videoFile]);


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
        {/* Ethical Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground">AI-Assisted Analysis • For Awareness Only</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This tool provides AI-generated insights to help understand accident patterns and improve road safety. 
                <span className="text-primary font-medium"> No automated blame or enforcement</span> — all findings are for educational and safety improvement purposes only.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              Accident Video Analysis
            </h1>
            <p className="text-muted-foreground mt-1">
              Powered by Lovable AI — Computer vision & behavior analysis
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {analysisComplete && analysisData && (
              <Button variant="outline" size="sm" onClick={generatePDFReport} className="gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            )}
            <Badge variant="outline" className="gap-1 bg-card/50">
              <Shield className="w-3 h-3" />
              Human-in-the-Loop
            </Badge>
            <Badge variant="outline" className="gap-1 bg-card/50">
              <Eye className="w-3 h-3" />
              Privacy-First
            </Badge>
            <Badge variant="outline" className="gap-1 bg-card/50">
              <AlertCircle className="w-3 h-3" />
              Explanation-First
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
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            AI Analyzing Video...
                          </h3>
                          <p className="text-muted-foreground text-sm mb-6 text-center max-w-sm">
                            Lovable AI is detecting vehicles, speed patterns, lane changes, and risky behaviors
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
                    {analysisComplete && analysisData && (
                      <div className="absolute inset-0 pointer-events-none">
                        {analysisData.detected_vehicles.slice(0, 2).map((vehicle, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`absolute border-2 rounded ${
                              vehicle.speed_estimate === 'Very High' || vehicle.speed_estimate === 'High'
                                ? 'border-destructive'
                                : 'border-warning'
                            }`}
                            style={{ 
                              left: `${25 + index * 25}%`, 
                              top: `${35 + index * 10}%`, 
                              width: `${15 - index * 3}%`, 
                              height: `${20 - index * 2}%` 
                            }}
                          >
                            <div className={`absolute -top-6 left-0 text-[10px] px-2 py-0.5 rounded ${
                              vehicle.speed_estimate === 'Very High' || vehicle.speed_estimate === 'High'
                                ? 'bg-destructive/90 text-destructive-foreground'
                                : 'bg-warning/90 text-warning-foreground'
                            }`}>
                              {vehicle.type} - {vehicle.speed_estimate}
                            </div>
                          </motion.div>
                        ))}
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
            {analysisComplete && keyFrames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Key Events Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

            {/* AI Insights Paragraph */}
            {analysisComplete && analysisData?.ai_insights && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      AI Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {analysisData.ai_insights}
                    </p>
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
                    ) : isAnalyzing ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <Brain className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {analysisComplete ? 'Analysis Complete' : isAnalyzing ? 'Processing...' : 'Ready to Analyze'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {analysisComplete && analysisData 
                        ? `${analysisData.timeline_events?.length || 0} events detected` 
                        : 'Upload a video to begin'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Cause */}
            {analysisComplete && analysisData && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Primary Accident Cause
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">{analysisData.primary_cause}</span>
                      <Badge variant="destructive" className="text-xs">
                        {analysisData.primary_cause_confidence}% confident
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisData.primary_cause_confidence}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="h-full bg-destructive"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detected Events Timeline */}
            {analysisComplete && analysisData?.timeline_events && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Event Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[250px] overflow-y-auto">
                  {analysisData.timeline_events.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          event.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                          event.severity === 'high' ? 'bg-destructive/15 text-destructive' :
                          event.severity === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-success/20 text-success'
                        }`}>
                          {getTypeIcon(event.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              {event.timestamp}
                            </span>
                            <Badge variant={getSeverityColor(event.severity)} className="text-[9px]">
                              {event.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground line-clamp-2">
                            {event.event}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Secondary Factors */}
            {analysisComplete && analysisData?.secondary_factors && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Contributing Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisData.secondary_factors.map((factor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{factor.factor}</span>
                        <Badge variant="default" className="text-[10px]">
                          {factor.confidence}%
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.confidence}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{factor.description}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Prevention Recommendations */}
            {analysisComplete && analysisData?.prevention_recommendations && (
              <Card className="border-success/20 bg-success/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    Prevention Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisData.prevention_recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{rec.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{rec.description}</p>
                      </div>
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
