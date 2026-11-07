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
          {/* Header Section (No Logo) */}
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-wide">
              {L(lang, {
                en: 'Sign In to Mu Origins',
                th: 'เข้าสู่ระบบ Mu Origins',
                pt: 'Entrar no Mu Origins',
                ru: 'Вход в Mu Origins',
                es: 'Iniciar Sesión en Mu Origins',
                bg: 'Вход в Mu Origins',
              })}
            </h1>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {L(lang, {
                en: 'Continent of Mu Origins S6E3 · Protected by BCrypt Authentication',
                th: 'Continent of Mu Origins S6E3 · ระบบยืนยันตัวตนความปลอดภัยสูงด้วย BCrypt',
                pt: 'Continent of Mu Origins S6E3 · Protegido por Autenticação BCrypt',
                ru: 'Continent of Mu Origins S6E3 · Защита BCrypt',
                es: 'Continent of Mu Origins S6E3 · Protegido por Autenticación BCrypt',
                bg: 'Continent of Mu Origins S6E3 · Защита с BCrypt',
              })}
            </p>
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
                      {L(lang, {
                        en: 'Sign In',
                        th: 'เข้าสู่ระบบ',
                        pt: 'Entrar na Conta',
                        ru: 'Войти в аккаунт',
                        es: 'Iniciar Sesión',
                        bg: 'Вход в Акаунта',
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
            </div>
            <div className="text-zinc-500 font-mono-tabular">
              Mu Origins S6E3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
