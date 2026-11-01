// SAVIA — Lógica de tienda (carrito, filtros, búsqueda, WhatsApp)
(function(){
  const cfg = window.CONFIG_PUBLICADA || {};
  const catalogo = window.CATALOGO_SAVIA || [];
  const estado = {
    carrito: JSON.parse(localStorage.getItem('savia_carrito') || '[]'),
    filtroCat: '',
    busqueda: '',
    pagina: 1,
    porPagina: 12
  };

  const $ = (sel)=>document.querySelector(sel);
  const $$ = (sel)=>Array.from(document.querySelectorAll(sel));

  // Formato precio COP
  function fmt(val){
    return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(val);
  }
  function dtoText(p, pOrig){
    if(!pOrig || pOrig<=p) return '';
    const d = Math.round(((pOrig-p)/pOrig)*100);
    return `-${d}%`;
  }

  // Guardar carrito
  function guardar(){
    localStorage.setItem('savia_carrito', JSON.stringify(estado.carrito));
    actualizarBadge();
  }

  function actualizarBadge(){
    const total = estado.carrito.reduce((a,i)=>a+i.qty,0);
    $('#cartCount') && ($('#cartCount').textContent = total);
    $('#floatingCartCount') && ($('#floatingCartCount').textContent = total);
  }

  function agregarAlCarrito(id, qty=1, color=null){
    const p = catalogo.find(x=>x.id===id);
    if(!p) return;
    const existente = estado.carrito.find(i=>i.id===id && i.color===color);
    if(existente) existente.qty += qty;
    else estado.carrito.push({id:p.id,n:p.n,p:p.p,img:(p.imgs&&p.imgs[0])||'',qty,color:color||Object.keys(p.color||{})[0]||''});
    guardar();
    // feedback visual
    const btn = $('#btnAdd');
    if(btn){ const txt=btn.textContent; btn.textContent='Agregado'; setTimeout(()=>btn.textContent=txt,900); }
  }

  function cambiarCantidad(id, delta){
    const item = estado.carrito.find(i=>i.id===id);
    if(!item) return;
    item.qty += delta;
    if(item.qty<=0) estado.carrito = estado.carrito.filter(i=>i.id!==id);
    guardar();
    renderCarrito();
  }

  function eliminarItem(id){
    estado.carrito = estado.carrito.filter(i=>i.id!==id);
    guardar();
    renderCarrito();
  }

  function renderCarrito(){
    const body=$('#cdItems'), empty=$('#cdEmpty'), totalBox=$('#cdTotal'), subtotal=$('#cdSubtotal');
    if(!body) return;
    body.innerHTML='';
    if(estado.carrito.length===0){
      empty.style.display='block'; totalBox.style.display='none';
      return;
    }
    empty.style.display='none'; totalBox.style.display='block';
    let subt=0;
    estado.carrito.forEach(item=>{
      subt += item.p*item.qty;
      const el=document.createElement('div');
      el.className='cd-item';
      el.innerHTML = `
        <div class="cd-i-img" style="--img:url('${item.img}')"></div>
        <div class="cd-i-info">
          <div class="cd-i-nom" title="${item.n}">${item.n}</div>
          <div class="cd-i-det">${item.color?'Color: '+item.color:''} · ${fmt(item.p)}</div>
          <div class="cd-i-ctrl">
            <button onclick="cambiarCantidad('${item.id}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="cambiarCantidad('${item.id}',1)">+</button>
            <button onclick="eliminarItem('${item.id}')" class="cd-i-del">Eliminar</button>
          </div>
        </div>`;
      body.appendChild(el);
    });
    subtotal.textContent = fmt(subt);
  }

  function toggleCart(){
    const panel=$('#cdPanel'), ov=$('#cdOverlay');
    if(!panel||!ov) return;
    const abierto = panel.classList.contains('open');
    if(abierto){ panel.classList.remove('open'); ov.classList.remove('open'); document.body.classList.remove('noscroll'); }
    else { renderCarrito(); panel.classList.add('open'); ov.classList.add('open'); document.body.classList.add('noscroll'); }
  }

  function toggleMM(){
    const mm=$('#mm');
    if(!mm) return;
    mm.classList.toggle('open');
  }
  function closeMM(){
    const mm=$('#mm');
    if(!mm) return;
    mm.classList.remove('open');
  }

  function buildWhatsApp(){
    if(estado.carrito.length===0){
      alert('Tu carrito está vacío. Agrega productos antes de pedir.');
      return;
    }
    let msg = `Hola SAVIA, quiero realizar un pedido:%0A%0A`;
    let subt=0;
    estado.carrito.forEach(item=>{
      subt += item.p*item.qty;
      msg += `- ${item.n} × ${item.qty} ${item.color?`(color: ${item.color})`:''} — ${fmt(item.p*item.qty)}%0A`;
    });
    msg += `%0A*Subtotal:* ${fmt(subt)}%0A%0AQuisiera proceder con el pago contra entrega.`;
    const wa = cfg.tienda && cfg.tienda.whatsappPedidos ? cfg.tienda.whatsappPedidos : '573007579993';
    location.href = `https://wa.me/${wa}?text=${msg}`;
  }

  // Renderizar grid de productos
  function renderProductos(){
    const grid = $('#productGrid');
    if(!grid) return;
    const filtro = (estado.filtroCat||'').toLowerCase();
    const busca = (estado.busqueda||'').toLowerCase();
    const lista = catalogo.filter(p=>{
      const catOk = !filtro || p.cat===filtro || p.linea.toLowerCase().includes(filtro);
      const busOk = !busca || p.n.toLowerCase().includes(busca) || p.desc.toLowerCase().includes(busca);
      return catOk && busOk;
    });
    const inicio = (estado.pagina-1)*estado.porPagina;
    const slice = lista.slice(inicio, inicio+estado.porPagina);
    grid.innerHTML='';
    slice.forEach(p=>{
      const etiqueta = p.destacado?'Destacado':p.nuevo?'Nuevo':'';
      const dtext = dtoText(p.p, p.pOrig);
      const el=document.createElement('article');
      el.className='nvc-card';
      el.onclick=()=>location.href=`producto.html?id=${p.id}`;
      el.innerHTML = `
        <div class="nvc-card__media">
          <img src="${p.imgs[0]}" alt="${p.n}" loading="lazy">
          ${p.destacado||p.nuevo?`<span class="nvc-badge">${etiqueta}</span>`:''}
        </div>
        <div class="nvc-card__body">
          <h3 class="nvc-card__title"><a href="producto.html?id=${p.id}">${p.n}</a></h3>
          <p class="nvc-card__benefit">${p.desc}</p>
          <div class="nvc-card__price">${fmt(p.p)}${p.pOrig?' <ant>'+fmt(p.pOrig)+'</ant>':''}</div>
          <a class="nvc-card__cta" href="producto.html?id=${p.id}">Ver oferta${dtext?' · '+dtext:''}</a>
        </div>`;
      grid.appendChild(el);
    });
    $('#productsCount') && ($('#productsCount').textContent = lista.length+' productos');
    $('#btnCargarMas') && ($('#btnCargarMas').style.display = (inicio+estado.porPagina >= lista.length)?'none':'inline-flex');
  }

  function cargarMas(){ estado.pagina++; renderProductos(); }

  // Scroll del carrusel
  function scrollTrack(id, dir){
    const track = document.getElementById(id);
    if(!track) return;
    const scrollAmount = track.clientWidth * 0.7;
    track.scrollBy({left: scrollAmount * dir, behavior: 'smooth'});
  }

  // ============ Categorías (burbujas estilo nevora) ============
  const CATEGORIAS = [
    {id:'limpieza', n:'Limpieza facial', icon:'🧼'},
    {id:'hidratacion', n:'Hidratación', icon:'💧'},
    {id:'tratamiento', n:'Tratamientos', icon:'✨'},
    {id:'proteccion', n:'Protección solar', icon:'☀️'},
    {id:'cuidado', n:'Cuidado complementario', icon:'🌿'},
    {id:'kits', n:'Kits y rutinas', icon:'🎁'}
  ];

  function renderCategorias(){
    const track = $('#catsTrack');
    if(!track) return;
    track.innerHTML='';
    CATEGORIAS.forEach(c=>{
      const active = estado.filtroCat === c.id ? 'on' : '';
      const el=document.createElement('button');
      el.className='bub'+(active?' on':'');
      el.innerHTML = `
        <div class="bp" style="background-image:url('img/p/${c.id}.svg')">${c.icon}</div>
        <div class="bl">${c.n}</div>`;
      el.onclick=()=>{
        estado.filtroCat = c.id;
        estado.pagina = 1;
        document.querySelectorAll('#catsTrack .bub').forEach(b=>b.classList.remove('on'));
        el.classList.add('on');
        renderProductos();
        window.scrollTo({top:document.getElementById('tienda').offsetTop-100, behavior:'smooth'});
      };
      track.appendChild(el);
    });
  }

  // ============ Carrusel (nevora carsec) ============
  function renderCarruseles(){
    const tracks = document.querySelectorAll('.ctrack[id^="car"]');
    tracks.forEach((track, i)=>{
      const start = i * 6;
      const slice = catalogo.slice(start, start + 6);
      track.innerHTML='';
      slice.forEach(p=>{
        const el=document.createElement('div');
        el.className='cari';
        el.onclick=()=>location.href=`producto.html?id=${p.id}`;
        el.innerHTML = `
          <div class="cfr">
            <img src="${p.imgs[0]}" alt="${p.n}" loading="lazy">
          </div>
          <div class="cov">
            <b>${p.n}</b>
            <span>${fmt(p.p)}</span>
          </div>`;
        track.appendChild(el);
      });
    });
  }

  // Filtros y búsqueda
  function setupFiltros(){
    const input=$('#searchInput');
    if(input){
      input.addEventListener('input',(e)=>{ estado.busqueda=e.target.value; estado.pagina=1; renderProductos(); });
    }
    // filtros por categoría desde URL ?cat=
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if(cat){ estado.filtroCat = cat; estado.pagina=1; }
  }

  // Inicialización
  document.addEventListener('DOMContentLoaded',()=>{
    actualizarBadge();
    setupFiltros();
    renderProductos();
    renderCategorias();
    renderCarruseles();
    $('#cartBtn') && $('#cartBtn').addEventListener('click',(e)=>{e.preventDefault();toggleCart();});
    $('#cdCheckout') && $('#cdCheckout').addEventListener('click',(e)=>{e.preventDefault();buildWhatsApp();});
    $('#mmToggle') && $('#mmToggle').addEventListener('click',toggleMM);
    window.cambiarCantidad=cambiarCantidad;
    window.eliminarItem=eliminarItem;
    window.agregarAlCarrito=agregarAlCarrito;
  });

  // Exponer para uso inline en producto.html
  window.estadoCarrito = estado;
  window.fmt = fmt;
  window.toggleMM = toggleMM;
  window.closeMM = closeMM;
})();
