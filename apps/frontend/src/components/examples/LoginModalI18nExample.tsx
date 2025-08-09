// Example demonstrating how the login modal works with internationalization

import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { FaTimes } from 'react-icons/fa';

export function LoginModalI18nExample() {
  const { locale, setLocale } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const authTranslations = {
    es: {
      login_title: "Inicia sesión",
      login_button: "Inicia Sesión",
      logging_in: "Iniciando sesión...",
      register_button: "Regístrate",
      registering: "Registrando...",
      email_label: "Correo electrónico",
      email_placeholder: "tu@email.com",
      password_label: "Contraseña",
      password_placeholder: "Tu contraseña",
      forgot_password_link: "¿Has olvidado la contraseña?",
      not_registered: "¿Aún no estás registrado?",
      close_modal: "Cerrar modal",
      login_error: "Error al iniciar sesión",
      register_error: "Error al registrar usuario"
    },
    zh: {
      login_title: "登录",
      login_button: "登录",
      logging_in: "登录中...",
      register_button: "注册",
      registering: "注册中...",
      email_label: "电子邮箱",
      email_placeholder: "your@email.com",
      password_label: "密码",
      password_placeholder: "您的密码",
      forgot_password_link: "忘记密码？",
      not_registered: "还没有注册？",
      close_modal: "关闭模态框",
      login_error: "登录错误",
      register_error: "注册用户错误"
    }
  };

  const currentTranslations = authTranslations[locale as keyof typeof authTranslations] || authTranslations.es;

  const handleDemoLogin = () => {
    setIsLoadingLogin(true);
    setError('');
    setSuccessMessage('');
    
    setTimeout(() => {
      if (formData.email && formData.password) {
        setSuccessMessage('Demo login successful!');
        setFormData({ email: '', password: '' });
      } else {
        setError(currentTranslations.login_error);
      }
      setIsLoadingLogin(false);
    }, 1500);
  };

  const handleDemoRegister = () => {
    setIsLoadingRegister(true);
    setError('');
    setSuccessMessage('');
    
    setTimeout(() => {
      if (formData.email && formData.password) {
        setSuccessMessage('Demo registration successful!');
        setFormData({ email: '', password: '' });
      } else {
        setError(currentTranslations.register_error);
      }
      setIsLoadingRegister(false);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Login Modal Internationalization Demo</h2>
        <p className="text-gray-600 mb-4">
          Current locale: <strong>{locale}</strong>
        </p>
        
        {/* Locale switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLocale('es')}
            className={`px-4 py-2 rounded ${
              locale === 'es' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Español
          </button>
          <button
            onClick={() => setLocale('zh')}
            className={`px-4 py-2 rounded ${
              locale === 'zh' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            中文
          </button>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded p-4 mb-6">
          <p className="text-purple-800">
            <strong>🔐 Auth Modal I18n:</strong> All authentication modal texts are now internationalized.
          </p>
          <p className="text-purple-600 text-sm mt-1">
            The modal includes form labels, buttons, error messages, and loading states in multiple languages.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Open Login Modal Demo
        </button>
      </div>

      {/* Modal Demo */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg w-full max-w-md">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={currentTranslations.close_modal}
            >
              <FaTimes className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                {currentTranslations.login_title}
              </h2>
              
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 px-4 py-3 rounded relative" role="alert">
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 px-4 py-3 rounded relative" role="alert">
                    <span className="text-green-600 text-sm">{successMessage}</span>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentTranslations.email_label}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={currentTranslations.email_placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoadingLogin || isLoadingRegister}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentTranslations.password_label}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={currentTranslations.password_placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoadingLogin || isLoadingRegister}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? '👁️‍🗨️' : '👁️'}
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-blue-500"
                  >
                    {currentTranslations.forgot_password_link}
                  </button>
                </div>
                
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoadingLogin || isLoadingRegister}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingLogin ? currentTranslations.logging_in : currentTranslations.login_button}
                </button>
              </div>

              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <p className="text-gray-600">
                    {currentTranslations.not_registered}
                  </p>
                </div>
                <button
                  onClick={handleDemoRegister}
                  disabled={isLoadingLogin || isLoadingRegister}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingRegister ? currentTranslations.registering : currentTranslations.register_button}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Translation Keys */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold mb-4">🔧 Auth Modal Translation Keys</h4>
          <div className="space-y-2 text-sm">
            {Object.keys(currentTranslations).map(key => (
              <div key={key} className="flex flex-col gap-1 p-2 bg-white rounded">
                <code className="text-blue-600 text-xs">auth.{key}</code>
                <span className="text-gray-800">{currentTranslations[key as keyof typeof currentTranslations]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Features */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-bold mb-4 text-blue-800">✨ I18n Features</h4>
          <div className="space-y-3 text-sm text-blue-700">
            <div>
              <strong>Dynamic Loading States:</strong>
              <div className="text-xs mt-1">
                ES: &quot;Iniciando sesión...&quot; / &quot;Registrando...&quot;<br/>
                ZH: &quot;登录中...&quot; / &quot;注册中...&quot;
              </div>
            </div>
            <div>
              <strong>Contextual Placeholders:</strong>
              <div className="text-xs mt-1">
                ES: &quot;tu@email.com&quot; / &quot;Tu contraseña&quot;<br/>
                ZH: &quot;your@email.com&quot; / &quot;您的密码&quot;
              </div>
            </div>
            <div>
              <strong>Error Messages:</strong>
              <div className="text-xs mt-1">
                Localized error and success messages
              </div>
            </div>
            <div>
              <strong>Accessibility:</strong>
              <div className="text-xs mt-1">
                ARIA labels respect locale
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Implementation */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded p-4">
        <h4 className="font-semibold mb-2 text-green-800">📋 Implementation Highlights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <strong>Dynamic Button States:</strong>
            <code className="block text-xs mt-1 bg-white p-1 rounded">
              {`{isLoadingLogin ? t('auth.logging_in') : t('auth.login_button')}`}
            </code>
          </div>
          <div>
            <strong>Error Handling:</strong>
            <code className="block text-xs mt-1 bg-white p-1 rounded">
              {`throw new Error(data.message || t('auth.login_error'))`}
            </code>
          </div>
          <div>
            <strong>Form Labels:</strong>
            <code className="block text-xs mt-1 bg-white p-1 rounded">
              {`<Input label={t('auth.email_label')} />`}
            </code>
          </div>
          <div>
            <strong>Accessibility:</strong>
            <code className="block text-xs mt-1 bg-white p-1 rounded">
              {`aria-label={t('auth.close_modal')}`}
            </code>
          </div>
        </div>
      </div>

      {/* State Management */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
        <h4 className="font-semibold mb-2 text-yellow-800">🎛️ Dynamic State Management</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-700">
          <div>
            <strong>Loading States:</strong>
            <ul className="text-xs mt-1 space-y-1">
              <li>• Login: {currentTranslations.logging_in}</li>
              <li>• Register: {currentTranslations.registering}</li>
            </ul>
          </div>
          <div>
            <strong>Error Messages:</strong>
            <ul className="text-xs mt-1 space-y-1">
              <li>• Login: {currentTranslations.login_error}</li>
              <li>• Register: {currentTranslations.register_error}</li>
            </ul>
          </div>
          <div>
            <strong>Form Elements:</strong>
            <ul className="text-xs mt-1 space-y-1">
              <li>• Email: {currentTranslations.email_placeholder}</li>
              <li>• Password: {currentTranslations.password_placeholder}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 bg-cyan-50 border border-cyan-200 rounded p-4">
        <h4 className="font-semibold mb-2 text-cyan-800">🎯 User Experience Benefits</h4>
        <ul className="text-sm text-cyan-700 space-y-1">
          <li>• <strong>Instant localization:</strong> Modal updates immediately when language changes</li>
          <li>• <strong>Contextual feedback:</strong> Error messages and loading states in user&apos;s language</li>
          <li>• <strong>Cultural placeholders:</strong> Form hints adapted to cultural conventions</li>
          <li>• <strong>Accessibility compliance:</strong> Screen readers receive localized labels</li>
          <li>• <strong>Professional presentation:</strong> Consistent language throughout auth flow</li>
          <li>• <strong>Reduced cognitive load:</strong> Users understand all interface elements immediately</li>
        </ul>
      </div>
    </div>
  );
}