'use client';

import { useTranslation } from '@/contexts/I18nContext';

const CookiePolicyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('cookie_policy.title')}
          </h1>
          <div className="w-24 h-1 bg-red-600 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              Las cookies o galletas son unos pequeños archivos de texto que se instalan a los equipos desde los cuals se accede a nuestro sitio web. Pueden guardar la identificación del usuario que visita el web y los lugares por los cuales navega. Cuando el usuario nos vuelve a visitar se leen las cookies para identificarlo y restablecer las preferencias y la configuración de navegación. Si un usuario no autoriza el uso de las cookies, algunos servicios o funcionalidades del sitio web podrían no estar disponibles.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Queremos que este lugar ofrezca un buen servicio y que sea fácil de utilizar. En este sentido, utilizamos cookies de Google Analytics. Esto nos permite:
            </p>

            <ul className="text-gray-700 leading-relaxed mb-6 space-y-2 list-disc pl-6">
              <li>Analizar estadísticamente la información a la cual acceden los usuarios a nuestro sitio web. Los datos recogidos pueden incluir la actividad del navegador del usuario cuando nos visita, la ruta que siguen los usuarios en nuestra web, información del proveedor de servicios de Internet del visitante, el número a veces que los usuarios acceden a la web y el comportamiento de los usuarios en nuestra web (páginas que han visitado, formularios que se han completado y similares).</li>
              <li>Identificar los usuarios que nos visitan desde la invitación de un sitio web asociado o de un enlace patrocinado.</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-6">
              Podéis obtener más información sobre Google Analytics a{' '}
              <a href="https://www.google.com/analytics/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                www.google.com/analytics/
              </a>
              . Para controlar la compilación de datos con finalidades analíticas por parte de Google Analytics, podéis ir a{' '}
              <a href="https://tools.google.com/dlpage/gaoptout?hl=en" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                https://tools.google.com/dlpage/gaoptout?hl=en
              </a>
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Les informamos que pueden impedir el registro de cookies configurando su navegador tal y como se indica a continuación:
            </p>
          </div>

          {/* Browser Instructions */}
          <div className="space-y-8">
            {/* Google Chrome */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                </svg>
                Google Chrome
              </h3>
              <ol className="text-blue-800 space-y-2 list-decimal pl-6">
                <li>Seleccionar el menú &quot;Herramientas&quot;, y a continuación &quot;Configuración&quot;.</li>
                <li>Hacer clic en &quot;Mostrar opciones avanzadas&quot; en la parte inferior de la página.</li>
                <li>En la sección &quot;Privacidad&quot;, hacer clic en &quot;Configuración de contenido&quot;.</li>
                <li>En la ventana emergente, localizar la sección &quot;Cookies&quot; y seleccionar la opción &quot;Bloquear los datos de sitios y las cookies de terceros&quot;.</li>
              </ol>
            </div>

            {/* Mozilla Firefox */}
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                </svg>
                Mozilla Firefox
              </h3>
              <ol className="text-orange-800 space-y-2 list-decimal pl-6">
                <li>Seleccionar el menú &quot;Herramientas&quot;, y a continuación &quot;Opciones&quot;.</li>
                <li>Hacer clic en el icono &quot;Privacidad&quot;.</li>
                <li>Seleccionar las opciones deseadas en el menú &quot;Historial&quot; y clicar en &quot;Usar una configuración personalizada para el historial&quot; (desmarcar todas las casillas).</li>
              </ol>
            </div>

            {/* Microsoft Internet Explorer */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                </svg>
                Microsoft Internet Explorer
              </h3>
              <ol className="text-blue-800 space-y-2 list-decimal pl-6">
                <li>Seleccionar el menú &quot;Herramientas&quot; (o &quot;Tools&quot;), y a continuación &quot;Opciones de Internet&quot; (o &quot;Internet Options&quot;).</li>
                <li>Hacer clic en la pestaña &quot;Privacidad&quot; (o &quot;Privacy&quot;).</li>
                <li>Seleccionar la Configuración para la zona de Internet (subir la barra de navegación hasta Bloquear todas las cookies).</li>
              </ol>
            </div>

            {/* Safari */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                </svg>
                Safari
              </h3>
              <ol className="text-gray-800 space-y-2 list-decimal pl-6">
                <li>Seleccionar el menú &quot;Edición&quot;, y a continuación &quot;Preferencias&quot;.</li>
                <li>Hacer clic en la pestaña &quot;Privacidad&quot;.</li>
                <li>Seleccionar en la sección &quot;Bloquear cookies&quot; la opción &quot;siempre&quot;.</li>
              </ol>
            </div>

            {/* Netscape 7.0 */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                </svg>
                Netscape 7.0
              </h3>
              <ol className="text-purple-800 space-y-2 list-decimal pl-6">
                <li>Seleccionar el menú &quot;Edición&quot;&gt;&quot;Preferencias&quot;.</li>
                <li>Privacidad y Seguridad.</li>
                <li>Sección Cookies (seleccionar la opción &quot;desactivar cookies&quot;).</li>
              </ol>
            </div>

            {/* Opera 19 */}
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                </svg>
                Opera 19
              </h3>
              <ol className="text-red-800 space-y-2 list-decimal pl-6">
                <li>Seleccionar el menú &quot;Configuración&quot;.</li>
                <li>Privacidad y seguridad.</li>
                <li>Sección Cookies (seleccionar Bloquear cookies de terceros y datos de sitio).</li>
              </ol>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Para más información sobre nuestra política de cookies:
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a
                href="mailto:privacy@shingari.com"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contactar por email
              </a>
              <a
                href="/contacto"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Página de contacto
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
