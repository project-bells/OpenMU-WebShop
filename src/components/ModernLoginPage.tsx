import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { AccountData, LanguageCode } from '../types/webshop';
import { t } from '../translations';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'flexible' | 'compact';
          callback?: (token: string) => void;
          'error-callback'?: (errorCode: string) => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface ModernLoginPageProps {
  onLoginSuccess: (cleanUsername: string, accountRecord?: any) => void;
  onCancel?: () => void;
  presetAccounts?: AccountData[];
  lang?: LanguageCode;
  isModal?: boolean;
}

export const ModernLoginPage: React.FC<ModernLoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  presetAccounts = [],
  lang = 'Thai',
  isModal = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('netsplit');
  const [password, setPassword] = useState('netsplit');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('netsplit@lorencia.mu');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission & Cloudflare states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success' | 'info';
    text: string;
  } | null>(null);

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileStatus, setTurnstileStatus] = useState<
    'idle' | 'loading' | 'success' | 'expired' | 'error'
  >('idle');
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [turnstileScriptLoaded, setTurnstileScriptLoaded] = useState<boolean>(
    typeof window !== 'undefined' && Boolean(window.turnstile)
  );

  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  // Site Key from environment or Cloudflare's official universal test key (Always passes)
  const siteKey =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      (import.meta.env.VITE_CF_TURNSTILE_SITE_KEY as string)) ||
    '1x00000000000000000000AA';

  // Check script availability
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    if (typeof window !== 'undefined') {
      if (window.turnstile) {
        setTurnstileScriptLoaded(true);
      } else {
        checkInterval = setInterval(() => {
          if (window.turnstile) {
            setTurnstileScriptLoaded(true);
            clearInterval(checkInterval);
          }
        }, 500);
      }
    }
    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // Render Turnstile widget once container and script are ready
  useEffect(() => {
    let currentWidgetId: string | null = null;
    let isCancelled = false;

    const renderWidget = () => {
      if (
        !turnstileContainerRef.current ||
        typeof window === 'undefined' ||
        !window.turnstile
      ) {
        return;
      }

      try {
        // Clear old contents if needed
        turnstileContainerRef.current.innerHTML = '';
        setTurnstileStatus('loading');

        currentWidgetId = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          size: 'normal',
          callback: (token: string) => {
            if (!isCancelled) {
              setTurnstileToken(token);
              setTurnstileStatus('success');
              setStatusMessage(null);
            }
          },
          'expired-callback': () => {
            if (!isCancelled) {
              setTurnstileToken('');
              setTurnstileStatus('expired');
              setStatusMessage({
                type: 'error',
                text: 'การตรวจสอบความปลอดภัย Cloudflare Turnstile หมดอายุ กรุณาคลิกเพื่อยืนยันใหม่อีกครั้ง',
              });
            }
          },
          'error-callback': (errorCode: string) => {
            if (!isCancelled) {
              setTurnstileToken('');
              setTurnstileStatus('error');
              setStatusMessage({
                type: 'error',
                text: `เกิดข้อผิดพลาดในการโหลด Cloudflare Turnstile (${errorCode}) กรุณาลองใหม่อีกครั้ง`,
              });
            }
          },
        });

        setWidgetId(currentWidgetId);
      } catch (err) {
        console.warn('[Cloudflare Turnstile Render Warning]', err);
      }
    };

    const timer = setTimeout(renderWidget, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (currentWidgetId && window.turnstile) {
        try {
          window.turnstile.remove(currentWidgetId);
        } catch {
          // ignore
        }
      }
    };
  }, [siteKey, mode, turnstileScriptLoaded]);

  // Reset Turnstile
  const handleResetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileStatus('loading');
    setStatusMessage(null);
    if (widgetId && window.turnstile) {
      try {
        window.turnstile.reset(widgetId);
      } catch {
        // ignore
      }
    }
  };

  // Simulated fallback for test/dev environments without external network
  const handleSimulatePass = () => {
    const mockToken = `TEST_TOKEN_CF_${Date.now()}_PASS`;
    setTurnstileToken(mockToken);
    setTurnstileStatus('success');
    setStatusMessage({
      type: 'info',
      text: 'จำลองการยืนยัน Cloudflare Turnstile (Test Key Sandbox Mode) สำเร็จ',
    });
  };

  // Form validations
  const isUsernameValid = username.trim().length >= 3 && username.trim().length <= 10;
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid =
    mode === 'login' || (password === confirmPassword && confirmPassword.length > 0);
  const isEmailValid =
    mode === 'login' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isFormValid =
    isUsernameValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    isEmailValid &&
    Boolean(turnstileToken);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!turnstileToken) {
      setStatusMessage({
        type: 'error',
        text: 'กรุณายืนยันความปลอดภัย Cloudflare Turnstile ด้านล่างก่อนส่งข้อมูล',
      });
      return;
    }

    if (!isUsernameValid) {
      setStatusMessage({
        type: 'error',
        text: 'ชื่อบัญชี (LoginName) ต้องมีความยาวระหว่าง 3 ถึง 10 ตัวอักษร',
      });
      return;
    }

    if (!isPasswordValid) {
      setStatusMessage({
        type: 'error',
        text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
      });
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านที่ระบุ',
      });
      return;
    }

    setIsSubmitting(true);
    const cleanUser = username.trim();
    const endpoint =
      mode === 'login' ? '/api/openmu/login' : '/api/openmu/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cf-turnstile-response': turnstileToken,
        },
        body: JSON.stringify({
          loginName: cleanUser,
          password,
          email: mode === 'register' ? email.trim() : undefined,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatusMessage({
          type: 'error',
          text:
            data.message ||
            (response.status === 403
              ? 'การตรวจสอบความปลอดภัย Cloudflare ไม่ผ่าน (403 Forbidden)'
              : 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูล'),
        });
        // Reset turnstile on failure to require fresh challenge
        handleResetTurnstile();
        setIsSubmitting(false);
        return;
      }

      // Success
      setStatusMessage({
        type: 'success',
        text:
          mode === 'login'
            ? `ยินดีต้อนรับ ${data.account?.loginName || cleanUser} เข้าสู่ระบบสำเร็จ!`
            : `สร้างบัญชี ${cleanUser} ในระบบ OpenMU-Origins สำเร็จ! กำลังเข้าสู่ระบบ...`,
      });

      setTimeout(() => {
        onLoginSuccess(cleanUser, data.account);
      }, 500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`w-full ${
        isModal
          ? 'max-w-xl mx-auto p-4 sm:p-6'
          : 'max-w-4xl mx-auto py-8 px-4 sm:px-6'
      }`}
    >
      {/* Outer Card with Dark Gothic MU Metallic Styling */}
      <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Top Metallic Border Glow */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Modal Close Button (if in modal mode) */}
        {isModal && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-amber-500/20 to-zinc-900 border border-amber-500/40 shadow-inner mb-1">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-wide">
              {mode === 'login'
                ? 'เข้าสู่ระบบ Open-Webshop'
                : 'สร้างบัญชี OpenMU-Origins'}
            </h1>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              ระบบยืนยันตัวตนความปลอดภัยสูง ป้องกันบอทด้วย Cloudflare Turnstile และเข้ารหัสรหัสผ่านด้วย BCrypt
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/80 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ลงทะเบียนใหม่ (Register)</span>
            </button>
          </div>

          {/* Quick-Switch Preset Accounts (Helps test immediately) */}
          {presetAccounts.length > 0 && mode === 'login' && (
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  สลับบัญชีทดสอบด่วน (OpenMU-Origins Demo Accounts):
                </span>
                <span className="text-[10px] text-zinc-500 font-mono-tabular">
                  Pass: เดียวกับชื่อบัญชี / 123456
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presetAccounts.map((acc) => {
                  const isCurrent = acc.username.toLowerCase() === username.toLowerCase();
                  return (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => {
                        setUsername(acc.username);
                        setPassword(acc.username === 'netsplit' ? 'netsplit' : '123456');
                        setStatusMessage(null);
                        // In local test mode, also auto-simulate token for convenience
                        if (!turnstileToken) {
                          handleSimulatePass();
                        }
                      }}
                      className={`px-3 py-2 rounded-md border text-left text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'border-amber-500/80 bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/40'
                          : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{acc.username}</span>
                        {acc.isAdmin && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                            GM
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono-tabular">
                        {acc.credits.toLocaleString()} Credits
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Banners */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                statusMessage.type === 'error'
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                  : statusMessage.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-blue-500/40 bg-blue-500/10 text-blue-200'
              }`}
            >
              {statusMessage.type === 'error' && (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'info' && (
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>ชื่อบัญชี (OpenMU LoginName)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span
                  className={`text-[10px] font-mono-tabular ${
                    username.length >= 3 && username.length <= 10
                      ? 'text-emerald-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {username.length}/10 อักขระ
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={10}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  placeholder="เช่น netsplit, darkknight"
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-3.5 pr-9 py-2.5 rounded-lg bg-zinc-900 border text-xs text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 ${
                    username && !isUsernameValid
                      ? 'border-rose-500 focus:ring-rose-500'
                      : username && isUsernameValid
                      ? 'border-emerald-500/60 focus:ring-emerald-500'
                      : 'border-zinc-700 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                {username && isUsernameValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3 pointer-events-none" />
                )}
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                <span>ความยาว 3–10 ตัวอักษร (A-Z, 0-9)</span>
              </div>
            </div>

            {/* Email Field (for Register Mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>อีเมล (E-Mail Address)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hero@lorencia.mu"
                    required
                    disabled={isSubmitting}
                    className={`w-full pl-3.5 pr-9 py-2.5 rounded-lg bg-zinc-900 border text-xs text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 ${
                      email && !isEmailValid
                        ? 'border-rose-500 focus:ring-rose-500'
                        : email && isEmailValid
                        ? 'border-emerald-500/60 focus:ring-emerald-500'
                        : 'border-zinc-700 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                  />
                  {email && isEmailValid && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3 pointer-events-none" />
                  )}
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>รหัสผ่าน (Password)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-zinc-500">อย่างน้อย 6 อักขระ</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-zinc-900 border text-xs text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 ${
                    password && !isPasswordValid
                      ? 'border-rose-500 focus:ring-rose-500'
                      : password && isPasswordValid
                      ? 'border-emerald-500/60 focus:ring-emerald-500'
                      : 'border-zinc-700 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (for Register Mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                    <span>ยืนยันรหัสผ่าน (Confirm Password)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-zinc-900 border text-xs text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 ${
                      confirmPassword && !isConfirmPasswordValid
                        ? 'border-rose-500 focus:ring-rose-500'
                        : confirmPassword && isConfirmPasswordValid
                        ? 'border-emerald-500/60 focus:ring-emerald-500'
                        : 'border-zinc-700 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Cloudflare Turnstile Verification Box */}
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#f38020]" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Cloudflare Turnstile Verification
                  </span>
                </div>
                {turnstileToken ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : turnstileStatus === 'loading' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400">
                    Challenge Required
                  </span>
                )}
              </div>

              {/* Turnstile Container Mount Target */}
              <div className="flex flex-col items-center justify-center min-h-[68px] py-1 bg-zinc-950/80 rounded border border-zinc-800/80">
                <div ref={turnstileContainerRef} id="cf-turnstile-container" />

                {/* Fallback button if Turnstile script is blocked or in offline sandbox test */}
                {(!turnstileToken || turnstileStatus === 'error') && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={handleSimulatePass}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>คลิกเพื่อจำลองยืนยัน Cloudflare (Test Pass Sandbox)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTurnstile}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 transition-colors cursor-pointer"
                      title="Reload Challenge"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>รีเฟรชวิดเจ็ต</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>SiteKey: {siteKey.slice(0, 14)}...</span>
                <span className="flex items-center gap-1">
                  Protected by Cloudflare Turnstile &middot; Zero-Trust
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  !isFormValid || isSubmitting
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer font-bold'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>กำลังตรวจสอบและเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login'
                        ? 'เข้าสู่ระบบ (Sign In to OpenMU)'
                        : 'ลงทะเบียนบัญชีใหม่ (Create Account)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!turnstileToken && (
                <p className="text-center text-[11px] text-amber-400/80 pt-2 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>กรุณายืนยันความปลอดภัย Cloudflare ด้านบนเพื่อเปิดใช้งานปุ่ม</span>
                </p>
              )}
            </div>
          </form>

          {/* Footer Security Certifications */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                BCrypt Hashed (data."Account")
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Cloudflare Turnstile Active
              </span>
            </div>
            <div className="text-zinc-500 font-mono-tabular">
              OpenMU-Origins v1.2+ Bridge
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
