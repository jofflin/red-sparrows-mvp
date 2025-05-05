import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			boxShadow: {
				'tsb': '0 4px 14px 0 rgba(59, 89, 152, 0.15)',
				'tsb-lg': '0 10px 25px -3px rgba(59, 89, 152, 0.15)',
				'tsb-yellow': '0 4px 14px 0 rgba(255, 215, 0, 0.25)',
			},
			keyframes: {
				'tsb-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'tsb-bounce': {
					'0%, 100%': { transform: 'translateY(-5%)' },
					'50%': { transform: 'translateY(0)' },
				},
			},
			animation: {
				'tsb-pulse': 'tsb-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'tsb-bounce': 'tsb-bounce 1s ease-in-out infinite',
			},
			colors: {
				primary: {
					'50': '##f1f3f4',
					'100': '##d5dbdd',
					'200': '#b8c3c6',
					'300': '#9cacaf',
					'400': '#809499',
					'500': '#293133', // TSB Primary Blue
					'600': '#809499',
					// '700': '#2c3e71',
					// '800': '#25335d',
					// '900': '#1f2a4d',
					// '950': '#141b32',
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					'50': '#ffeced',
					'100': '#fd505a',
					// '200': '#ffe699',
					// '300': '#ffd966',
					'400': '#DE020F', // TSB Secondary Yellow
					'500': '#af020c',
					'600': '#880109',
					'700': '#3a0104',
					'800': '#130001',
					// '900': '#806600',
					// '950': '#665200',
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			gridTemplateColumns: {
				'my-columns': '2fr 2fr 1fr'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
