import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'PER · Cuaderno de exámenes',description:'Practica con preguntas de navegación y repasa tus resultados.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
