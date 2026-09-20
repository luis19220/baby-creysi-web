import { headers } from 'next/headers';
import { accountFromCookie } from './api/auth';
import Dashboard from './dashboard';
import Access from './access';
export const dynamic='force-dynamic';
export default async function Home(){
 try{
  const h=await headers();const user=await accountFromCookie(h.get('cookie'));
  return user?<Dashboard userName={user.nombre} role={user.rol}/>:<Access/>;
 }catch(e){console.error(e);return <main className="access-screen"><section className="access-card"><h1>Servicio temporalmente no disponible</h1><p>Inténtalo más tarde.</p></section></main>}
}
