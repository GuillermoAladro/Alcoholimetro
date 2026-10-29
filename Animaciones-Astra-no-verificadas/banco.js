"use strict";
const BANCO=[];
function registrar(a){
 if(!a||!/^\d{5}$/.test(a.id)||!a.nombre||typeof a.crear!=="function")throw Error('Registro inválido');
 if(BANCO.some(b=>b.id===a.id))throw Error('ID repetido: '+a.id);
 BANCO.push(a);BANCO.sort((a,b)=>a.id.localeCompare(b.id));
}
