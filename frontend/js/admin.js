const API='https://food-tracker-isz1.onrender.com/api';
const token=localStorage.getItem('foodToken');
const current=JSON.parse(localStorage.getItem('foodUser')||'null');

if(!token || !current || current.role!=='admin'){
  alert('Admin access required');
  location.href='dashboard.html';
}

const auth={Authorization:'Bearer '+token};
const $=id=>document.getElementById(id);
let loading=false;

async function api(path,options={}){
  const r=await fetch(API+path,{...options,headers:{...auth,...(options.headers||{})}});
  const contentType=r.headers.get('content-type')||'';
  const j=contentType.includes('application/json') ? await r.json() : {};
  if(!r.ok) throw Error(j.error||`Request failed (${r.status})`);
  return j;
}

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function load(){
  if(loading)return;
  loading=true;
  try{
    const [s,users,meals]=await Promise.all([
      api('/admin/stats'),
      api('/admin/users'),
      api('/admin/meals')
    ]);

    $('stats').innerHTML=`
      <div class="statbox">Users <b>${s.total_users}</b></div>
      <div class="statbox">Records <b>${s.total_records}</b></div>
      <div class="statbox">Breakfast <b>${s.breakfasts}</b></div>
      <div class="statbox">Lunch <b>${s.lunches}</b></div>
      <div class="statbox">Dinner <b>${s.dinners}</b></div>
      <div class="statbox">Snacks <b>${s.snacks}</b></div>`;

    $('users').innerHTML=users.map(u=>`
      <tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td>
      <td><select onchange="changeRole('${u.id}',this.value)">
        <option value="user" ${u.role==='user'?'selected':''}>user</option>
        <option value="admin" ${u.role==='admin'?'selected':''}>admin</option>
      </select></td><td>${u.records}</td>
      <td><button onclick="deleteUser('${u.id}')">Delete</button></td></tr>`).join('') || '<tr><td colspan="5">No users</td></tr>';

    $('meals').innerHTML=meals.map(m=>`
      <tr><td>${esc(m.meal_date)}</td><td>${esc(m.name)}<br><small>${esc(m.email)}</small></td>
      <td>${m.breakfast?'✅':'—'}</td><td>${m.lunch?'✅':'—'}</td><td>${m.dinner?'✅':'—'}</td><td>${m.snacks?'✅':'—'}</td>
      <td>${esc(m.notes)}</td><td><button onclick="deleteMeal('${m.id}')">Delete</button></td></tr>`).join('') || '<tr><td colspan="8">No records</td></tr>';

    $('lastUpdated').textContent='Last updated: '+new Date().toLocaleTimeString();
    $('msg').textContent='';
  }catch(e){
    console.error(e);
    $('msg').textContent=e.message;
    $('msg').className='err';
  }finally{loading=false;}
}

window.changeRole=async(id,role)=>{
  try{await api('/admin/users/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({role})});await load();}
  catch(e){alert(e.message);await load();}
};

window.deleteUser=async id=>{
  if(!confirm('Delete this user and all their meal records?'))return;
  try{await api('/admin/users/'+id,{method:'DELETE'});await load();}
  catch(e){alert(e.message);}
};

window.deleteMeal=async id=>{
  if(!confirm('Delete this meal record?'))return;
  try{await api('/admin/meals/'+id,{method:'DELETE'});await load();}
  catch(e){alert(e.message);}
};

$('createUser').onsubmit=async e=>{
  e.preventDefault();
  try{
    await api('/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      name:$('newName').value.trim(),email:$('newEmail').value.trim(),password:$('newPassword').value,role:$('newRole').value
    })});
    e.target.reset();
    $('msg').textContent='User created ✓';
    $('msg').className='ok';
    await load();
  }catch(err){$('msg').textContent=err.message;$('msg').className='err';}
};

$('refresh').onclick=load;

$('exportAll').onclick=async()=>{
  try{
    $('exportAll').disabled=true;
    $('exportAll').textContent='Preparing Excel...';
    const r=await fetch(API+'/export/all',{headers:auth});
    if(!r.ok){
      const j=await r.json().catch(()=>({}));
      throw new Error(j.error||`Export failed (${r.status})`);
    }
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download='food-tracker-all-users.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }catch(e){alert(e.message);}
  finally{
    $('exportAll').disabled=false;
    $('exportAll').textContent='📊 Export All Users to Excel';
  }
};

$('logout').onclick=()=>{localStorage.clear();location.href='login.html';};

load();
// Automatically refresh so admin sees new user meal updates.
setInterval(load,10000);
