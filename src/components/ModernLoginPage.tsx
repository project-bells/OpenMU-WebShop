import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { LanguageCode } from '../types/webshop';
import { EGIS_MU_LOGO_URL } from '../data/initialState';
import { L } from '../translations';

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
  lang?: LanguageCode;
  isModal?: boolean;
  initialMode?: 'login' | 'register';
}

export const ModernLoginPage: React.FC<ModernLoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  lang = 'Thai',
  isModal = false,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [characterDeleteCode, setCharacterDeleteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success' | 'info';
    text: string;
  } | null>(null);

  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileStatus, setTurnstileStatus] = useState<
    'idle' | 'loading' | 'success' | 'expired' | 'error'
  >('idle');
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [turnstileScriptLoaded, setTurnstileScriptLoaded] = useState<boolean>(
    typeof window !== 'undefined' && Boolean(window.turnstile)
  );

  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const configuredSiteKey =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_CF_TURNSTILE_SITE_KEY as string);
  const siteKey = configuredSiteKey || '1x00000000000000000000AA';

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    let checkInterval: ReturnType<typeof setInterval> | undefined;
    let fallbackTimeout: ReturnType<typeof setTimeout> | undefined;

    if (typeof window !== 'undefined') {
      if (window.turnstile) {
        setTurnstileScriptLoaded(true);
      } else {
        checkInterval = setInterval(() => {
          if (window.turnstile) {
            setTurnstileScriptLoaded(true);
            if (checkInterval) clearInterval(checkInterval);
          }
        }, 400);

        // If external Cloudflare script is unreachable on restricted networks and no custom sitekey is forced, prevent auth deadlock
        if (!configuredSiteKey) {
          fallbackTimeout = setTimeout(() => {
            if (!window.turnstile) {
              setTurnstileToken(`TEST_TOKEN_CF_${Date.now()}_FALLBACK`);
              setTurnstileStatus('success');
            }
          }, 2500);
        }
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [configuredSiteKey]);

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
                text: L(lang, {
                  en: 'Security verification expired. Please complete the challenge again.',
                  th: 'การตรวจสอบความปลอดภัยหมดอายุ กรุณายืนยันใหม่อีกครั้ง',
                  pt: 'A verificação de segurança expirou. Confirme novamente.',
                  ru: 'Проверка безопасности истекла. Пожалуйста, подтвердите снова.',
                  es: 'La verificación de seguridad expiró. Por favor confirma nuevamente.',
                  bg: 'Проверката за сигурност изтече. Моля, потвърдете отново.',
                }),
              });
            }
          },
          'error-callback': (errorCode: string) => {
            if (!isCancelled) {
              if (!configuredSiteKey) {
                setTurnstileToken(`TEST_TOKEN_CF_${Date.now()}_FALLBACK`);
                setTurnstileStatus('success');
                return;
              }
              setTurnstileToken('');
              setTurnstileStatus('error');
              setStatusMessage({
                type: 'error',
                text: L(lang, {
                  en: `Security challenge error (${errorCode}). Please refresh and try again.`,
                  th: `เกิดข้อผิดพลาดในการโหลดระบบตรวจสอบความปลอดภัย (${errorCode}) กรุณาลองใหม่อีกครั้ง`,
                  pt: `Erro na verificação de segurança (${errorCode}). Tente novamente.`,
                  ru: `Ошибка проверки безопасности (${errorCode}). Попробуйте снова.`,
                  es: `Error en la verificación de seguridad (${errorCode}). Inténtalo de nuevo.`,
                  bg: `Грешка при проверката за сигурност (${errorCode}). Опитайте отново.`,
                }),
              });
            }
          },
        });

        setWidgetId(currentWidgetId);
      } catch {
        if (!configuredSiteKey && !isCancelled) {
          setTurnstileToken(`TEST_TOKEN_CF_${Date.now()}_FALLBACK`);
          setTurnstileStatus('success');
        }
      }
    };

    const timer = setTimeout(renderWidget, 180);

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
  }, [siteKey, mode, turnstileScriptLoaded, configuredSiteKey, lang]);

  const handleResetTurnstile = () => {
    setStatusMessage(null);
    if (widgetId && window.turnstile) {
      setTurnstileToken('');
      setTurnstileStatus('loading');
      try {
        window.turnstile.reset(widgetId);
      } catch {
        // ignore
      }
    } else if (!configuredSiteKey) {
      setTurnstileToken(`TEST_TOKEN_CF_${Date.now()}_FALLBACK`);
      setTurnstileStatus('success');
    }
  };

  const isUsernameValid = username.trim().length >= 3 && username.trim().length <= 10;
  const isPasswordValid = password.length >= 6;
  const isPasswordValidForMode = mode === 'login' ? password.length >= 4 : isPasswordValid;
  const isConfirmPasswordValid =
    mode === 'login' || (password === confirmPassword && confirmPassword.length > 0);
  const isEmailValid =
    mode === 'login' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isDeleteCodeValid =
    mode === 'login' || /^\d{4,8}$/.test(characterDeleteCode);

  const isFormValid =
    isUsernameValid &&
    isPasswordValidForMode &&
    isConfirmPasswordValid &&
    isEmailValid &&
    isDeleteCodeValid &&
    Boolean(turnstileToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!turnstileToken) {
      setStatusMessage({
        type: 'error',
        text: L(lang, {
          en: 'Please complete the Cloudflare security verification below first.',
          th: 'กรุณายืนยันความปลอดภัย Cloudflare Turnstile ด้านล่างก่อนส่งข้อมูล',
          pt: 'Conclua a verificação de segurança Cloudflare abaixo primeiro.',
          ru: 'Пожалуйста, сначала пройдите проверку безопасности Cloudflare ниже.',
          es: 'Completa primero la verificación de seguridad Cloudflare abajo.',
          bg: 'Моля, първо преминете проверката за сигурност на Cloudflare отдолу.',
        }),
      });
      return;
    }

    if (!isUsernameValid) {
      setStatusMessage({
        type: 'error',
        text: L(lang, {
          en: 'Account ID must be between 3 and 10 characters.',
          th: 'ชื่อบัญชีต้องมีความยาวระหว่าง 3 ถึง 10 ตัวอักษร',
          pt: 'O login da conta deve ter entre 3 e 10 caracteres.',
          ru: 'Логин аккаунта должен содержать от 3 до 10 символов.',
          es: 'El nombre de cuenta debe tener entre 3 y 10 caracteres.',
          bg: 'Името на акаунта трябва да бъде между 3 и 10 символа.',
        }),
      });
      return;
    }

    if (mode === 'register' && !isPasswordValid) {
      setStatusMessage({
        type: 'error',
        text: L(lang, {
          en: 'Password must be at least 6 characters long.',
          th: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
          pt: 'A senha deve ter pelo menos 6 caracteres.',
          ru: 'Пароль должен содержать не менее 6 символов.',
          es: 'La contraseña debe tener al menos 6 caracteres.',
          bg: 'Паролата трябва да бъде поне 6 символа.',
        }),
      });
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: L(lang, {
          en: 'Confirmation password does not match.',
          th: 'รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านที่ระบุ',
          pt: 'A confirmação de senha não coincide.',
          ru: 'Подтверждение пароля не совпадает.',
          es: 'La contraseña de confirmación no coincide.',
          bg: 'Потвърждението на паролата не съвпада.',
        }),
      });
      return;
    }

    if (mode === 'register' && !/^\d{4,8}$/.test(characterDeleteCode)) {
      setStatusMessage({
        type: 'error',
        text: L(lang, {
          en: 'Character Delete Code must contain digits 0–9 only (4–8 digits).',
          th: 'รหัสสำหรับลบตัวละครต้องเป็นตัวเลข 0–9 เท่านั้น (ความยาว 4–8 หลัก)',
          pt: 'O Código de Exclusão de Personagem deve conter apenas números 0–9 (4–8 dígitos).',
          ru: 'Код удаления персонажа должен состоять только из цифр 0–9 (4–8 цифр).',
          es: 'El código para borrar personaje debe contener solo números 0–9 (4–8 dígitos).',
          bg: 'Кодът за изтриване на герой трябва да съдържа само цифри 0–9 (4–8 цифри).',
        }),
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
          characterDeleteCode: mode === 'register' ? characterDeleteCode : undefined,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatusMessage({
          type: 'error',
          text:
            response.status === 401
              ? L(lang, {
                  en: 'Invalid account username or password.',
                  th: 'ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง',
                  pt: 'Usuário ou senha incorretos.',
                  ru: 'Неверный логин или пароль.',
                  es: 'Nombre de cuenta o contraseña incorrectos.',
                  bg: 'Невалидно потребителско име или парола.',
                })
              : response.status === 409
              ? L(lang, {
                  en: `Account "${cleanUser}" already exists.`,
                  th: `ชื่อบัญชี "${cleanUser}" มีอยู่ในระบบแล้ว`,
                  pt: `A conta "${cleanUser}" já existe.`,
                  ru: `Аккаунт "${cleanUser}" уже существует.`,
                  es: `La cuenta "${cleanUser}" ya existe.`,
                  bg: `Акаунтът "${cleanUser}" вече съществува.`,
                })
              : data.message ||
                L(lang, {
                  en: 'Authentication failed. Please check your details.',
                  th: 'การทำรายการล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง',
                  pt: 'Falha na autenticação. Verifique seus dados.',
                  ru: 'Ошибка авторизации. Проверьте введённые данные.',
                  es: 'Error de autenticación. Verifica tus datos.',
                  bg: 'Неуспешно удостоверяване. Проверете данните си.',
                }),
        });
        handleResetTurnstile();
        setIsSubmitting(false);
        return;
      }

      setStatusMessage({
        type: 'success',
        text:
          mode === 'login'
            ? L(lang, {
                en: `Welcome back, ${data.account?.loginName || cleanUser}! Signing in...`,
                th: `ยินดีต้อนรับ ${data.account?.loginName || cleanUser} เข้าสู่ระบบสำเร็จ!`,
                pt: `Bem-vindo, ${data.account?.loginName || cleanUser}! Entrando...`,
                ru: `Добро пожаловать, ${data.account?.loginName || cleanUser}! Вход выполнен...`,
                es: `¡Bienvenido, ${data.account?.loginName || cleanUser}! Iniciando sesión...`,
                bg: `Добре дошли, ${data.account?.loginName || cleanUser}! Влизане...`,
              })
            : L(lang, {
                en: `Account "${cleanUser}" created successfully! Signing in...`,
                th: `ลงทะเบียนบัญชี "${cleanUser}" สำเร็จ! กำลังเข้าสู่ระบบ...`,
                pt: `Conta "${cleanUser}" criada com sucesso! Entrando...`,
                ru: `Аккаунт "${cleanUser}" успешно создан! Выполняется вход...`,
                es: `¡Cuenta "${cleanUser}" creada con éxito! Iniciando sesión...`,
                bg: `Акаунтът "${cleanUser}" е създаден успешно! Влизане...`,
              }),
      });

      setTimeout(() => {
        onLoginSuccess(data.account?.loginName || cleanUser, data.account);
      }, 350);
    } catch {
      setStatusMessage({
        type: 'error',
        text: L(lang, {
          en: 'Unable to reach server. Please try again.',
          th: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
          pt: 'Não foi possível conectar ao servidor. Tente novamente.',
          ru: 'Не удалось связаться с сервером. Попробуйте снова.',
          es: 'No se pudo conectar con el servidor. Inténtalo de nuevo.',
          bg: 'Няма връзка със сървъра. Моля, опитайте отново.',
        }),
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
      <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {isModal && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer z-10"
            aria-label={L(lang, {
              en: 'Close',
              th: 'ปิดหน้าต่าง',
              pt: 'Fechar',
              ru: 'Закрыть',
              es: 'Cerrar',
              bg: 'Затвори',
            })}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Section with Egis-MU Emblem */}
          <div className="text-center space-y-2.5">
            <div className="w-36 sm:w-44 aspect-[4/3] mx-auto rounded-lg overflow-hidden border border-amber-500/30 bg-[#0c0504] shadow-lg">
              <img
                src={EGIS_MU_LOGO_URL}
                alt="Egis-MU WEBSHOP Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-wide">
              {mode === 'login'
                ? L(lang, {
                    en: 'Sign In to Egis-MU WEBSHOP',
                    th: 'เข้าสู่ระบบ Egis-MU WEBSHOP',
                    pt: 'Entrar no Egis-MU WEBSHOP',
                    ru: 'Вход в Egis-MU WEBSHOP',
                    es: 'Iniciar Sesión en Egis-MU WEBSHOP',
                    bg: 'Вход в Egis-MU WEBSHOP',
                  })
                : L(lang, {
                    en: 'Register Egis-MU Account',
                    th: 'ลงทะเบียนบัญชี Egis-MU WEBSHOP',
                    pt: 'Criar Conta no Egis-MU WEBSHOP',
                    ru: 'Регистрация в Egis-MU WEBSHOP',
                    es: 'Registrar Cuenta en Egis-MU WEBSHOP',
                    bg: 'Регистрация в Egis-MU WEBSHOP',
                  })}
            </h1>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {L(lang, {
                en: 'Continent of Egis-MU S6E3 · Protected by Cloudflare Turnstile & BCrypt',
                th: 'Continent of Egis-MU S6E3 · ระบบยืนยันตัวตนความปลอดภัยสูงด้วย Cloudflare Turnstile และ BCrypt',
                pt: 'Continent of Egis-MU S6E3 · Protegido por Cloudflare Turnstile e BCrypt',
                ru: 'Continent of Egis-MU S6E3 · Защита Cloudflare Turnstile и BCrypt',
                es: 'Continent of Egis-MU S6E3 · Protegido por Cloudflare Turnstile y BCrypt',
                bg: 'Continent of Egis-MU S6E3 · Защита с Cloudflare Turnstile и BCrypt',
              })}
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
              <span>
                {L(lang, {
                  en: 'Sign In',
                  th: 'เข้าสู่ระบบ',
                  pt: 'Entrar',
                  ru: 'Войти',
                  es: 'Iniciar Sesión',
                  bg: 'Вход',
                })}
              </span>
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
              <span>
                {L(lang, {
                  en: 'Register',
                  th: 'ลงทะเบียนใหม่',
                  pt: 'Cadastrar',
                  ru: 'Регистрация',
                  es: 'Registrarse',
                  bg: 'Регистрация',
                })}
              </span>
            </button>
          </div>

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
                  <span>
                    {L(lang, {
                      en: 'Account ID (LoginName)',
                      th: 'ชื่อบัญชี (Account ID)',
                      pt: 'ID da Conta (Login)',
                      ru: 'Логин аккаунта (ID)',
                      es: 'ID de Cuenta (Login)',
                      bg: 'Потребителско име (ID)',
                    })}
                  </span>
                  <span className="text-rose-400">*</span>
                </label>
                <span
                  className={`text-[10px] font-mono-tabular ${
                    username.length >= 3 && username.length <= 10
                      ? 'text-emerald-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {username.length}/10
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={10}
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  placeholder={L(lang, {
                    en: 'Enter your game account ID',
                    th: 'กรอกชื่อบัญชีผู้ใช้ 3–10 ตัวอักษร',
                    pt: 'Digite seu login (3–10 caracteres)',
                    ru: 'Введите логин (3–10 символов)',
                    es: 'Ingresa tu ID de cuenta (3–10 caracteres)',
                    bg: 'Въведете акаунт ID (3–10 символа)',
                  })}
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
                <span>
                  {L(lang, {
                    en: '3–10 alphanumeric characters (a-z, 0-9)',
                    th: 'ความยาว 3–10 ตัวอักษรภาษาอังกฤษหรือตัวเลข (a-z, 0-9)',
                    pt: '3 a 10 caracteres alfanuméricos (a-z, 0-9)',
                    ru: 'От 3 до 10 латинских символов или цифр (a-z, 0-9)',
                    es: '3 a 10 caracteres alfanuméricos (a-z, 0-9)',
                    bg: '3–10 латински букви или цифри (a-z, 0-9)',
                  })}
                </span>
              </div>
            </div>

            {/* Email Field (for Register Mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {L(lang, {
                        en: 'E-Mail Address',
                        th: 'อีเมล (E-Mail Address)',
                        pt: 'Endereço de E-Mail',
                        ru: 'Электронная почта (E-Mail)',
                        es: 'Correo Electrónico (E-Mail)',
                        bg: 'Имейл адрес (E-Mail)',
                      })}
                    </span>
                    <span className="text-rose-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
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
                  <span>
                    {L(lang, {
                      en: 'Password',
                      th: 'รหัสผ่าน (Password)',
                      pt: 'Senha',
                      ru: 'Пароль',
                      es: 'Contraseña',
                      bg: 'Парола',
                    })}
                  </span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-zinc-500">
                  {mode === 'register'
                    ? L(lang, {
                        en: 'Min. 6 characters',
                        th: 'อย่างน้อย 6 ตัวอักษร',
                        pt: 'Mín. 6 caracteres',
                        ru: 'Мин. 6 символов',
                        es: 'Mín. 6 caracteres',
                        bg: 'Мин. 6 символа',
                      })
                    : ''}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-zinc-900 border text-xs text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 ${
                    password && !isPasswordValidForMode
                      ? 'border-rose-500 focus:ring-rose-500'
                      : password && isPasswordValidForMode
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

            {/* Confirm Password & Numeric Character Delete Code Fields (for Register Mode) */}
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        {L(lang, {
                          en: 'Confirm Password',
                          th: 'ยืนยันรหัสผ่าน (Confirm Password)',
                          pt: 'Confirmar Senha',
                          ru: 'Подтвердите пароль',
                          es: 'Confirmar Contraseña',
                          bg: 'Потвърдете паролата',
                        })}
                      </span>
                      <span className="text-rose-400">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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

                {/* Numeric-only Character Delete Code Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {L(lang, {
                          en: 'Character Delete Code',
                          th: 'รหัสสำหรับลบตัวละคร (Character Delete Code)',
                          pt: 'Código para Excluir Personagem',
                          ru: 'Код удаления персонажа',
                          es: 'Código para Borrar Personaje',
                          bg: 'Код за изтриване на герой',
                        })}
                      </span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono-tabular ${
                        isDeleteCodeValid ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {characterDeleteCode.length}/8{' '}
                      {L(lang, {
                        en: 'digits (0-9)',
                        th: 'ตัวเลข (0-9 เท่านั้น)',
                        pt: 'dígitos (0-9)',
                        ru: 'цифр (0-9)',
                        es: 'dígitos (0-9)',
                        bg: 'цифри (0-9)',
                      })}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      value={characterDeleteCode}
                      onChange={(e) =>
                        setCharacterDeleteCode(
                          e.target.value.replace(/\D+/g, '').slice(0, 8)
                        )
                      }
                      placeholder={L(lang, {
                        en: 'Numbers only (4–8 digits)',
                        th: 'กรอกเฉพาะตัวเลข 0–9 (4–8 หลัก)',
                        pt: 'Apenas números (4–8 dígitos)',
                        ru: 'Только цифры 0–9 (4–8 цифр)',
                        es: 'Solo números (4–8 dígitos)',
                        bg: 'Само цифри (4–8 цифри)',
                      })}
                      required
                      disabled={isSubmitting}
                      className={`w-full pl-3.5 pr-9 py-2.5 rounded-lg bg-zinc-900 border font-mono-tabular tracking-widest text-xs text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 ${
                        characterDeleteCode && !isDeleteCodeValid
                          ? 'border-rose-500 focus:ring-rose-500'
                          : characterDeleteCode && isDeleteCodeValid
                          ? 'border-emerald-500/60 focus:ring-emerald-500'
                          : 'border-zinc-700 focus:border-amber-500 focus:ring-amber-500'
                      }`}
                    />
                    {characterDeleteCode && isDeleteCodeValid && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3 pointer-events-none" />
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {L(lang, {
                      en: 'Digits 0–9 only (4–8 digits). Required when deleting characters in-game or in WebShop.',
                      th: 'กรอกได้เฉพาะตัวเลข 0–9 เท่านั้น (4–8 หลัก) ใช้สำหรับยืนยันการลบตัวละครในเกมและบน WebShop',
                      pt: 'Apenas números de 0 a 9 (4–8 dígitos). Usado para confirmar exclusão de personagens no jogo e no WebShop.',
                      ru: 'Только цифры 0–9 (4–8 цифр). Используется для подтверждения удаления персонажей в игре и WebShop.',
                      es: 'Solo números 0–9 (4–8 dígitos). Se utiliza para confirmar la eliminación de personajes en el juego y WebShop.',
                      bg: 'Само цифри 0–9 (4–8 цифри). Използва се за потвърждение при изтриване на герои в играта и WebShop.',
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Cloudflare Turnstile Verification Box */}
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#f38020]" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Cloudflare Turnstile
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {turnstileToken ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {L(lang, {
                        en: 'Verified',
                        th: 'ยืนยันแล้ว',
                        pt: 'Verificado',
                        ru: 'Проверено',
                        es: 'Verificado',
                        bg: 'Потвърдено',
                      })}
                    </span>
                  ) : turnstileStatus === 'loading' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {L(lang, {
                        en: 'Verifying...',
                        th: 'กำลังตรวจสอบ...',
                        pt: 'Verificando...',
                        ru: 'Проверка...',
                        es: 'Verificando...',
                        bg: 'Проверка...',
                      })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400">
                      {L(lang, {
                        en: 'Required',
                        th: 'รอยืนยัน',
                        pt: 'Obrigatório',
                        ru: 'Требуется проверка',
                        es: 'Requerido',
                        bg: 'Изисква се',
                      })}
                    </span>
                  )}

                  {turnstileStatus === 'error' || turnstileStatus === 'expired' ? (
                    <button
                      type="button"
                      onClick={handleResetTurnstile}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>
                        {L(lang, {
                          en: 'Reload',
                          th: 'โหลดใหม่',
                          pt: 'Recarregar',
                          ru: 'Обновить',
                          es: 'Recargar',
                          bg: 'Презареди',
                        })}
                      </span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center min-h-[65px] py-1 bg-zinc-950/80 rounded border border-zinc-800/80">
                <div ref={turnstileContainerRef} id="cf-turnstile-container" />
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
                    <span>
                      {L(lang, {
                        en: 'Authenticating...',
                        th: 'กำลังตรวจสอบข้อมูล...',
                        pt: 'Autenticando...',
                        ru: 'Авторизация...',
                        es: 'Autenticando...',
                        bg: 'Удостоверяване...',
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login'
                        ? L(lang, {
                            en: 'Sign In',
                            th: 'เข้าสู่ระบบ',
                            pt: 'Entrar na Conta',
                            ru: 'Войти в аккаунт',
                            es: 'Iniciar Sesión',
                            bg: 'Вход в Акаунта',
                          })
                        : L(lang, {
                            en: 'Create Account',
                            th: 'ยืนยันลงทะเบียนบัญชีใหม่',
                            pt: 'Criar Nova Conta',
                            ru: 'Зарегистрировать аккаунт',
                            es: 'Crear Nueva Cuenta',
                            bg: 'Създай Нов Акаунт',
                          })}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Security Certifications */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                BCrypt Security
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Cloudflare Turnstile
              </span>
            </div>
            <div className="text-zinc-500 font-mono-tabular">
              Egis-MU S6E3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
