'use client';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de privacidad
          </h1>
          <div className="w-24 h-1 bg-red-600 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              SHINGARI SUSHI SL garantitza el pleno cumplimiento de la normativa de Protección de datos de carácter personal y, de acuerdo con la LO 15/1999, de 13 de diciembre, el cliente/usuario queda informado y presta su consentimiento para que sus datos puedan ser tratadas e incorporadas a los ficheros automatizados de la empresa.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              El cliente/usuario acepta que sus datos puedan ser cedidos exclusivamente para las finalidades a que se refiere el párrafo primero y para poder prestar los servicios corporativos con finalidades estrictamente de información empresarial. Esta aceptación siempre tiene carácter revocable, sin efectos retroactivos, de acuerdo con aquello que disponen los artículos 6 y 11 de la LO 15/1999 de 13 de diciembre.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Esta política de privacitat asegura el ejercicio de los derechos de acceso, rectificación, cancelación, información y oposición, en los términos establecidos a la legislación vigente, y el usuario puede utilizar cualquier canal de comunicación.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
