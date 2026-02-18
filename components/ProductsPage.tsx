
import React, { useState } from 'react';
import type { Product } from '../types';

interface ProductsPageProps {
  products: Product[];
  onAddProduct: (productData: Omit<Product, 'id'>) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ products, onAddProduct }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: name === 'price' ? Number(value) : value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.description && newProduct.price > 0) {
      onAddProduct(newProduct);
      setNewProduct({ name: '', description: '', price: 0 });
      setIsAdding(false);
    } else {
      alert("Todos los campos son obligatorios y el precio debe ser mayor a cero.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Catálogo de Productos y Servicios</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
        >
          {isAdding ? 'Cancelar' : 'Agregar Nuevo Producto'}
        </button>
      </div>
      
      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Nuevo Producto/Servicio</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                <input name="name" value={newProduct.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Precio</label>
                <input name="price" type="number" value={newProduct.price} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
              <textarea name="description" value={newProduct.description} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition shadow-sm">
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Productos Guardados</h2>
        <div className="space-y-4">
          {products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                </div>
                <p className="font-semibold text-gray-800 text-right flex-shrink-0 ml-4">{formatCurrency(product.price)}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No hay productos o servicios guardados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
