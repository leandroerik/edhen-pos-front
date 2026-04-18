import React, { useState } from 'react';
import styles from './Catalogo.module.css';
import CategoriesPage from './categorias';
import ProductsPage from './productos';
import AttributesPage from './atributos';
import OffersPage from './ofertas';
import { CATALOGO_SECTIONS } from './utils/catalogoConfig';

/**
 * Componente principal del Catálogo
 * Actúa como contenedor de secciones: Categorías, Productos, Atributos, Ofertas
 * @component
 */
const Catalogo = () => {
  const [seccionActual, setSeccionActual] = useState('categorias');

  const sectionComponents = {
    categorias: CategoriesPage,
    productos: ProductsPage,
    atributos: AttributesPage,
    ofertas: OffersPage
  };

  const ComponenteActual = sectionComponents[seccionActual] || CategoriesPage;

  return (
    <div className={`container-fluid ${styles.catalogoContainer}`}>
      <div className={`d-flex justify-content-between align-items-center mb-4 ${styles.header}`}>
        <div>
          <h1 className="h3">
            <i className="fa fa-cube me-2"></i>
            Catálogo
          </h1>
          <p className="text-muted mb-0">Gestión de productos, categorías y atributos</p>
        </div>
      </div>

      <div className={`mb-4 ${styles.secciones}`}>
        <div className="btn-group" role="group">
          {CATALOGO_SECTIONS.map((seccion) => (
            <button
              key={seccion.id}
              onClick={() => setSeccionActual(seccion.id)}
              className={`btn ${seccionActual === seccion.id ? 'btn-primary' : 'btn-outline-primary'}`}
            >
              <i className={`fa ${seccion.icon} me-2`}></i>
              {seccion.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.contenido}>
        <ComponenteActual />
      </div>
    </div>
  );
};

export default Catalogo;