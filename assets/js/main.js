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
    $('#fabBadge') && ($('#fabBadge').textContent = total);
  }

  function agregarAlCarrito(id, qty=1, color=null){
    const p = catalogo.find(x=>x.id===id);
    if(!p) return;
    const selColor = color || Object.keys(p.color||{})[0] || '';
    const existente = estado.carrito.find(i=>i.id===id && i.color===selColor);
    if(existente) existente.qty += qty;
    else estado.carrito.push({id:p.id,n:p.n,p:p.p,img:(p.imgs&&p.imgs[0])||'',qty,color:selColor});
    guardar();
    // feedback visual solo si el botón existe (producto.html)
    const btn = $('#btnAdd');
    if(btn){ const txt=btn.textContent; btn.textContent='Agregado'; btn.classList.add('adding'); setTimeout(()=>{btn.textContent=txt; btn.classList.remove('adding');},900); }
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
    // botón vaciar carrito al final del total
    const exists = $('#cdVaciar');
    if(!exists && totalBox){
      const vaciar=document.createElement('button');
      vaciar.id='cdVaciar';
      vaciar.className='btn ghost';
      vaciar.style.width='100%';
      vaciar.style.marginTop='10px';
      vaciar.textContent='Vaciar carrito';
      vaciar.onclick=()=>{ estado.carrito=[]; guardar(); renderCarrito(); };
      totalBox.appendChild(vaciar);
    }
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
          <button class="btn-cod" onclick="abrirCOD('${p.id}')">Pedir contra entrega</button>
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

  // ============ Formulario COD clon Releasit nevora ============
  let codProductoId = null;
  let codColor = '';
  let codUpsellIds = new Set();

  function codCantidadActual(){
    const inp = document.getElementById('codCantidad');
    return inp ? Math.max(1, parseInt(inp.value)||1) : 1;
  }
  function codEnvioActual(){
    const radio = document.querySelector('input[name="shippingRate"]:checked');
    return radio && radio.value === 'prioritario' ? 5000 : 0;
  }

  function actualizarTotalesCOD(){
    const p = catalogo.find(x=>x.id===codProductoId);
    if(!p) return;
    const cantidad = codCantidadActual();
    const subtotal = p.p * cantidad;
    let descuentos = 0;
    if(p.pOrig && p.pOrig > p.p) descuentos = (p.pOrig - p.p) * cantidad;
    let upsellsSum = 0;
    codUpsellIds.forEach(uid=>{
      const up = catalogo.find(x=>x.id===uid);
      if(up) upsellsSum += up.p;
    });
    const envio = codEnvioActual();
    const total = subtotal + upsellsSum + envio;

    const qty = document.getElementById('codProdQty');
    if(qty) qty.textContent = cantidad;
    const sub = document.getElementById('codSubtotal');
    if(sub) sub.textContent = fmt(subtotal + upsellsSum);
    const rowDesc = document.getElementById('codRowDesc');
    const desc = document.getElementById('codDescuentos');
    if(rowDesc && desc){
      if(descuentos > 0){ rowDesc.style.display='flex'; desc.textContent = '-' + fmt(descuentos); }
      else rowDesc.style.display='none';
    }
    const env = document.getElementById('codEnvio');
    if(env) env.textContent = envio > 0 ? fmt(envio) : 'Gratis';
    const tot = document.getElementById('codTotal');
    if(tot) tot.textContent = fmt(total);
  }

  function abrirCOD(id){
    const p = catalogo.find(x=>x.id===id);
    if(!p) return;
    codProductoId = id;
    codColor = Object.keys(p.color||{})[0] || '';
    codUpsellIds = new Set();

    // Resumen del producto (clon Releasit)
    const img = document.getElementById('codProdImg');
    if(img) img.style.backgroundImage = `url('${p.imgs[0]}')`;
    const nom = document.getElementById('codProdName');
    if(nom) nom.textContent = p.n;
    const orig = document.getElementById('codProdOrig');
    if(orig) orig.textContent = (p.pOrig && p.pOrig > p.p) ? fmt(p.pOrig) : '';
    const fin = document.getElementById('codProdFinal');
    if(fin) fin.textContent = fmt(p.p);
    const qtyBadge = document.getElementById('codProdQty');
    if(qtyBadge) qtyBadge.textContent = '1';

    // Reset campos
    const campos = ['codNombre','codApellido','codTelefono','codDireccion','codCiudad','codNota'];
    campos.forEach(c=>{ const el=document.getElementById(c); if(el) el.value=''; });
    const depto = document.getElementById('codDepartamento');
    if(depto) depto.value='';
    const cant = document.getElementById('codCantidad');
    if(cant) cant.value = 1;
    const shipGratis = document.querySelector('input[name="shippingRate"][value="gratis"]');
    if(shipGratis) shipGratis.checked = true;

    const colorSel = document.getElementById('codColor');
    colorSel.innerHTML='';
    Object.entries(p.color||{}).forEach(([nombre,hex])=>{
      const o=document.createElement('option');
      o.value=nombre;
      o.textContent=nombre;
      if(nombre===codColor) o.selected=true;
      colorSel.appendChild(o);
    });

    // Upsells: productos relacionados (misma categoría, excluyendo el actual)
    const upsells = document.getElementById('codUpsells');
    upsells.innerHTML='';
    const relacionados = catalogo.filter(x=>x.cat===p.cat && x.id!==id).slice(0,3);
    relacionados.forEach(r=>{
      const item=document.createElement('div');
      item.className='cod-upsell-item';
      item.innerHTML = `
        <input type="checkbox" id="upsell-${r.id}" value="${r.id}">
        <div class="cod-upsell-img">📦</div>
        <div class="cod-upsell-info">
          <span class="cod-upsell-tit">${r.n}</span>
          <span class="cod-upsell-pre">${fmt(r.p)}</span>
        </div>
      `;
      const chk = item.querySelector('input');
      chk.onchange=(e)=>{
        if(e.target.checked) codUpsellIds.add(r.id); else codUpsellIds.delete(r.id);
        actualizarTotalesCOD();
      };
      upsells.appendChild(item);
    });

    actualizarTotalesCOD();

    const overlay=$('#codOverlay'), modal=$('#codModal');
    if(overlay&&modal){ overlay.classList.add('open'); modal.classList.add('open'); document.body.classList.add('noscroll'); }
  }

  function cerrarCOD(){
    const overlay=$('#codOverlay'), modal=$('#codModal');
    if(overlay&&modal){ overlay.classList.remove('open'); modal.classList.remove('open'); document.body.classList.remove('noscroll'); }
  }

  function enviarCOD(){
    const nombre=document.getElementById('codNombre').value.trim();
    const apellido=document.getElementById('codApellido').value.trim();
    const telefono=document.getElementById('codTelefono').value.trim();
    const direccion=document.getElementById('codDireccion').value.trim();
    const departamento=document.getElementById('codDepartamento').value;
    const ciudad=document.getElementById('codCiudad').value.trim();
    const nota=document.getElementById('codNota').value.trim();
    const color=document.getElementById('codColor').value;
    const cantidad=codCantidadActual();

    if(!nombre||!apellido||!telefono||!direccion||!departamento||!ciudad){
      alert('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    const p = catalogo.find(x=>x.id===codProductoId);
    if(!p) return;

    const envio = codEnvioActual();
    const envioTxt = envio > 0 ? fmt(envio) : 'Gratis';
    const envioNombre = envio > 0 ? 'Envío prioritario' : 'Envío gratis';
    let upsellsSum = 0;
    let upsellsTxt = '';
    if(codUpsellIds.size > 0){
      codUpsellIds.forEach(uid=>{
        const up=catalogo.find(x=>x.id===uid);
        if(up){ upsellsTxt += `- ${up.n} — ${fmt(up.p)}%0A`; upsellsSum += up.p; }
      });
    }
    const subtotal = p.p * cantidad + upsellsSum;
    let descuentos = 0;
    if(p.pOrig && p.pOrig > p.p) descuentos = (p.pOrig - p.p) * cantidad;
    const total = subtotal + envio;

    const wa = cfg.tienda && cfg.tienda.whatsappPedidos ? cfg.tienda.whatsappPedidos : '573007579993';
    let texto = `*Nuevo pedido COD — SAVIA*%0A%0A`;
    texto += `*Cliente:* ${nombre} ${apellido}%0A`;
    texto += `*Celular / WhatsApp:* ${telefono}%0A`;
    texto += `*Dirección:* ${direccion}%0A`;
    texto += `*Departamento:* ${departamento}%0A`;
    texto += `*Ciudad:* ${ciudad}%0A`;
    if(nota) texto += `*Referencia:* ${nota}%0A`;
    texto += `%0A*Producto:* ${p.n}%0A`;
    texto += `*Color:* ${color}%0A`;
    texto += `*Cantidad:* ${cantidad}%0A`;
    texto += `*Precio unitario:* ${fmt(p.p)}%0A`;
    if(upsellsTxt){
      texto += `%0A*Productos adicionales:*%0A${upsellsTxt}`;
    }
    texto += `%0A*Subtotal:* ${fmt(subtotal)}%0A`;
    if(descuentos > 0) texto += `*Descuentos:* -${fmt(descuentos)}%0A`;
    texto += `*${envioNombre}:* ${envioTxt}%0A`;
    texto += `*TOTAL:* ${fmt(total)}%0A%0A`;
    texto += `*Método de pago:* Contra entrega%0A%0A`;
    texto += `Al confirmar, me comprometo a recibir y pagar mi pedido en la entrega.`;

    location.href = `https://wa.me/${wa}?text=${texto}`;
    cerrarCOD();
    codUpsellIds = new Set();
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

  // ============ Completa tu rutina (clon nvrx nevora) ============
  function renderNvrx(){
    const track = $('#nvrxTrack');
    if(!track) return;
    const params = new URLSearchParams(location.search);
    const pid = params.get('id');
    const actual = catalogo.find(p=>p.id===pid);
    if(!actual) return;

    // Relacionados: misma categoría primero, luego otras (máx 4)
    let rel = catalogo.filter(p=>p.id!==actual.id && p.cat===actual.cat);
    if(rel.length < 4){
      const extra = catalogo.filter(p=>p.id!==actual.id && p.cat!==actual.cat);
      rel = rel.concat(extra);
    }
    rel = rel.slice(0,4);

    track.innerHTML='';
    rel.forEach((p,i)=>{
      const dtext = dtoText(p.p, p.pOrig);
      const ahorro = (p.pOrig && p.pOrig>p.p) ? p.pOrig-p.p : 0;
      const card=document.createElement('article');
      card.className='nvrx-card'+(i===0?' is-featured':'');
      card.innerHTML = `
        <a class="nvrx-media" href="producto.html?id=${p.id}" aria-label="Ver ${p.n}">
          ${p.destacado?`<span class="nvrx-badge">MÁS VENDIDO</span>`:p.nuevo?`<span class="nvrx-badge">NUEVO</span>`:''}
          ${dtext?`<span class="nvrx-discount">${dtext}</span>`:''}
          <img src="${p.imgs[0]}" alt="${p.n}" loading="lazy">
        </a>
        <div class="nvrx-body">
          <p class="nvrx-kicker">COMPLETA TU RUTINA</p>
          <h3><a href="producto.html?id=${p.id}">${p.n}</a></h3>
          <p class="nvrx-benefit">${p.desc}</p>
          <div class="nvrx-price-row">
            <div class="nvrx-price">${fmt(p.p)}${p.pOrig?` <s>${fmt(p.pOrig)}</s>`:''}</div>
            ${ahorro>0?`<span class="nvrx-saving">Ahorras ${fmt(ahorro)}</span>`:''}
          </div>
          <a class="nvrx-cta" href="producto.html?id=${p.id}"><span>Añadir a mi rutina</span><b>→</b></a>
        </div>`;
      track.appendChild(card);
    });

    // Controles prev/next
    const prev = document.querySelector('.nvrx-controls [data-prev]');
    const next = document.querySelector('.nvrx-controls [data-next]');
    if(prev) prev.onclick=()=>track.scrollBy({left:-track.clientWidth*0.8,behavior:'smooth'});
    if(next) next.onclick=()=>track.scrollBy({left:track.clientWidth*0.8,behavior:'smooth'});
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
    renderNvrx();
    $('#cartBtn') && $('#cartBtn').addEventListener('click',(e)=>{e.preventDefault();toggleCart();});
    $('#cdCheckout') && $('#cdCheckout').addEventListener('click',(e)=>{e.preventDefault();buildWhatsApp();});
    $('#mmToggle') && $('#mmToggle').addEventListener('click',toggleMM);
    window.cambiarCantidad=cambiarCantidad;
    window.eliminarItem=eliminarItem;
    window.agregarAlCarrito=agregarAlCarrito;
    window.abrirCOD=abrirCOD;
    window.cerrarCOD=cerrarCOD;
    window.enviarCOD=enviarCOD;
    window.actualizarTotalesCOD=actualizarTotalesCOD;
    $('#codBtnEnviar') && $('#codBtnEnviar').addEventListener('click',enviarCOD);
    // Totales en vivo: cantidad y método de envío
    const codCant = $('#codCantidad');
    if(codCant) codCant.addEventListener('input',actualizarTotalesCOD);
    document.querySelectorAll('input[name="shippingRate"]').forEach(r=>{
      r.addEventListener('change',actualizarTotalesCOD);
    });
  });

  // Exponer para uso inline en producto.html
  window.estadoCarrito = estado;
  window.fmt = fmt;
  window.toggleMM = toggleMM;
  window.closeMM = closeMM;
})();
