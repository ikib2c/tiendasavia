// Catálogo de productos SAVIA (versión estática para tiendasavia).
// Cada producto puede publicar uno o más COLORES asociados (envase/variante)
// que el cliente puede personalizar en su página de producto.
// Estructura: { id, n, p, pOrig, cat, linea, imgs, var: { Color: [nombres] }, color: { nombre: hex }, sku, desc, ingredientes, uso, beneficios, destacado, nuevo, dto }
window.CATALOGO_SAVIA = [
    {
        id: "p01", n: "Limpiador Facial Botánico SAVIA CLEANSE", p: 59900, pOrig: 74900, cat: "limpieza", linea: "SAVIA CLEANSE",
        imgs: ["img/p/limpiador-savia.svg"],
        var: { Color: ["Verde SAVIA", "Arena", "Marfil"] },
        color: { "Verde SAVIA": "#536B50", Arena: "#C6A98B", Marfil: "#F4EFE5" },
        sku: "SAV-CL-001",
        desc: "Limpiador facial suave que elimina impurezas sin resecar, ideal para iniciar tu rutina diaria de cuidado.",
        ingredientes: "Aloe vera, extracto de té verde, glicerina vegetal.",
        uso: "Aplicar sobre piel húmeda con movimientos circulares. Enjuagar con agua tibia. Uso mañana y noche.",
        beneficios: ["Limpieza profunda sin resequedad", "Piel fresca y equilibrada", "Apto para uso diario"],
        destacado: true, nuevo: false, dto: 20
    },
    {
        id: "p02", n: "Crema Hidratante SAVIA HYDRATE", p: 79900, pOrig: 94900, cat: "hidratacion", linea: "SAVIA HYDRATE",
        imgs: ["img/p/crema-hidratante.svg"],
        var: { Color: ["Verde SAVIA", "Arena", "Marfil"] },
        color: { "Verde SAVIA": "#536B50", Arena: "#C6A98B", Marfil: "#F4EFE5" },
        sku: "SAV-HY-001",
        desc: "Crema hidratante de textura ligera que restaura la barrera cutánea y brinda luminosidad duradera.",
        ingredientes: "Ácido hialurónico, niacinamida, ceramidas.",
        uso: "Aplicar sobre rostro limpio y seco, mañana y noche, con suaves toques hasta absorber.",
        beneficios: ["Hidratación 24h", "Refuerza la barrera cutánea", "Textura ligera de rápida absorción"],
        destacado: true, nuevo: false, dto: 16
    },
    {
        id: "p03", n: "Sérum Antioxidante SAVIA SERUM", p: 99900, pOrig: 124900, cat: "tratamiento", linea: "SAVIA SERUM",
        imgs: ["img/p/serum-antioxidante.svg"],
        var: { Color: ["Verde SAVIA", "Arena", "Marfil"] },
        color: { "Verde SAVIA": "#536B50", Arena: "#C6A98B", Marfil: "#F4EFE5" },
        sku: "SAV-SE-001",
        desc: "Sérum concentrado con vitamina C y extractos botánicos que iluminan y protegen la piel del estrés oxidativo.",
        ingredientes: "Vitamina C, ácido ferúlico, extracto de granada.",
        uso: "Aplicar 3-4 gotas sobre rostro limpio antes de la crema hidratante, por la mañana.",
        beneficios: ["Ilumina y unifica el tono", "Protección antioxidante", "Textura ligera de rápida absorción"],
        destacado: true, nuevo: true, dto: 20
    },
    {
        id: "p04", n: "Protector Solar SAVIA PROTECT", p: 89900, pOrig: 114900, cat: "proteccion", linea: "SAVIA PROTECT",
        imgs: ["img/p/protector-solar.svg"],
        var: { Color: ["Verde SAVIA", "Arena", "Marfil"] },
        color: { "Verde SAVIA": "#536B50", Arena: "#C6A98B", Marfil: "#F4EFE5" },
        sku: "SAV-PR-001",
        desc: "Protector solar de amplio espectro con acabado mate, ideal para usar como último paso de tu rutina diurna.",
        ingredientes: "Filtros UVA/UVB, vitamina E, aloe vera.",
        uso: "Aplicar generosamente 15 minutos antes de la exposición solar. Reaplicar cada 2 horas.",
        beneficios: ["Protección UVA/UVB", "Acabado mate sin brillos", "No obstruye los poros"],
        destacado: false, nuevo: false, dto: 22
    },
    {
        id: "p05", n: "Mascarilla Facial SAVIA CARE", p: 69900, pOrig: 84900, cat: "cuidado", linea: "SAVIA CARE",
        imgs: ["img/p/mascarilla-facial.svg"],
        var: { Color: ["Verde SAVIA", "Arena", "Marfil"] },
        color: { "Verde SAVIA": "#536B50", Arena: "#C6A98B", Marfil: "#F4EFE5" },
        sku: "SAV-CA-001",
        desc: "Mascarilla facial semanal que nutre y revitaliza la piel, devolviéndole su mejor esencia.",
        ingredientes: "Arcilla verde, manzanilla, aceite de jojoba.",
        uso: "Aplicar una capa uniforme sobre rostro limpio. Dejar actuar 10-15 minutos y enjuagar. 1-2 veces por semana.",
        beneficios: ["Nutrición intensiva", "Revitaliza la piel opaca", "Textura cremosa y suave"],
        destacado: false, nuevo: false, dto: 18
    },
    {
        id: "p06", n: "Kit Rutina Esencial SAVIA", p: 179900, pOrig: 219900, cat: "kits", linea: "SAVIA CLEANSE",
        imgs: ["img/p/kit-esencial.svg"],
        var: { Color: ["Verde SAVIA", "Arena", "Marfil"] },
        color: { "Verde SAVIA": "#536B50", Arena: "#C6A98B", Marfil: "#F4EFE5" },
        sku: "SAV-KT-001",
        desc: "Rutina completa de cuidado facial: limpiador, crema hidratante y sérum antioxidante en un solo kit.",
        ingredientes: "Ver ficha de cada producto incluido.",
        uso: "Seguir el modo de uso de cada producto del kit.",
        beneficios: ["Rutina completa en un solo pedido", "Ahorro frente a compra individual", "Empaque listo para regalar"],
        destacado: true, nuevo: true, dto: 18
    }
];
