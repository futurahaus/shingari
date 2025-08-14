'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/app/ui/components/Button';
import { FaCookieBite } from 'react-icons/fa';
import { Text } from '@/app/ui/components/Text';
import { useRouter } from 'next/navigation';

const CookieBanner: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Mostrar el banner después de 1 segundo
        const timer = setTimeout(() => {
            const hasAcceptedCookies = localStorage.getItem('shingari_cookies_accepted');
            if (!hasAcceptedCookies) {
                setIsVisible(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleAcceptCookies = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('shingari_cookies_accepted', 'true');
        // Aquí puedes agregar lógica adicional cuando el usuario acepta las cookies
        // Por ejemplo, cargar Google Analytics, etc.
    };

    const handleConfigCookies = () => {
        setIsVisible(false);
        setIsDismissed(true);
        router.push('/cookie-policy');
    };

    if (!isVisible || isDismissed) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
            <div className="bg-gray-100 shadow-xl p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Contenido del banner */}
                        <div className="flex-2">
                            <div className="flex items-start gap-3">
                                {/* Icono de cookies */}
                                <div className="flex-shrink-0 mt-1">
                                    <FaCookieBite size={24} color="black" />
                                </div>

                                {/* Texto del banner */}
                                <div className="flex-1">
                                    <Text size="lg" weight="semibold" color='gray-900' className='mb-2'>
                                        {t('cookie_banner.title')}
                                    </Text>
                                    <Text size="sm" color='gray-900' className='mb-3'>
                                        {t('cookie_banner.description')}
                                    </Text>
                                    <ul className="text-sm text-gray-900 opacity-90 mb-3">
                                        <li><Text size="sm" color='gray-900'>• {t('cookie_banner.analytics')}</Text></li>
                                        <li><Text size="sm" color='gray-900'>• {t('cookie_banner.personalization')}</Text></li>
                                        <li><Text size="sm" color='gray-900'>• {t('cookie_banner.marketing')}</Text></li>
                                    </ul>
                                    <Text size="sm" color='gray-900'>
                                        {t('cookie_banner.accept_text')}
                                    </Text>
                                    <Text size="sm" color='gray-900' className='mb-3'>
                                        {t('cookie_banner.accept_text_2')}
                                    </Text>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-row flex-1 gap-3">
                            <Button
                                onPress={handleConfigCookies}
                                type="tertiary"
                                text={t('cookie_banner.config_cookies')}
                                testID="cookie-reject-button"
                                size="md"
                            />
                            <Button
                                onPress={handleAcceptCookies}
                                type="primary"
                                text={t('cookie_banner.accept_button')}
                                testID="cookie-accept-button"
                                size="md"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner; 