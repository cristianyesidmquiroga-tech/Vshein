// Simple Analytics Tracker for Vshein
// Sent to the backend via fetch

document.addEventListener('DOMContentLoaded', () => {
    const session_id = Math.random().toString(36).substring(2, 15);
    let sectionTimers = {};

    // 1. Track Button Clicks (WhatsApp, Instagram, etc)
    const trackButtons = document.querySelectorAll('.track-click');
    trackButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target') || 'unknown';
            const item = btn.getAttribute('data-item') || 'none';
            
            // Enviamos el evento al servidor
            sendAnalyticsEvent('click', `${target}_${item}`);
        });
    });

    // 2. Track Dwell Time (Tiempo en cada sección) usando IntersectionObserver
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const sectionName = entry.target.getAttribute('data-section') || entry.target.id;
            
            if (entry.isIntersecting) {
                // Empezar a contar
                sectionTimers[sectionName] = Date.now();
            } else {
                // Terminó de ver esta sección
                if (sectionTimers[sectionName]) {
                    const timeSpent = Math.round((Date.now() - sectionTimers[sectionName]) / 1000); // en segundos
                    if (timeSpent > 2) { // Solo registrar si estuvo más de 2 segundos
                        sendAnalyticsEvent('dwell_time', sectionName, timeSpent);
                    }
                    delete sectionTimers[sectionName];
                }
            }
        });
    }, { threshold: 0.5 }); // Cuando el 50% de la sección es visible

    sections.forEach(sec => observer.observe(sec));

    // Función para enviar los datos al backend (se conectará a app/routes/public.py luego)
    function sendAnalyticsEvent(eventType, elementId, duration = null) {
        console.log(`[Analytics Agent] Event: ${eventType}, Element: ${elementId}, Duration: ${duration}s`);
        
        // Descomentado: Enviando evento al backend real
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_type: eventType,
                element_id: elementId,
                duration: duration,
                session_id: session_id
            })
        });
    }
});
