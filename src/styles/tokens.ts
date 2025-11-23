export const tokens = {
    colors: {
        brand: {
            primary: '#E76F51',
            secondary: '#F4A261',
            accent: '#FFB5BA',
        },
        surface: {
            base: '#FDF8F5',
            card: '#FFFFFF',
            muted: '#F5F5F4',
            modal: '#FDF8F5',
        },
        text: {
            main: '#1F2937',
            muted: '#6B7280',
            inverse: '#FFFFFF',
        },
        border: {
            default: '#E5E5E5',
            focus: '#E76F51',
        },
        status: {
            success: '#95D5B2',
            error: '#E63946',
            warning: '#FFE066',
            info: '#74C0FC',
        },
    },
    typography: {
        fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            hand: ['Comic Sans MS', 'Chalkboard SE', 'Marker Felt', 'sans-serif'],
        },
        fontSize: {
            display: '30px', // text-3xl
            h1: '24px',      // text-2xl
            h2: '20px',      // text-xl
            body: '16px',    // text-base
            small: '14px',   // text-sm
            tiny: '12px',    // text-xs
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
    spacing: {
        section: '32px', // gap-8
        element: '16px', // gap-4
        inner: '24px',   // p-6
    },
    radius: {
        sm: '4px',    // rounded
        lg: '8px',    // rounded-lg
        xl: '12px',   // rounded-xl
        '2xl': '16px',// rounded-2xl
        '3xl': '24px',// rounded-3xl
        full: '9999px',
    },
    animation: {
        duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
            deliberate: '1000ms',
        },
        easing: {
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        },
    },
};
