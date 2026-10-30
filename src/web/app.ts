interface Booking {id:string;userId:string;roomId:string;start:string;end:string}
interface Room {id:string;name:string;capacity:number}
const user=document.querySelector<HTMLSelectElement>('#user')!;
const room=document.querySelector<HTMLSelectElement>('#room')!;
const form=document.querySelector<HTMLFormElement>('#booking-form')!;
const message=document.querySelector<HTMLParagraphElement>('#message')!;
const list=document.querySelector<HTMLDivElement>('#bookings')!;
const count=document.querySelector<HTMLSpanElement>('#count')!;
let rooms:Room[]=[];
async function api(path:string,method='GET',body?:unknown){
 const response=await fetch(`/api/v1${path}`,{method,headers:{'x-demo-user':user.value,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 if(response.status===204)return;
 const data=await response.json();if(!response.ok)throw new Error(data.error?.message??'Falha ao consultar o servidor.');return data;
}
function notify(error:unknown){message.textContent=error instanceof Error?error.message:'Não foi possível concluir a operação.';}
const date=(iso:string)=>new Date(iso).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
async function refresh(){
 const response=await api('/bookings');const bookings:Booking[]=response.data;
 list.replaceChildren();count.textContent=`${response.pagination.total} no total`;
 if(!bookings.length){const p=document.createElement('p');p.className='empty';p.textContent='Nenhuma reserva por aqui.';list.append(p);return;}
 for(const booking of bookings){
  const article=document.createElement('article');article.className='booking';article.dataset.testid='booking';
  const heading=document.createElement('h3');heading.textContent=rooms.find(r=>r.id===booking.roomId)?.name??booking.roomId;
  const time=document.createElement('p');time.textContent=`${date(booking.start)} → ${date(booking.end)}`;
  const owner=document.createElement('p');owner.textContent=`Reservado por ${booking.userId==='alice'?'Alice':'Bruno'}`;
  const cancel=document.createElement('button');cancel.textContent='Cancelar reserva';cancel.type='button';
  cancel.addEventListener('click',async()=>{cancel.disabled=true;try{await api(`/bookings/${booking.id}`,'DELETE');await refresh();message.textContent='Reserva cancelada.';}catch(error){notify(error);}finally{cancel.disabled=false;}});
  article.append(heading,time,owner,cancel);list.append(article);
 }
}
form.addEventListener('submit',async event=>{
 event.preventDefault();const submit=form.querySelector<HTMLButtonElement>('button[type=submit]')!;submit.disabled=true;
 try{const start=document.querySelector<HTMLInputElement>('#start')!.value;const end=document.querySelector<HTMLInputElement>('#end')!.value;
  await api('/bookings','POST',{roomId:room.value,start:new Date(start).toISOString(),end:new Date(end).toISOString()});await refresh();message.textContent='Reserva criada.';
 }catch(error){notify(error);}finally{submit.disabled=false;}
});
user.addEventListener('change',async()=>{try{await refresh();message.textContent='Usuário alterado.';}catch(error){notify(error);}});
try{rooms=(await api('/rooms')).data;room.replaceChildren();for(const r of rooms){const option=document.createElement('option');option.value=r.id;option.textContent=`${r.name} · ${r.capacity} pessoas`;room.append(option);}await refresh();}catch(error){notify(error);}
export {};
