import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { SocialPlatform } from "../../types";
import { PLATFORM_CONFIG } from "../../config/platformsConfig";
import { PlatformPreviews } from "./PlatformPreviews";
import { EmojiPicker } from "./EmojiPicker";
import {
  InstagramIcon,
  FacebookIcon,
  LinkedinIcon,
  YoutubeIcon,
  XIcon
} from "../common/SocialIcons";
import {
  ArrowLeft,
  Plus,
  Smile,
  Hash,
  Image as ImageIcon,
  Video,
  Link2,
  Calendar,
  Clock,
  Send,
  Save,
  CheckSquare,
  Globe,
  ChevronDown,
  X,
  AlertCircle,
  Check,
  Sparkles,
  Eye,
  Info
} from "lucide-react";

const STORAGE_CALENDAR_POSTS = "crinoid_calendar_posts_v1";

const PLATFORM_LIST = [
  { id: "instagram" as SocialPlatform, label: "Instagram", color: "#E4405F" },
  { id: "facebook" as SocialPlatform, label: "Facebook", color: "#1877F2" },
  { id: "linkedin" as SocialPlatform, label: "LinkedIn", color: "#0A66C2" },
  { id: "x" as SocialPlatform, label: "X (Twitter)", color: "#000000" },
  { id: "youtube" as SocialPlatform, label: "YouTube", color: "#FF0000" },
];

type PublishMode = "now" | "schedule" | "queue";

export const CreatePostView: React.FC = () => {
  const {
    currentBrand,
    currentBrandAccounts,
    draft,
    updateDraft,
    setCurrentView,
    showToast,
  } = useApp();

  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(() => {
    if (draft.platforms && draft.platforms.length > 0) return draft.platforms;
    const connected = currentBrandAccounts.map((a) => a.platform);
    return connected.length > 0 ? connected : ["instagram" as SocialPlatform];
  });

  const [caption, setCaption] = useState(draft.commonCaption || "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [mediaUrls, setMediaUrls] = useState<string[]>(draft.mediaUrls || []);
  const [mediaType, setMediaType] = useState<"image" | "video" | "text" | "carousel" | "link">(
    draft.mediaType || "image"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [publishMode, setPublishMode] = useState<PublishMode>("schedule");

  const getInitialDate = () => {
    if (draft.scheduledAt) {
      const draftDate = draft.scheduledAt.split("T")[0];
      if (draftDate >= todayStr) return draftDate;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };
  const getInitialTime = () => {
    if (draft.scheduledAt && draft.scheduledAt.includes("T")) {
      return draft.scheduledAt.split("T")[1].substring(0, 5);
    }
    return "10:00";
  };

  const [scheduleDate, setScheduleDate] = useState(getInitialDate);
  const [scheduleTime, setScheduleTime] = useState(getInitialTime);
  const [dateError, setDateError] = useState("");

  const [sendForApproval, setSendForApproval] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    updateDraft({ commonCaption: caption, platforms: selectedPlatforms, mediaUrls, mediaType });
  }, [caption, selectedPlatforms, mediaUrls, mediaType]);

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length === 1) {
          showToast("warning", "At least one platform must remain selected.");
          return prev;
        }
        return prev.filter((p) => p !== platform);
      }
      return [...prev, platform];
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart ?? caption.length;
      const end = el.selectionEnd ?? caption.length;
      const newCaption = caption.slice(0, start) + emoji + caption.slice(end);
      setCaption(newCaption);
      setTimeout(() => {
        el.selectionStart = start + emoji.length;
        el.selectionEnd = start + emoji.length;
        el.focus();
      }, 0);
    } else {
      setCaption((prev) => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleHashtag = () => {
    const hashtags = "\n\n#socialmedia #marketing #crinoid";
    setCaption((prev) => prev + hashtags);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setMediaUrls((prev) => [...prev, url]);
        if (file.type.startsWith("video/")) setMediaType("video");
        else setMediaType("image");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSampleMedia = () => {
    const samples = [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    setMediaUrls((prev) => [...prev, pick]);
    setMediaType("image");
  };

  const validateSchedule = (date: string) => {
    if (publishMode === "schedule" && date < todayStr) {
      setDateError("Cannot schedule to a past date. Please select today or later.");
      return false;
    }
    setDateError("");
    return true;
  };

  const buildNewPost = (status: string) => ({
    id: "cal-post-new-" + Date.now(),
    brandId: currentBrand.id,
    caption,
    platforms: selectedPlatforms,
    status,
    approvalStatus: sendForApproval ? "in_review" : status === "published" ? "approved" : "draft",
    scheduledAt:
      publishMode === "now" ? new Date().toISOString() : scheduleDate + "T" + scheduleTime + ":00",
    thumbnailUrl: mediaUrls[0] || "",
    mediaType,
    author: { id: "u-1", name: "Muthukumar", role: "Social Lead" },
    campaign: "General",
    createdAt: new Date().toISOString(),
  });

  const saveToCal = (post: ReturnType<typeof buildNewPost>) => {
    try {
      const saved = localStorage.getItem(STORAGE_CALENDAR_POSTS);
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem(STORAGE_CALENDAR_POSTS, JSON.stringify([post, ...existing]));
    } catch (e) {
      console.warn("Failed to save to calendar", e);
    }
  };

  const handlePublishNow = async () => {
    if (!caption.trim()) { showToast("warning", "Please add a caption before publishing."); return; }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const post = buildNewPost("published");
    saveToCal(post);
    showToast("success", "Post published to " + selectedPlatforms.map((p) => PLATFORM_CONFIG[p]?.name || p).join(", ") + "!");
    setIsSubmitting(false);
    setCurrentView("calendar");
  };

  const handleSchedule = async () => {
    if (!caption.trim()) { showToast("warning", "Please add a caption before scheduling."); return; }
    if (!validateSchedule(scheduleDate)) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const post = buildNewPost(sendForApproval ? "pending" : "scheduled");
    saveToCal(post);
    const dateLabel = new Date(scheduleDate + "T" + scheduleTime).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    showToast("success", sendForApproval
      ? "Post submitted for approval. Scheduled for " + dateLabel
      : "Post scheduled for " + dateLabel
    );
    setIsSubmitting(false);
    setCurrentView("calendar");
  };

  const handleSaveDraft = () => {
    if (!caption.trim()) { showToast("warning", "Add some content before saving a draft."); return; }
    const post = buildNewPost("draft");
    saveToCal(post);
    showToast("success", "Draft saved to your calendar.");
  };

  const charCount = caption.length;
  const charLimit = selectedPlatforms.includes("x") ? 280 : selectedPlatforms.includes("instagram") ? 2200 : 3000;
  const platformsForPreview = selectedPlatforms.length > 0 ? selectedPlatforms : ["instagram" as SocialPlatform];

  const getPlatformIcon = (id: SocialPlatform, size = 16) => {
    if (id === "instagram") return <InstagramIcon size={size} color="#E4405F" />;
    if (id === "facebook") return <FacebookIcon size={size} color="#1877F2" />;
    if (id === "linkedin") return <LinkedinIcon size={size} color="#0A66C2" />;
    if (id === "x") return <XIcon size={size} color="#000000" />;
    if (id === "youtube") return <YoutubeIcon size={size} color="#FF0000" />;
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", backgroundColor: "#f8fafc" }}>
      {/* Top Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", backgroundColor: "#ffffff",
        borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0, position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={() => setCurrentView("calendar")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "#ffffff", color: "var(--text-secondary)",
              fontSize: "13px", fontWeight: 500, cursor: "pointer"
            }}
          >
            <ArrowLeft size={14} /> Back to Calendar
          </button>
          <div style={{ width: "1px", height: "20px", backgroundColor: "var(--border-subtle)" }} />
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
            Create Post
          </h1>
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "2px 8px",
            borderRadius: "999px", backgroundColor: "var(--color-primary-light)",
            color: "var(--color-primary)"
          }}>
            {currentBrand.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={handleSaveDraft}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "#ffffff", color: "var(--text-primary)",
              fontSize: "13px", fontWeight: 500, cursor: "pointer"
            }}
          >
            <Save size={14} /> Save Draft
          </button>
        </div>
      </div>

      {/* Three-Column Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 310px 360px",
        flex: 1, minHeight: 0, alignItems: "start"
      }}>

        {/* LEFT: Composer */}
        <div style={{
          padding: "24px", borderRight: "1px solid var(--border-subtle)",
          display: "flex", flexDirection: "column", gap: "20px",
          overflowY: "auto", maxHeight: "calc(100vh - 105px)"
        }}>
          {/* Platform Selector */}
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
              Post to Channels
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {PLATFORM_LIST.map(({ id, label, color }) => {
                const isConnected = currentBrandAccounts.some((a) => a.platform === id);
                const isSelected = selectedPlatforms.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePlatform(id)}
                    title={!isConnected ? label + " not connected" : label}
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      padding: "7px 14px", borderRadius: "999px",
                      border: isSelected ? "2px solid " + color : "2px solid var(--border-subtle)",
                      backgroundColor: isSelected ? color + "12" : "#ffffff",
                      color: isSelected ? color : "var(--text-secondary)",
                      fontSize: "12.5px", fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      opacity: !isConnected && !isSelected ? 0.55 : 1,
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 0 0 3px " + color + "18" : "none"
                    }}
                  >
                    {getPlatformIcon(id, 15)}
                    {label}
                    {isSelected && <Check size={12} />}
                    {!isConnected && <span style={{ fontSize: "10px", opacity: 0.7 }}>+ Connect</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption Editor */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Caption / Post Text
              </label>
              <span style={{ fontSize: "11px", fontWeight: 500, color: charCount > charLimit ? "#dc2626" : "var(--text-muted)" }}>
                {charCount} / {charLimit}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your post caption here... Use #hashtags and @mentions to increase reach."
              rows={7}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "8px",
                border: charCount > charLimit ? "1.5px solid #dc2626" : "1.5px solid var(--border-subtle)",
                fontSize: "14px", lineHeight: "1.55", resize: "vertical",
                fontFamily: "inherit", color: "var(--text-primary)",
                backgroundColor: "#ffffff", outline: "none", boxSizing: "border-box"
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker((p) => !p)}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 10px", borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#ffffff", color: "var(--text-secondary)",
                  fontSize: "12px", cursor: "pointer"
                }}
              >
                <Smile size={14} /> Emoji
              </button>
              <button
                type="button"
                onClick={handleHashtag}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 10px", borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#ffffff", color: "var(--text-secondary)",
                  fontSize: "12px", cursor: "pointer"
                }}
              >
                <Hash size={14} /> Hashtags
              </button>
              {showEmojiPicker && (
                <div style={{ position: "absolute", top: "36px", left: 0, zIndex: 50 }}>
                  <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                </div>
              )}
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
              Media
            </label>
            {mediaUrls.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                {mediaUrls.map((url, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={"media-" + i}
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{
                        position: "absolute", top: "-6px", right: "-6px",
                        background: "#dc2626", border: "none", color: "#fff",
                        borderRadius: "50%", width: "18px", height: "18px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", padding: 0
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  border: "1.5px dashed var(--border-subtle)",
                  backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)",
                  fontSize: "12.5px", cursor: "pointer", fontWeight: 500
                }}
              >
                <ImageIcon size={14} /> Upload Image
              </button>
              <button
                type="button"
                onClick={handleSampleMedia}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  border: "1.5px dashed var(--border-subtle)",
                  backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)",
                  fontSize: "12.5px", cursor: "pointer", fontWeight: 500
                }}
              >
                <Sparkles size={14} /> Sample Media
              </button>
            </div>
          </div>

          {/* Platform-specific extras */}
          {selectedPlatforms.includes("instagram") && (
            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
                Instagram First Comment
              </label>
              <input
                type="text"
                placeholder="Add hashtags or extra info as first comment..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "7px", border: "1.5px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
          )}
          {selectedPlatforms.includes("youtube") && (
            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
                YouTube Video Title
              </label>
              <input
                type="text"
                placeholder="Enter YouTube video title..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "7px", border: "1.5px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
          )}
        </div>

        {/* MIDDLE: Publishing Options */}
        <div style={{
          padding: "24px", borderRight: "1px solid var(--border-subtle)",
          backgroundColor: "#ffffff", display: "flex", flexDirection: "column", gap: "20px",
          overflowY: "auto", maxHeight: "calc(100vh - 105px)"
        }}>
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
              Publishing Mode
            </label>
            {([
              { mode: "now", label: "Publish Now", desc: "Post immediately to selected channels" },
              { mode: "schedule", label: "Schedule for Later", desc: "Pick a specific date & time" },
              { mode: "queue", label: "Add to Queue", desc: "Post at the next available slot" },
            ] as const).map(({ mode, label, desc }) => (
              <div
                key={mode}
                onClick={() => setPublishMode(mode)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "11px 13px", borderRadius: "8px", marginBottom: "8px",
                  border: "1.5px solid " + (publishMode === mode ? "var(--color-primary)" : "var(--border-subtle)"),
                  backgroundColor: publishMode === mode ? "var(--color-primary-light)" : "#ffffff",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                  border: "2px solid " + (publishMode === mode ? "var(--color-primary)" : "#cbd5e1"),
                  backgroundColor: publishMode === mode ? "var(--color-primary)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {publishMode === mode && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#fff" }} />}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: publishMode === mode ? "var(--color-primary)" : "var(--text-primary)" }}>{label}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {publishMode === "schedule" && (
            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
                Date & Time
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px" }}>Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    min={todayStr}
                    onChange={(e) => { setScheduleDate(e.target.value); validateSchedule(e.target.value); }}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: "7px",
                      border: "1.5px solid " + (dateError ? "#dc2626" : "var(--border-subtle)"),
                      fontSize: "13px", boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px" }}>Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "7px", border: "1.5px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-muted)" }}>
                  <Globe size={12} /> UTC+05:30 (IST)
                </div>
              </div>
              {dateError && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: "7px",
                  padding: "9px 12px", borderRadius: "6px",
                  backgroundColor: "#fee2e2", color: "#dc2626",
                  fontSize: "12px", marginTop: "8px", lineHeight: "1.4"
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span>{dateError}</span>
                </div>
              )}
            </div>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Send for Approval</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px" }}>Route to an approver before posting</div>
              </div>
              <button
                type="button"
                onClick={() => setSendForApproval((p) => !p)}
                style={{
                  width: "38px", height: "22px", borderRadius: "999px", border: "none",
                  backgroundColor: sendForApproval ? "var(--color-primary)" : "#e2e8f0",
                  cursor: "pointer", position: "relative", flexShrink: 0
                }}
              >
                <span style={{
                  position: "absolute", top: "3px",
                  left: sendForApproval ? "18px" : "3px",
                  width: "16px", height: "16px", borderRadius: "50%",
                  backgroundColor: "#ffffff", transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }} />
              </button>
            </div>
            {sendForApproval && (
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add a note for the reviewer (optional)..."
                rows={3}
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: "7px",
                  border: "1.5px solid var(--border-subtle)",
                  fontSize: "12.5px", fontFamily: "inherit", resize: "none",
                  boxSizing: "border-box", marginTop: "8px"
                }}
              />
            )}
          </div>

          {charCount > charLimit && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "8px",
              padding: "10px 12px", borderRadius: "7px",
              backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "12.5px"
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>Caption exceeds the character limit ({charLimit}) for {selectedPlatforms.includes("x") ? "X" : "this platform"}.</span>
            </div>
          )}

          <div style={{ marginTop: "auto", paddingTop: "8px" }}>
            {publishMode === "now" ? (
              <button
                type="button"
                onClick={handlePublishNow}
                disabled={isSubmitting || charCount > charLimit || !caption.trim()}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "11px 20px", borderRadius: "8px", border: "none",
                  backgroundColor: isSubmitting ? "#94a3b8" : "#059669",
                  color: "#ffffff", fontSize: "14px", fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(5,150,105,0.3)"
                }}
              >
                <Send size={16} />
                {isSubmitting ? "Publishing..." : "Publish Now"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSchedule}
                disabled={isSubmitting || charCount > charLimit || !caption.trim() || !!dateError}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "11px 20px", borderRadius: "8px", border: "none",
                  backgroundColor: isSubmitting || !!dateError ? "#94a3b8" : "var(--color-primary)",
                  color: "#ffffff", fontSize: "14px", fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(79,70,229,0.25)"
                }}
              >
                {sendForApproval ? <CheckSquare size={16} /> : <Calendar size={16} />}
                {isSubmitting ? "Scheduling..." : sendForApproval ? "Submit for Approval" : publishMode === "queue" ? "Add to Queue" : "Schedule Post"}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div style={{
          padding: "24px", backgroundColor: "#f8fafc",
          overflowY: "auto", maxHeight: "calc(100vh - 105px)"
        }}>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Eye size={15} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Live Preview</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-muted)" }}>
              <Info size={12} />
              Approximate representation of how your post will look
            </div>
          </div>
          <PlatformPreviews
            draft={{ ...draft, commonCaption: caption, platforms: selectedPlatforms, mediaUrls, mediaType }}
            selectedPlatforms={platformsForPreview}
          />
        </div>
      </div>
    </div>
  );
};

