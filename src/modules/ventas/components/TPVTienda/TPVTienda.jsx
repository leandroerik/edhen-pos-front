import React from 'react';
import { TPVBase } from '../../../../shared/components/TPV';

const TPVTienda = () => {
  return (
    <TPVBase
      pageTitle="TPV - Terminal de Punto de Venta (Tienda Física)"
      pageDescription="Interfaz de ventas rápida y eficiente para punto de venta en tienda. Usa el escáner o busca productos."
      historyLink="/ventas/historial"
      isOnline={false}
    />
  );
};

export default TPVTienda;
