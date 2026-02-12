"use client";

import { analyzeImage, saveItem } from "@/app/actions/scan-item"; // Import server actions
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Camera, Upload, Settings, RefreshCcw, Zap, Memory, Science, Info, Trash2 } from "@/components/icons";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Types
type ReeItem = { name: string; value: string; percentage: number; color?: string };
type GradingResult = {
  id: string;
  classification: string;
  grade: string;
  condition: string;
  weight?: string;
  estimatedValue: string;
  reeContent: ReeItem[];
  image_url: string;
};

export default function ScanPage() {
  const router = useRouter(); // For redirection after save
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Session State
  const [currentSessionImages, setCurrentSessionImages] = useState<{ file: File, preview: string }[]>([]);
  const [batchItems, setBatchItems] = useState<GradingResult[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Computed
  const hasImages = currentSessionImages.length > 0;
  const batchCount = batchItems.length;
  const activeImage = currentSessionImages[previewIndex] || currentSessionImages[currentSessionImages.length - 1];

  // Ref for scrolling to new items
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Auto-switch to new image on capture/upload
  useEffect(() => {
    if (currentSessionImages.length > 0) {
      setPreviewIndex(currentSessionImages.length - 1);
    }
  }, [currentSessionImages.length]);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCameraList, setShowCameraList] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch video devices (refresh when camera becomes active to ensure labels are available)
  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        setVideoDevices(cameras);
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    }
    getDevices();
  }, [isCameraActive]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Bind stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
  }, []);

  async function startCamera(deviceId?: string) {
    stopCamera(); // Ensure previous stream is stopped
    try {
      const constraints = deviceId
        ? { video: { deviceId: { exact: deviceId } } }
        : { video: { facingMode: "environment" } }; // Default to back camera

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn("Preferred camera failed, trying default.", err);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(mediaStream);
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or unavailable. Using file upload instead.");
      cameraInputRef.current?.click();
    }
  }



  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setShowCameraList(false);
  }

  async function handleFileUpload(file: File) {
    const preview = await fileToDataUrl(file);
    setCurrentSessionImages(prev => [...prev, { file, preview }]);
    // If analysis result exists, clear it to start over or add to it? 
    // Let's assume adding images resets analysis if any, or just appends if in capture mode
    if (analysisResult) {
      setAnalysisResult(null); // Reset result if adding more photos
    }
    setIsCameraActive(false); // Switch to preview mode
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to file
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      const preview = await fileToDataUrl(file);

      setCurrentSessionImages(prev => [...prev, { file, preview }]);

      if (analysisResult) {
        setAnalysisResult(null);
      }

      // Scroll thumbnails
      setTimeout(() => {
        if (thumbnailsRef.current) {
          thumbnailsRef.current.scrollLeft = thumbnailsRef.current.scrollWidth;
        }
      }, 100);

    }, "image/jpeg", 0.9);
  }

  async function fileToDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image."));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  async function analyzeCurrentSession() {
    if (currentSessionImages.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      currentSessionImages.forEach((img) => {
        formData.append("images", img.file);
      });

      const analysis = await analyzeImage(formData);

      setAnalysisResult({
        id: crypto.randomUUID().slice(0, 8).toUpperCase(),
        ...analysis
      } as GradingResult);

    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function addToBatch() {
    if (analysisResult) {
      setBatchItems(prev => [...prev, analysisResult]);
      // Reset for next item
      setCurrentSessionImages([]);
      setAnalysisResult(null);
      setError(null);
    }
  }

  function discardCurrent() {
    setCurrentSessionImages([]);
    setAnalysisResult(null);
    setError(null);
  }

  async function submitBatch() {
    setIsSaving(true);
    try {
      for (const item of batchItems) {
        await saveItem(item);
      }
      router.push("/dealer/inventory");
    } catch (e) {
      console.error(e);
      setError("Failed to submit batch");
    } finally {
      setIsSaving(false);
    }
  }


  function removeImage(index: number) {
    if (index < 0 || index >= currentSessionImages.length) return;

    setCurrentSessionImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });

    // Adjust preview index if necessary
    if (currentSessionImages.length <= 1) {
      setIsCameraActive(true);
      setPreviewIndex(0);
    } else if (index >= currentSessionImages.length - 1) {
      setPreviewIndex(prev => Math.max(0, prev - 1));
    }
  }

  function reset() {
    setCurrentSessionImages([]);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden -m-4 md:-m-8">
      {/* Camera Viewport Section */}
      <section className="relative flex-1 bg-black/40 flex flex-col p-6 gap-4 overflow-hidden border-r border-white/5">
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            {/* ... header ... */}
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-background-dark font-bold">
              UM
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">AI Sorter Agent <span className="text-gray-500 font-normal text-sm ml-2">v2.4.1</span></h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Camera Input (Hidden) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            {/* File Upload Input (Hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              className="bg-surface-darker border-white/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2" size={16} /> Upload
            </Button>
            <Button variant="secondary" size="sm" className="bg-surface-darker border-white/5">
              <Settings size={16} />
            </Button>
          </div>
        </div>

        <div className="relative flex-1 w-full bg-black rounded-3xl shadow-2xl border border-white/10 group">
          {/* Main Image or Video Feed Container - With Clipping */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 w-full h-full bg-black pointer-events-auto">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => {
                    try {
                      videoRef.current?.play();
                    } catch (e) {
                      console.error("Autoplay failed:", e);
                    }
                  }}
                />
              ) : (
                <div className="relative w-full h-full">
                  {/* Show primary image of current session if exists */}
                  {currentSessionImages.length > 0 && activeImage ? (
                    <img
                      src={activeImage.preview}
                      className={cn("w-full h-full object-cover transition-opacity duration-700", isAnalyzing ? "opacity-60" : "opacity-100")}
                      alt="E-waste"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-dark text-gray-500">
                      <Camera size={48} className="opacity-20" />
                    </div>
                  )}

                  {/* Delete Button */}
                  {currentSessionImages.length > 0 && activeImage && !isAnalyzing && !analysisResult && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(previewIndex); }}
                      className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-red-500/80 transition-colors z-30"
                      title="Remove image"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-background-dark/30 pointer-events-none" />
            </div>
          </div>

          {/* Scanning Animation */}
          {isAnalyzing && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute w-full h-1 bg-primary shadow-[0_0_20px_rgba(25,230,107,0.8)] animate-[scan_2.5s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
              <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            </div>
          )}

          {/* Persistent Batch Counter */}
          {batchCount > 0 && (
            <div className="absolute top-4 right-4 z-40 bg-primary text-background-dark px-3 py-1.5 rounded-full font-bold shadow-glow-primary text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-background-dark animate-pulse" />
              Batch: {batchCount} Item{batchCount !== 1 ? 's' : ''}
            </div>
          )}

          {/* AI Bounding Boxes (Simulated) */}
          {/* AI Bounding Boxes (Simulated) */}
          {/* AI Bounding Boxes (Simulated) */}
          {analysisResult && !isAnalyzing && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[20%] left-[25%] w-[50%] h-[60%] border-2 border-primary/70 rounded-lg animate-in fade-in zoom-in duration-500">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary" />
                <div className="absolute -top-10 left-0 bg-primary text-background-dark text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                  <Memory size={14} /> {analysisResult.classification} <span className="bg-black/20 px-1.5 rounded text-[10px]">{analysisResult.grade}</span>
                </div>
              </div>
            </div>
          )}

          {/* Camera Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 z-30">
            <button className="text-white hover:text-primary transition-colors"><Zap size={20} /></button>
            {isCameraActive && videoDevices.length > 1 && (
              <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowCameraList(!showCameraList); }}
                  className="bg-black/50 p-3 rounded-full text-white hover:bg-black/70 backdrop-blur-md transition-all active:scale-95 border border-white/10"
                >
                  <RefreshCcw size={20} />
                </button>

                {showCameraList && (
                  <div className="absolute right-0 bottom-full mb-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl min-w-[220px] max-h-[200px] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-50">
                    <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-white/5">Select Camera</div>
                    {videoDevices.map((device, idx) => (
                      <button
                        key={device.deviceId}
                        onClick={(e) => {
                          e.stopPropagation();
                          startCamera(device.deviceId);
                          setShowCameraList(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm text-white hover:bg-primary/20 transition-colors flex items-center gap-3",
                          stream?.getVideoTracks()[0]?.getSettings().deviceId === device.deviceId && "text-primary font-bold bg-primary/10"
                        )}
                      >
                        <Camera size={14} className={stream?.getVideoTracks()[0]?.getSettings().deviceId === device.deviceId ? "text-primary" : "text-gray-400"} />
                        <span className="truncate">{device.label || `Camera ${idx + 1}`}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => isCameraActive ? capturePhoto() : startCamera()}
              disabled={isAnalyzing || !!analysisResult}
              className={cn(
                "h-16 w-16 rounded-full border-4 border-white/20 flex items-center justify-center transition-all shadow-xl",
                (isAnalyzing || analysisResult) ? "bg-gray-600 scale-95" : "bg-red-500 hover:bg-red-600 hover:scale-105"
              )}
            >
              <div className={cn("rounded transition-all", isAnalyzing ? "w-6 h-6 bg-white" : "w-8 h-8 bg-white rounded-full")} />
            </button>
            <button onClick={reset} className="text-white hover:text-primary transition-colors"><RefreshCcw size={20} /></button>
          </div>
        </div>

        {/* Thumbnails Batch View */}
        <div ref={thumbnailsRef} className="h-24 flex gap-3 overflow-x-auto pb-2 custom-scrollbar px-2 snap-x">
          {currentSessionImages.map((item, idx) => (
            <div
              key={idx}
              onClick={() => { setPreviewIndex(idx); setIsCameraActive(false); }}
              className={cn(
                "min-w-[5rem] h-20 rounded-xl border border-white/10 bg-surface-dark overflow-hidden snap-start relative cursor-pointer hover:border-primary/50 transition-all",
                previewIndex === idx && !isCameraActive ? "border-primary ring-1 ring-primary" : "opacity-80"
              )}
            >
              <img src={item.preview} className="w-full h-full object-cover" alt="scan" />
            </div>
          ))}

          <div
            onClick={() => fileInputRef.current?.click()}
            className="min-w-[5rem] h-20 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/50 transition-colors cursor-pointer snap-start"
          >
            <Upload size={24} />
          </div>
        </div>
      </section>

      {/* Results Aside */}
      <aside className="w-full lg:w-[400px] bg-background-dark flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-white/5 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Analysis Results</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75", !analysisResult && "hidden")} />
                <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", analysisResult ? "bg-primary" : "bg-gray-600")} />
              </span>
              <span className={cn("text-xs font-semibold tracking-widest uppercase", analysisResult ? "text-primary" : "text-gray-500")}>
                {isAnalyzing ? "Analyzing..." : analysisResult ? "Grading Complete" : "Waiting for scan"}
              </span>
            </div>
          </div>
          {analysisResult && (
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">ID #{analysisResult.id}</p>
              <p className="text-[10px] text-gray-400">JUST NOW</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {error && (
            <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
              {error}
            </div>
          )}

          {!analysisResult && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Camera size={40} className="text-gray-500" />
              </div>
              <p className="text-sm text-gray-400 max-w-[200px]">
                {currentSessionImages.length > 0
                  ? `${currentSessionImages.length} photo(s) captured. Add more angles or analyze.`
                  : "Position waste in center and press the capture button."}
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-6 animate-pulse">
              <div className="h-32 bg-white/5 rounded-2xl" />
              <div className="h-40 bg-white/5 rounded-2xl" />
              <div className="h-24 bg-white/5 rounded-2xl" />
            </div>
          )}

          {analysisResult && (
            <>
              {/* Classification */}
              <GlassCard className="p-6 border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500" />
                <h3 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <Memory size={14} className="text-primary" /> Classification
                </h3>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">{analysisResult.classification}</div>
                  <StatusBadge variant="primary" className="text-[10px]">{analysisResult.grade}</StatusBadge>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block tracking-widest mb-1">Condition</span>
                    <span className="text-sm font-semibold text-gray-200">{analysisResult.condition}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block tracking-widest mb-1">Est. Weight</span>
                    <span className="text-sm font-semibold text-gray-200">{analysisResult.weight}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Estimated Value */}
              <GlassCard className="p-6 border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Science size={14} className="text-primary" /> Est. Value
                  </h3>
                  <StatusBadge variant="success" className="bg-success/20">+2.4%</StatusBadge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary font-mono">{analysisResult.estimatedValue}</span>
                  <span className="text-sm text-gray-500">/ kg</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-4 leading-relaxed italic flex items-center gap-1.5">
                  <Info size={12} /> Based on current spot prices in Global market.
                </p>
              </GlassCard>

              {/* REE Content */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Science size={14} className="text-primary" /> REE Content Yield
                </h3>
                <div className="space-y-5">
                  {analysisResult.reeContent.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-300">{item.name}</span>
                        <span className="text-primary font-mono">{item.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", item.color ?? "bg-primary")} style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-8 bg-surface-darker border-t border-white/5">
          <div className="grid grid-cols-2 gap-4">
            {analysisResult ? (
              <>
                <Button variant="secondary" className="py-7 border-white/10"
                  onClick={addToBatch}
                >
                  <Upload className="mr-2" size={18} /> Add to Batch
                </Button>
                <Button variant="ghost" className="py-7 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  onClick={discardCurrent}
                >
                  <RefreshCcw className="mr-2" size={18} /> Discard
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" className="py-7 border-white/10"
                  onClick={analyzeCurrentSession}
                  disabled={isAnalyzing || currentSessionImages.length === 0}
                >
                  <RefreshCcw className="mr-2" size={18} /> Analyze ({currentSessionImages.length})
                </Button>
                <Button
                  className="py-7 shadow-glow-primary font-bold"
                  onClick={submitBatch}
                  disabled={isSaving || batchItems.length === 0}
                >
                  {isSaving ? "Saving..." : `Submit Batch (${batchItems.length})`}
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
