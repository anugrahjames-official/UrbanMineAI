"use client";

import { analyzeImage, saveItem } from "@/app/actions/scan-item"; // Import server actions
import { getUserProfile } from "@/app/actions/user"; // Import user profile action
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Camera, Upload, Settings, RefreshCcw, Zap, Memory, Science, Info, Trash2, MapPin, FileText, Box } from "@/components/icons";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Types
type ReeItem = { name: string; value: string; percentage: number; color?: string; estimatedValue?: string };
type GradingResult = {
  id: string;
  classification: string;
  grade: string;
  condition: string;
  weight?: string;
  estimatedValue: string;
  totalValue?: string; // New field
  reeContent: ReeItem[];
  image_url: string;
  additional_images?: string[];
  // New fields
  title?: string;
  description?: string;
  location?: string;
  duration?: string;
  packaging?: string;
  logistics?: string;
  confidence?: number;
  category?: string; // New field
};

// Helper for dynamic metal colors
const getColorForMetal = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("gold") || normalized.includes("au")) return "bg-yellow-500";
  if (normalized.includes("palladium") || normalized.includes("pd")) return "bg-gray-400";
  if (normalized.includes("copper") || normalized.includes("cu")) return "bg-orange-600";
  if (normalized.includes("silver") || normalized.includes("ag")) return "bg-gray-300";
  if (normalized.includes("platinum") || normalized.includes("pt")) return "bg-slate-300";
  // Fallbacks for others with distinct colors
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-indigo-500", "bg-teal-500",
    "bg-rose-500", "bg-cyan-500", "bg-emerald-500", "bg-fuchsia-500"
  ];
  // Simple hash to consistently pick a color from the list
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Logarithmic scale for better visibility of trace elements
const getVisualProgress = (percentage: number) => {
  if (!percentage || percentage <= 0) return 0;
  // Maps 0.0001% .. 100% to 2% .. 100%
  // Using a slightly adjusted curve to make small values visible but distinct
  const minLog = -4; // log10(0.0001)
  const maxLog = 2;  // log10(100)
  const val = Math.max(percentage, 0.0001);
  const logVal = Math.log10(val);
  const normalized = (logVal - minLog) / (maxLog - minLog);
  return Math.max(2, Math.min(100, 2 + normalized * 98));
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

  // Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [userDefaultLocation, setUserDefaultLocation] = useState("");
  const [duration, setDuration] = useState("24h");
  const [packaging, setPackaging] = useState("Box");
  const [logistics, setLogistics] = useState("Shipping");


  // Computed
  const hasImages = currentSessionImages.length > 0;
  const batchCount = batchItems.length;
  const activeImage = currentSessionImages[previewIndex] || currentSessionImages[currentSessionImages.length - 1];

  // Ref for scrolling to new items
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Fetch User Profile on Mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await getUserProfile();
        if (profile.location) {
          setUserDefaultLocation(profile.location);
          setLocation(profile.location); // Default sets to user location
        }
      } catch (e) {
        console.error("Failed to fetch user profile", e);
      }
    }
    fetchProfile();
  }, []);

  // Set default description/title on analysis result
  useEffect(() => {
    if (analysisResult) {
      setEditedName(analysisResult.classification);
      setCategory(analysisResult.category || ""); // Set category from AI
      setDescription(analysisResult.description || ""); // Set description from AI or reset
      // Keep location as is (either user default or previously entered if we want persistence across batch? 
      // Let's reset to default for new item unless user wants otherwise. 
      // Ideally, batch items might be from same location, so maybe keep current 'location' state?
      // For now, let's keep the 'location' state as is, so if they change it, it stays for next item in batch.
      if (!location && userDefaultLocation) setLocation(userDefaultLocation);
    }
  }, [analysisResult, userDefaultLocation]);


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
      // Don't show error immediately on load if permissions denied, just fallback silently or show UI hint?
      // For now, let's just set error state but maybe not popup alert
      setError("Camera access denied or unavailable. Using file upload instead.");
      // cameraInputRef.current?.click(); // Auto-triggering file input might be annoying on load
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

    // stop camera and switch to image view
    stopCamera();
    setIsCameraActive(false);

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
      // Names/Description/Location set via useEffect

    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function addToBatch() {
    if (analysisResult) {
      if (!location.trim()) {
        setError("Location is required.");
        return;
      }

      const itemWithCustomName = {
        ...analysisResult,
        title: editedName || analysisResult.classification,
        classification: analysisResult.classification,
        category: category,
        description: description,
        location: location,
        duration: duration,
        packaging: packaging,
        logistics: logistics,
        confidence: analysisResult.confidence || 0.95
      };
      setBatchItems(prev => [...prev, itemWithCustomName]);
      // Reset for next item
      setCurrentSessionImages([]);
      setAnalysisResult(null);
      setEditedName("");
      setCategory("");
      setDescription("");
      // Location stays? Yes for batch.
      setIsEditingName(false);
      setError(null);

      // Restart camera for next item
      startCamera();
    }
  }

  function discardCurrent() {
    setCurrentSessionImages([]);
    setAnalysisResult(null);
    setError(null);
    startCamera();
  }

  async function submitBatch(status: "listed" | "pending" = "listed") {
    setIsSaving(true);
    try {
      for (const item of batchItems) {
        await saveItem(item, status);
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
    if (isAnalyzing || analysisResult) return; // Prevent removal during/after analysis

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
              disabled={isAnalyzing || !!analysisResult}
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
              disabled={isAnalyzing || !!analysisResult}
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
              disabled={isAnalyzing || !!analysisResult}
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


          {/* Source Indicator Badge */}
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2 pointer-events-none">
            {isCameraActive ? (
              <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                LIVE FEED
              </div>
            ) : (currentSessionImages.length > 0 && activeImage) ? (
              <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white/80 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                <FileText size={12} className="text-primary" />
                IMAGE PREVIEW
              </div>
            ) : null}
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
          {(!isAnalyzing && !analysisResult) && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 z-30">
              {isCameraActive ? (
                <>
                  {/* Camera Toggle and List */}
                  {videoDevices.length > 1 && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCameraList(!showCameraList);
                        }}
                        className={cn(
                          "text-white hover:text-primary transition-colors p-3 rounded-full hover:bg-white/10",
                          showCameraList && "bg-white/10 text-primary"
                        )}
                        title="Switch Camera"
                      >
                        <RefreshCcw size={20} />
                      </button>

                      {/* Camera List Dropdown */}
                      {showCameraList && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl min-w-[200px] max-h-[200px] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-50">
                          <div className="px-4 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-white/5 bg-white/5">Select Camera</div>
                          {videoDevices.map((device, idx) => (
                            <button
                              key={device.deviceId}
                              onClick={(e) => {
                                e.stopPropagation();
                                startCamera(device.deviceId);
                                setShowCameraList(false);
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 text-xs text-white hover:bg-primary/20 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0",
                                stream?.getVideoTracks()[0]?.getSettings().deviceId === device.deviceId && "text-primary font-bold bg-primary/10"
                              )}
                            >
                              <Camera size={14} className={stream?.getVideoTracks()[0]?.getSettings().deviceId === device.deviceId ? "text-primary" : "text-gray-500"} />
                              <span className="truncate">{device.label || `Camera ${idx + 1}`}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Capture Button */}
                  <button
                    onClick={capturePhoto}
                    disabled={isAnalyzing}
                    className="h-16 w-16 rounded-full border-4 border-white/20 flex items-center justify-center transition-all shadow-xl bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95"
                  >
                    <div className="w-8 h-8 bg-white rounded-full" />
                  </button>
                </>
              ) : (
                /* Image Mode - Return to Camera */
                <button
                  onClick={() => startCamera()}
                  className="flex items-center gap-3 text-white hover:text-primary transition-colors font-semibold px-2"
                >
                  <Camera size={20} />
                  <span>Open Camera</span>
                </button>
              )}
            </div>
          )}
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

          <button
            onClick={() => !isAnalyzing && !analysisResult && fileInputRef.current?.click()}
            disabled={isAnalyzing || !!analysisResult}
            className={cn(
              "min-w-[5rem] h-20 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 transition-colors snap-start",
              (isAnalyzing || analysisResult) ? "opacity-50 cursor-not-allowed" : "hover:text-primary hover:border-primary/50 cursor-pointer"
            )}
          >
            <Upload size={24} />
          </button>
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
              {/* Editable Fields Section */}
              <GlassCard className="p-6 border-white/5 space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block flex items-center gap-1">
                    <Box size={12} className="text-primary" /> Title
                  </label>
                  <input
                    className="w-full bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Item Name"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block flex items-center gap-1">
                    <Box size={12} className="text-primary" /> Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E-Waste Category (e.g. PCB, Battery)"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block flex items-center gap-1">
                    <MapPin size={12} className="text-primary" /> Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                  {userDefaultLocation && location === userDefaultLocation && (
                    <p className="text-[10px] text-primary/70 mt-1">✓ Auto-filled from your profile</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block flex items-center gap-1">
                    <FileText size={12} className="text-primary" /> Description
                  </label>
                  <textarea
                    className="w-full bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600 resize-none h-20"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about condition, origin, etc..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">
                      Auction Duration
                    </label>
                    <select
                      className="w-full bg-surface-dark border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <option value="12h">12 Hours</option>
                      <option value="24h">24 Hours</option>
                      <option value="48h">48 Hours</option>
                      <option value="7d">7 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">
                      Packaging
                    </label>
                    <select
                      className="w-full bg-surface-dark border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                      value={packaging}
                      onChange={(e) => setPackaging(e.target.value)}
                    >
                      <option value="Box">Box</option>
                      <option value="Pallet">Pallet</option>
                      <option value="Loose">Loose</option>
                      <option value="Crate">Crate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">
                    Logistics Preference
                  </label>
                  <select
                    className="w-full bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                    value={logistics}
                    onChange={(e) => setLogistics(e.target.value)}
                  >
                    <option value="Shipping">Seller Ships</option>
                    <option value="Pickup">Buyer Pick-up</option>
                    <option value="Managed">UrbanMine Managed</option>
                  </select>
                </div>
              </GlassCard>

              {/* Classification Summary */}
              <GlassCard className="p-6 border-white/5 relative overflow-hidden group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Memory size={14} className="text-primary" /> AI Classification
                    </h3>
                    <StatusBadge variant="primary" className="text-[10px]">{analysisResult.grade}</StatusBadge>
                  </div>
                  <div className="text-xl font-bold text-white/90">
                    {analysisResult.classification}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block tracking-widest mb-1">Condition</span>
                      <span className="text-sm font-semibold text-gray-200">{analysisResult.condition}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block tracking-widest mb-1">Est. Weight</span>
                      <span className="text-sm font-semibold text-gray-200">{analysisResult.weight}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Estimated Value */}
              <GlassCard className="p-6 border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Science size={14} className="text-primary" /> Est. Total Value
                  </h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary font-mono">{analysisResult.totalValue || 'N/A'}</span>
                  {analysisResult.totalValue && <span className="text-sm text-gray-500">Total</span>}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  <span className="font-mono text-white/70">{analysisResult.estimatedValue}</span> / kg
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
                        <div className="text-right">
                          <span className="text-primary font-mono block">{item.value}</span>
                          {item.estimatedValue && (
                            <span className="text-[10px] text-emerald-400 font-mono block">{item.estimatedValue}</span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]", item.color || getColorForMetal(item.name))}
                          style={{ width: `${getVisualProgress(item.percentage || 0)}%` }}
                        />
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
                  disabled={!location}
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
              <div className="col-span-2 space-y-4">
                <Button variant="secondary" className="w-full py-7 border-white/10"
                  onClick={analyzeCurrentSession}
                  disabled={isAnalyzing || currentSessionImages.length === 0}
                >
                  <RefreshCcw className="mr-2" size={18} /> Analyze ({currentSessionImages.length})
                </Button>

                {batchItems.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <Button
                      variant="secondary"
                      className="py-7 border-white/10"
                      onClick={() => submitBatch('pending')}
                      disabled={isSaving}
                    >
                      <Box className="mr-2" size={18} /> Add to Inventory
                    </Button>
                    <Button
                      className="py-7 shadow-glow-primary font-bold"
                      onClick={() => submitBatch('listed')}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : `Submit Batch (${batchItems.length})`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
