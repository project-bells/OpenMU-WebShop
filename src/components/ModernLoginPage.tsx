import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { LanguageCode } from '../types/webshop';
import { L } from '../translations';
import { apiFetch, setCsrfToken } from '../utils/apiClient';

interface ModernLoginPageProps {
  onLoginSuccess: (cleanUsername: string, accountRecord?: any) => void;
  onCancel?: () => void;
  lang?: LanguageCode;
  isModal?: boolean;
}

export const ModernLoginPage: React.FC<ModernLoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  lang = 'Thai',
  isModal = false,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success' | 'info';
    text: string;
  } | null>(null);

  const isUsernameValid = username.trim().length >= 3 && username.trim().length <= 10;
  const isPasswordValid = password.length >= 4;
  const isFormValid = isUsernameValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

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

    setIsSubmitting(true);
    const cleanUser = username.trim();

    try {
      const response = await apiFetch('/api/openmu/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginName: cleanUser,
          password,
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
        setIsSubmitting(false);
        return;
      }

      setCsrfToken(data.csrfToken);

      setStatusMessage({
        type: 'success',
        text: L(lang, {
          en: `Welcome back, ${data.account?.loginName || cleanUser}! Signing in...`,
          th: `ยินดีต้อนรับ ${data.account?.loginName || cleanUser} เข้าสู่ระบบสำเร็จ!`,
          pt: `Bem-vindo, ${data.account?.loginName || cleanUser}! Entrando...`,
          ru: `Добро пожаловать, ${data.account?.loginName || cleanUser}! Вход выполнен...`,
          es: `¡Bienvenido, ${data.account?.loginName || cleanUser}! Iniciando sesión...`,
          bg: `Добре дошли, ${data.account?.loginName || cleanUser}! Влизане...`,
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
      className={`relative w-full ${
        isModal
          ? 'max-w-xl mx-auto p-4 sm:p-6'
          : 'max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6'
      }`}
    >
      {/* Hero Header matching muorigins.online */}
      {!isModal && (
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="text-xs font-semibold tracking-widest text-amber-400/90">
            {L(lang, {
              en: 'Season 6 Episode 3 · Player Portal & WebShop',
              th: 'Season 6 Episode 3 · ระบบจัดการบัญชีและคลังไอเทม',
              pt: 'Season 6 Episode 3 · Portal do Jogador',
              ru: 'Season 6 Episode 3 · Портал Игрока',
              es: 'Season 6 Episode 3 · Portal del Jugador',
              bg: 'Season 6 Episode 3 · Портал на Играча',
            })}
          </div>
          <h1
            className="font-display mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl"
            style={{ textWrap: 'balance' }}
          >
            MU <span className="text-gradient-gold">ORIGINS</span>
          </h1>
          <p className="mt-3 text-sm text-white/65 sm:text-base leading-relaxed">
            {L(lang, {
              en: 'Legends Never Die — Authenticate with your OpenMU game account to access your 8×15 Warehouse Vault, Character Services, and Credits.',
              th: 'ตำนานไม่มีวันตาย — เข้าสู่ระบบด้วยไอดีเกม OpenMU เพื่อใช้งานคลังเก็บของ 8×15 จัดการตัวละคร และระบบเครดิต',
              pt: 'Lendas Nunca Morrem — Entre com sua conta OpenMU para acessar seu Baú 8×15, Personagens e Créditos.',
              ru: 'Легенды не умирают — Войдите с помощью аккаунта OpenMU для доступа к сундуку 8×15 и персонажам.',
              es: 'Las Leyendas Nunca Mueren — Inicia sesión con tu cuenta OpenMU para acceder a tu Baúl 8×15 y Personajes.',
              bg: 'Легендите не умират — Влезте с вашия OpenMU акаунт за достъп до сандъка 8×15 и героите.',
            })}
          </p>
        </div>
      )}

      {/* Main Fantasy Glass Card matching muorigins.online */}
      <div className="fantasy-panel gold-border relative mx-auto max-w-xl rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)]">
        {isModal && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
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

        <div className="space-y-6">
          {/* Card Title */}
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide">
              {L(lang, {
                en: 'Account Sign In',
                th: 'เข้าสู่ระบบบัญชีผู้เล่น',
                pt: 'Entrar na Conta',
                ru: 'Вход в Аккаунт',
                es: 'Iniciar Sesión',
                bg: 'Вход в Акаунта',
              })}
            </h2>
            <p className="text-xs text-white/55">
              {L(lang, {
                en: 'Connect to OpenMU S6E3 Core via BCrypt Gateway',
                th: 'เชื่อมต่อฐานข้อมูล OpenMU S6E3 ด้วยการเข้ารหัส BCrypt',
                pt: 'Conecte-se ao núcleo OpenMU S6E3 via BCrypt',
                ru: 'Подключение к ядру OpenMU S6E3 через BCrypt',
                es: 'Conéctate al núcleo OpenMU S6E3 mediante BCrypt',
                bg: 'Свързване към OpenMU S6E3 чрез BCrypt',
              })}
            </p>
          </div>

          {/* Status Banners */}
          {statusMessage && (
            <div
              role="alert"
              className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium transition-all ${
                statusMessage.type === 'error'
                  ? 'border-red-500/30 bg-red-500/10 text-red-200'
                  : statusMessage.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              }`}
            >
              {statusMessage.type === 'error' && (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'info' && (
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-white/85">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {L(lang, {
                      en: 'Account ID (LoginName)',
                      th: 'ไอดีผู้เล่น (Account ID)',
                      pt: 'ID da Conta (Login)',
                      ru: 'Логин аккаунта (ID)',
                      es: 'ID de Cuenta (Login)',
                      bg: 'Потребителско име (ID)',
                    })}
                  </span>
                </label>
                <span
                  className={`font-mono-tabular text-[11px] ${
                    username.length >= 3 && username.length <= 10
                      ? 'text-emerald-400'
                      : 'text-white/40'
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
                    en: 'Enter your 3–10 character ID',
                    th: 'กรอกไอดีเกม 3–10 ตัวอักษร',
                    pt: 'Digite seu login (3–10 caracteres)',
                    ru: 'Введите логин (3–10 символов)',
                    es: 'Ingresa tu ID de cuenta (3–10 caracteres)',
                    bg: 'Въведете акаунт ID (3–10 символа)',
                  })}
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-4 pr-10 py-3 rounded-xl bg-[#090d16]/90 border text-sm text-white placeholder-white/35 transition-colors focus:outline-none focus:ring-1 ${
                    username && !isUsernameValid
                      ? 'border-red-500/70 focus:ring-red-500'
                      : username && isUsernameValid
                      ? 'border-emerald-500/60 focus:ring-emerald-500'
                      : 'border-white/15 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
                  }`}
                />
                {username && isUsernameValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3.5 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-white/85">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
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
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-4 pr-11 py-3 rounded-xl bg-[#090d16]/90 border text-sm text-white placeholder-white/35 transition-colors focus:outline-none focus:ring-1 ${
                    password && !isPasswordValid
                      ? 'border-red-500/70 focus:ring-red-500'
                      : password && isPasswordValid
                      ? 'border-emerald-500/60 focus:ring-emerald-500'
                      : 'border-white/15 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 p-1 text-white/45 hover:text-white transition-colors cursor-pointer"
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

            {/* Submit Button — Exact muorigins.online Gold Gradient CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`btn-shine relative flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black transition-all whitespace-nowrap ${
                  !isFormValid || isSubmitting
                    ? 'bg-white/5 text-white/35 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] shadow-[0_12px_40px_-8px_rgba(212,175,55,0.45)] hover:brightness-110 cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {L(lang, {
                        en: 'Connecting to OpenMU Core…',
                        th: 'กำลังเชื่อมต่อระบบ OpenMU Core…',
                        pt: 'Conectando ao OpenMU Core…',
                        ru: 'Подключение к OpenMU Core…',
                        es: 'Conectando a OpenMU Core…',
                        bg: 'Свързване към OpenMU Core…',
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {L(lang, {
                        en: 'Sign In to Mu Origins',
                        th: 'เข้าสู่ระบบ Mu Origins',
                        pt: 'Entrar no Mu Origins',
                        ru: 'Войти в Mu Origins',
                        es: 'Iniciar Sesión en Mu Origins',
                        bg: 'Вход в Mu Origins',
                      })}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer info matching muorigins.online */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OpenMU S6E3 · BCrypt Security</span>
            </span>
            <a
              href="https://muorigins.online/"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400/90 hover:text-amber-300 hover:underline font-medium transition-colors"
            >
              muorigins.online →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
